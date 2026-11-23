/*
  로컬 개발용: 빌드한 dist를 옆 폴더 사이트들의 node_modules/@jji/ui 에 바로 복사
  → 각 사이트의 jji-dev가 감지해서 dev 서버 자동 재시작
  (배포용 반영은 태그 push 후 각 사이트에서 npm run ui:update)
*/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITES = ['ne-frontend', 'space-frontend', 'mo-frontend', 'JJI-frontend']

for (const site of SITES) {
  const target = path.resolve(root, '..', site, 'node_modules/@jji/ui')
  if (!fs.existsSync(target)) continue
  fs.rmSync(path.join(target, 'dist'), { recursive: true, force: true })
  fs.cpSync(path.join(root, 'dist'), path.join(target, 'dist'), { recursive: true })
  fs.copyFileSync(path.join(root, 'package.json'), path.join(target, 'package.json'))
  console.log(`synced → ${site}`)
}
