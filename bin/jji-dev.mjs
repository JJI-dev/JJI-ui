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

const start = () => {
  child = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' })
  child.on('exit', code => {
    if (restarting) return
    process.exit(code ?? 0)
  })
}

const restart = reason => {
  if (!child) return start()
  restarting = true
  console.log(`\n${tag} ${reason} → dev 서버 재시작\n`)
  child.once('exit', () => { restarting = false; start() })
  child.kill('SIGTERM')
  setTimeout(() => { if (restarting) child.kill('SIGKILL') }, 5000)
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
  process.on(sig, () => { restarting = true; child?.kill(sig); process.exit(0) })
}

console.log(`${tag} 자동 재시작 감시 중 (@jji/ui, package.json, .env, next.config)`)
start()
