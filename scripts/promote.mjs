// D를 루트로 올리고 C·E-4와 모든 시안 소스·공용 코드를 보존한다.
//
//   node scripts/promote.mjs d            # 적용
//   node scripts/promote.mjs d --dry-run  # 바꿀 내용만 출력
//
// 하는 일: 루트 index.html 을 선택 시안의 진입 파일로 교체(제목에서 시안 표기 제거, 공유용 메타 추가),
// vite.config.js 를 루트·C·E-4 다중 입력으로 교체. 파일 삭제·git 커밋은 하지 않는다.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const pick = process.argv[2]
const dry = process.argv.includes('--dry-run')
if (pick !== 'd' || process.argv.slice(3).some((arg) => arg !== '--dry-run')) {
  console.error('사용법: node scripts/promote.mjs d [--dry-run] (D 메인 + C·E-4 보존)')
  process.exit(2)
}
const root = resolve(process.cwd())
const entry = resolve(root, pick, 'index.html')
const required = ['d/index.html', 'c/index.html', 'e-4/index.html', 'src/d/main.jsx', 'src/c/main.jsx', 'src/e-4/main.jsx', 'src/shared/graph', 'src/shared/graph3d']
const missing = required.filter((path) => !existsSync(resolve(root, path)))
if (missing.length) {
  console.error(`필수 파일·폴더가 없습니다: ${missing.join(', ')}`)
  process.exit(1)
}

const SITE = 'https://blacksun90.github.io/'
const TITLE = '한성용 — 포트폴리오'
const DESC = {
  c: '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오.',
  d: '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오. 물방울 하나를 터뜨리면 그 이야기로 흘러갑니다.',
  e: '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오. 경력·프로젝트·기술이 한 그래프로 이어집니다.',
  'e-1': '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오. 경력·프로젝트·기술이 한 3D 그래프로 이어집니다.',
  'e-2': '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오. 경력·프로젝트·기술이 한 3D 그래프로 이어집니다.',
  'e-3': '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오. 경력·프로젝트·기술이 한 3D 그래프로 이어집니다.',
  'e-4': '게임 운영툴·BI·사내 도구를 만드는 웹 개발자 한성용의 포트폴리오. 경력·프로젝트·기술이 한 3D 그래프로 이어집니다.',
}[pick]

let html = readFileSync(entry, 'utf8')
// 시안 파일에 미리 넣어 둔 공유 메타는 걷어 내고 완전한 세트로 다시 넣는다
html = html.replace(/\n\s*<meta (?:property="og:|name="twitter:)[^\n]*/g, '')
html = html.replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${DESC}" />`)
const share = [
  `    <link rel="canonical" href="${SITE}" />`,
  `    <meta property="og:type" content="website" />`,
  `    <meta property="og:title" content="${TITLE}" />`,
  `    <meta property="og:description" content="${DESC}" />`,
  `    <meta property="og:url" content="${SITE}" />`,
  `    <meta property="og:locale" content="ko_KR" />`,
  `    <meta name="twitter:card" content="summary" />`,
].join('\n')
html = html.replace(/(\n\s*<meta name="theme-color"[^\n]*)/, `$1\n${share}`)

const vite = `import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// D 메인 + C 표준 + E-4 성운. 다른 시안 소스는 보존하고 배포 입력에서만 제외한다.
export default defineConfig({
  base: '/',
  define: { 'import.meta.env.PORTFOLIO_MAIN_PATH': JSON.stringify('/') },
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        c: resolve(__dirname, 'c/index.html'),
        'e-4': resolve(__dirname, 'e-4/index.html'),
      },
    },
  },
})
`

const plan = [
  `index.html  ← ${pick}/index.html (제목 "${TITLE}", 공유 메타 추가)`,
  'vite.config.js  ← / (D), /c/, /e-4/ 다중 입력',
  '보존  모든 시안 폴더·src·그래프 공용 코드 (파일 삭제 없음)',
]
console.log(plan.join('\n'))
if (dry) {
  console.log('\n(--dry-run: 아무것도 바꾸지 않았습니다)')
  process.exit(0)
}

writeFileSync(resolve(root, 'index.html'), html)
writeFileSync(resolve(root, 'vite.config.js'), vite)
console.log(`\n승격 완료: ${pick}. 다음: npm run check && npm run build, 확인 뒤 커밋.`)
