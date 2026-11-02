// Pre-commit guard: scans tracked + staged text files for things that must never
// become public. Exit 1 on any hit.
//
// Generic patterns live here. Site-specific strings (addresses, hostnames, account
// names, ...) are loaded from ../portfolio-raw/check-patterns.json, which stays
// outside the repo. Format: [["regex source", "label"], ...]. Skipped if absent.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const GENERIC = [
  [/01[016789]-?\d{3,4}-?\d{4}/, '휴대폰 번호'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, 'IP 주소'],
  [/[A-Za-z0-9._%+-]+@gmail\.com/i, 'Gmail 주소'],
  [/\b(?:19|20)\d{2}\s*년생|\(\d{2}세\)/, '생년·나이'],
  [/s3:\/\/|arn:aws:/i, 'S3·AWS 식별자'],
  [/[A-Za-z]:\\(?:Users|ws|admin)\\/, '로컬 절대 경로'],
  [/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/, 'GitHub 토큰'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'GitHub 토큰'],
]

function loadPrivatePatterns() {
  const file = resolve(process.cwd(), '..', 'portfolio-raw', 'check-patterns.json')
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf8')).map(([src, label]) => [new RegExp(src, 'i'), label])
}

const PATTERNS = [...GENERIC, ...loadPrivatePatterns()]

// Binary assets, the lockfile and this script (generic patterns only) are not scanned. Content JSON is.
const SKIP = /^(?:package-lock\.json|scripts\/(?:check-public|audit-history)\.mjs|public\/data\/.*|.*\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|mp4))$/i

// Matches that are fine to publish (bind-all / loopback addresses in dev scripts).
const ALLOW = new Set(['0.0.0.0', '127.0.0.1'])

function listFiles() {
  const tracked = execSync('git ls-files', { encoding: 'utf8' })
  const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
  return [...new Set((tracked + '\n' + staged).split(/\r?\n/).filter(Boolean))]
}

let hits = 0
for (const file of listFiles()) {
  if (SKIP.test(file)) continue
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  text.split(/\r?\n/).forEach((line, i) => {
    // SVG path data is digits and dots; it is not an address.
    if (/\bd="[MmZzLlHhVvCcSsQqTtAa0-9 .,\-]+"/.test(line)) return
    for (const [re, label] of PATTERNS) {
      const m = line.match(re)
      if (m && !ALLOW.has(m[0])) {
        hits++
        console.log(`${file}:${i + 1}: ${label}`)
      }
    }
  })
}

if (hits) {
  console.error(`\n공개 금지 패턴 ${hits}건. 커밋하지 않습니다.`)
  process.exit(1)
}
console.log(`check-public: OK (${PATTERNS.length} patterns)`)
