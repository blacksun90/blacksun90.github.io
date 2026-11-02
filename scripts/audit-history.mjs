// 공개 전환 전 게이트: git 전체 이력(모든 커밋의 diff)을 공개 금지 패턴으로 훑는다.
// 작업 트리만 보는 check-public 과 달리, 지웠더라도 이력에 남은 것을 찾는다.
//
//   node scripts/audit-history.mjs            # 요약
//   node scripts/audit-history.mjs --verbose  # 커밋·파일·줄까지
//
// 패턴은 check-public 과 같다(일반 패턴 + ../portfolio-raw/check-patterns.json). 종료 코드: 적발 1건 이상이면 1.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const GENERIC = [
  [/01[016789]-?\d{3,4}-?\d{4}/, '휴대폰 번호'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, 'IP 주소'],
  [/[A-Za-z0-9._%+-]+@gmail\.com/i, 'Gmail 주소'],
  [/\b(?:19|20)\d{2}\s*년생|\(\d{2}세\)/, '생년·나이'],
  [/s3:\/\/|arn:aws:/i, 'S3·AWS 식별자'],
  [new RegExp('[A-Za-z]:[' + String.fromCharCode(92) + '/](?:Users|ws|admin)[' + String.fromCharCode(92) + '/]'), '로컬 절대 경로'],
  [/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/, 'GitHub 토큰'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'GitHub 토큰'],
]
function loadPrivate() {
  const f = resolve(process.cwd(), '..', 'portfolio-raw', 'check-patterns.json')
  if (!existsSync(f)) return []
  return JSON.parse(readFileSync(f, 'utf8')).map(([src, label]) => [new RegExp(src, 'i'), label])
}
const PATTERNS = [...GENERIC, ...loadPrivate()]
const ALLOW = new Set(['0.0.0.0', '127.0.0.1'])
// check-public 과 같은 예외: 잠금 파일·검사 스크립트 자체(패턴 원문 포함)·바이너리 자산
const SKIP = /^(?:package-lock\.json|scripts\/(?:check-public|audit-history)\.mjs|public\/data\/.*|.*\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|mp4))$/i
const verbose = process.argv.includes('--verbose')

// 커밋별 diff(추가된 줄만). 바이너리는 내용 대신 파일명만 본다.
const log = execSync('git log --all -p --no-color --unified=0 --format="@@@COMMIT %h %s"', { encoding: 'utf8', maxBuffer: 1 << 28 })
let commit = ''
let file = ''
const hits = []
const binaries = new Set()
for (const raw of log.split(/\r?\n/)) {
  if (raw.startsWith('@@@COMMIT ')) { commit = raw.slice(10); continue }
  if (raw.startsWith('diff --git ')) { file = raw.replace(/^diff --git a\/.* b\//, ''); continue }
  if (raw.startsWith('+++ ')) continue
  if (raw.startsWith('Binary files') || raw.startsWith('GIT binary patch')) { binaries.add(`${file} (${commit.split(' ')[0]})`); continue }
  if (!raw.startsWith('+')) continue
  if (SKIP.test(file)) continue
  const line = raw.slice(1)
  if (/\bd="[MmZzLlHhVvCcSsQqTtAa0-9 .,\-]+"/.test(line)) continue
  for (const [re, label] of PATTERNS) {
    const m = line.match(re)
    if (m && !ALLOW.has(m[0])) hits.push({ commit, file, label, line: line.trim().slice(0, 120) })
  }
}

const byLabel = {}
for (const h of hits) (byLabel[h.label] ||= []).push(h)
console.log(`이력 전수 검사 — 적발 ${hits.length}건, 바이너리 ${binaries.size}개`)
for (const [label, list] of Object.entries(byLabel)) {
  const files = [...new Set(list.map((h) => h.file))]
  console.log(`\n■ ${label}: ${list.length}건 / 파일 ${files.length}개`)
  if (verbose) for (const h of list) console.log(`  ${h.commit.split(' ')[0]}  ${h.file}: ${h.line}`)
  else for (const f of files.slice(0, 8)) console.log(`  ${f}`)
}
if (binaries.size) {
  console.log('\n■ 이력에 들어간 바이너리(지웠어도 남아 있음):')
  for (const b of binaries) console.log(`  ${b}`)
}
process.exit(hits.length ? 1 : 0)
