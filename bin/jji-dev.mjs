#!/usr/bin/env node
/*
  jji-dev — dev 서버 자동 재시작 실행기
  사용: package.json  "dev": "jji-dev next dev --webpack -p 3004"

  아래 파일이 바뀌면 dev 서버를 자동으로 재시작합니다.
  (Next dev는 node_modules·.env·next.config 변경을 반영하지 못해 재시작이 필요)
    - node_modules/@jji/ui  (공통 패키지 업데이트 / jji-ui의 npm run sync)
    - package.json, package-lock.json
    - .env*, next.config.*
  일반 소스(src/) 수정은 Next가 원래대로 바로 반영합니다.
*/
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const cmd = process.argv.slice(2)
if (!cmd.length) {
  console.error('사용법: jji-dev <명령>   예) jji-dev next dev -p 3000')
  process.exit(1)
}

const cwd = process.cwd()
const FILES = [
  'package.json', 'package-lock.json',
  '.env', '.env.local', '.env.development', '.env.development.local',
  'next.config.js', 'next.config.mjs', 'next.config.ts',
  'node_modules/@jji/ui/package.json',
]
const DIRS = ['node_modules/@jji/ui/dist']

const stamp = p => {
  try { const s = fs.statSync(path.join(cwd, p)); return `${s.mtimeMs}:${s.size}` } catch { return '-' }
}
const signature = () => {
  const parts = FILES.map(f => `${f}=${stamp(f)}`)
  for (const d of DIRS) {
    let names = []
    try { names = fs.readdirSync(path.join(cwd, d)).sort() } catch {}
    parts.push(`${d}=${names.map(n => `${n}@${stamp(path.join(d, n))}`).join(',') || '-'}`)
  }
  return parts.join('|')
}

let child = null
let restarting = false
const tag = '\x1b[35m[jji-dev]\x1b[0m'

// 경로에 한글 등 비ASCII 문자가 있으면 (예: ~/Documents/코딩/...) macOS 파일 감시가 일부 변경(CSS 등)을
// 놓치는 문제가 있어, webpack 감시를 폴링 방식으로 전환 (끄려면 WATCHPACK_POLLING=false)
const env = { ...process.env }
if (/[^\x00-\x7F]/.test(cwd) && env.WATCHPACK_POLLING === undefined) {
  env.WATCHPACK_POLLING = 'true'
  console.log(`${'\x1b[35m[jji-dev]\x1b[0m'} 경로에 비ASCII 문자 → 파일 감시 폴링 모드 (WATCHPACK_POLLING=true)`)
}

const isWin = process.platform === 'win32'
// next dev는 실제 서버를 자식 프로세스로 따로 띄움 → 프로세스 그룹 전체를 종료해야 포트가 풀림
const killTree = sig => {
  if (!child?.pid) return
  try { isWin ? child.kill(sig) : process.kill(-child.pid, sig) } catch {}
}

let retries = 0
let startedAt = 0
const start = () => {
  startedAt = Date.now()
  child = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit', env, shell: isWin, detached: !isWin })
  child.on('exit', code => {
    if (restarting) return
    // 재시작 직후 실패(이전 서버가 포트를 아직 안 놓음 등) → 잠시 후 재시도
    if (code && retries > 0 && Date.now() - startedAt < 15000) {
      retries--
      console.log(`\n${tag} 시작 실패 → 잠시 후 다시 시도\n`)
      setTimeout(start, 1500)
      return
    }
    process.exit(code ?? 0)
  })
}

const restart = reason => {
  if (!child) return start()
  restarting = true
  console.log(`\n${tag} ${reason} → dev 서버 재시작\n`)
  const prev = child
  prev.once('exit', () => {
    // 손자 프로세스가 포트를 놓을 시간을 잠깐 줌
    setTimeout(() => { restarting = false; retries = 3; start() }, 800)
  })
  killTree('SIGTERM')
  setTimeout(() => { if (restarting && child === prev) killTree('SIGKILL') }, 5000)
}

let last = signature()
let pending = null
setInterval(() => {
  const now = signature()
  if (now === last) return
  last = now
  // npm install 중엔 파일이 잠깐 사라졌다 생기므로, 잠잠해질 때까지 기다렸다 재시작
  clearTimeout(pending)
  pending = setTimeout(() => {
    // 패키지가 아직 설치 중(파일 없음)이면 대기 → 설치 완료 시점의 변경으로 재시작
    if (!fs.existsSync(path.join(cwd, 'node_modules/@jji/ui/dist/index.js'))) return
    restart('변경 감지')
  }, 1500)
}, 1000)

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { restarting = true; killTree(sig); process.exit(0) })
}

console.log(`${tag} 자동 재시작 감시 중 (@jji/ui, package.json, .env, next.config)`)
start()
