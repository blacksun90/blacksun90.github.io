// 사이트 문구. 공개 저장소에 들어가므로 개인정보·회사 내부 정보는 여기에 쓰지 않는다.
// 2026-10-29 오후: 커밋 수·스킬 수·기여 횟수 같은 내부 수치와 GitHub 링크는 싣지 않는다(사용자 결정, docs/DECISIONS.md).

export const profile = {
  name: '한성용',
  email: 'blacksun90@naver.com',
  role: '웹 개발자 · 게임 운영툴 · BI · 자동화',
  tagline: '게임 뒤편의 도구를 만듭니다. 운영툴, BI 콘솔, 자동화 — 13년째. 요즘은 AI 에이전트와 짝을 이뤄 혼자서도 팀처럼 일해요.',
  intro: [
    '2013년부터 웹 개발을 해 왔고, 2017년부터는 게임 회사에서 운영툴·BI·사내 인프라 도구를 맡고 있어요.',
    '넷마블 계열에서 공통 백오피스 플랫폼과 게임 3종의 운영툴을, 세컨드다이브에서는 아레스 운영툴·BI 콘솔·홈페이지를 직접 만들고 운영합니다.',
    '2025년부터는 AI 에이전트를 일하는 방식의 중심에 두고, 규칙·스킬·메모리·스케줄로 작업을 자동화하는 체계를 만들고 있어요.',
  ],
}

// 프로젝트 카드. 대표 이미지는 싣지 않는다(2026-10-29 사용자 결정 — 회사마다 있는 것과 없는 것이 섞여 어색함).
export const projects = [
  {
    id: 'ops-ares',
    company: 'seconddive',
    title: '아레스 운영툴',
    line: '국내·대만·글로벌 운영툴을 전담 개발·운영',
    stack: ['Go gRPC', 'React + TS', 'Redis'],
    ai: 80,
    period: '2024 ~',
    detail: '퍼블리셔(카카오게임즈)와 라이브 협업. 프론트 메모리 누수·브라우저 크래시를 프로파일링으로 잡고, 첨부파일 암호화 등 퍼블리셔 보안 기준을 맞췄어요.',
  },
  {
    id: 'bi-console',
    company: 'seconddive',
    title: 'BI 콘솔',
    line: '로그 → 지표 → 알림까지 자동',
    stack: ['Go', 'React + TS', 'S3 로그', 'SQLite 버퍼'],
    ai: 95,
    period: '2025 ~',
    detail: '로그 서버에서 자동 수집·시각화하고, 수집 결손은 스스로 복구해요. 이상 징후 알림을 개발 중이에요.',
  },
  {
    id: 'jira-gantt',
    company: 'seconddive',
    title: 'Jira 간트 콘솔',
    line: 'Jira를 쓸 만한 간트로',
    stack: ['React', 'Jira API'],
    ai: 70,
    period: '2025',
    detail: 'Jira 내장 간트가 커스텀이 안 돼서 직접 만들었어요. 프로젝트별 티켓을 간트로 그리고, Jira 인증으로 로그인·권한을 처리해요.',
  },
  {
    id: 'homepage',
    company: 'seconddive',
    title: '회사 홈페이지 + 리디자인',
    line: '운영 사이트 개발·운영과 2026 리디자인',
    stack: ['React', 'Vite', 'GSAP', 'three.js'],
    ai: 95,
    period: '2024 ~ 2026',
    detail: '운영 사이트(반응형, 풀페이지 스크롤)를 개발·배포·운영하고, 2026년에는 GSAP + three.js로 리디자인을 진행했어요.',
  },
  {
    id: 'minutes',
    company: 'seconddive',
    title: '회의록 자동화',
    line: '녹음 → 회의록 한 번에',
    stack: ['Python', 'faster-whisper', 'GPU'],
    ai: 90,
    period: '2026',
    detail: '회의 녹음을 로컬 GPU로 받아쓰고, 불필요한 문장 제거·회의 끝 감지·회의록(HTML/MD) 생성·검증까지 도구 하나로 해요. 녹음은 PC 밖으로 나가지 않아요.',
  },
  {
    id: 'automation',
    company: 'seconddive',
    title: '서버통합·롤백 자동화',
    line: 'DB 풀·Redis 병합·정합성 검증',
    stack: ['Python', 'MySQL', 'Redis'],
    ai: 60,
    period: '2024 ~',
    detail: '여러 서버의 데이터를 한 번에 통합하는 도구를 만들었고, 유저 ID만 넣으면 데이터를 일괄 복구하는 롤백 도구로 긴급 대응 시간을 줄였어요.',
  },
  // ----- 넷마블에프앤씨(구 포플랫) · 2017 ~ 2023. 화면은 싣지 않는다(저작권). 기간은 사용자 확인 전까지 비움. -----
  {
    id: 'bo-platform',
    company: 'netmarble',
    title: '공통 백오피스 플랫폼',
    line: '모든 게임이 같이 쓰는 운영툴의 뼈대',
    stack: ['Spring Boot', 'React', 'MySQL', 'Okta SAML'],
    period: '',
    detail: '운영자·권한·동적 메뉴, 스케줄 잡, 실시간 쿼리 다운로드, 동적 차트, 대용량 로그 수집기를 공통으로 만들어 어느 게임이든 빠르게 시작하게 했어요. 게임 서버와는 REST·Redis Pub/Sub·소켓으로 통신하고, Google OTP와 Okta 2차 인증도 여기서 붙였어요.',
  },
  {
    id: 'ironthrone',
    company: 'netmarble',
    title: '아이언쓰론 운영툴',
    line: '넷마블 첫 전략 MMO, 소프트 론칭부터 3년 넘게',
    stack: ['Spring Framework', 'AngularJS', 'MySQL', 'BigQuery'],
    period: '',
    detail: '월드 단위 유저 관리, 실시간 유입 모니터링, 보상 지급, 랭킹 조회까지 프론트·백엔드를 전부 만들었어요. 지표는 크론 스케줄 실행기로 자동 수집해 차트로 보여 줬고, 공통 백오피스가 생기기 전이라 복잡한 유저 구조를 직접 다뤘어요.',
  },
  {
    id: 'paragon',
    company: 'netmarble',
    title: '파라곤: 디 오버프라임 운영툴',
    line: '3인칭 AOS, 스팀 얼리 액세스',
    stack: ['Spring Boot', 'React', 'Recoil', 'MySQL', 'BigQuery', 'AWS Athena'],
    period: '',
    detail: '서버 구축부터 백엔드·프론트까지 전체를 맡았어요. 유저·콘텐츠·재화·맵·랭킹·매칭·상품 제어, 스팀 API 연동, 공지·메일·점검 관리, DAU·NRU·매출 같은 지표 30여 종.',
  },
  {
    id: 'goldenbros',
    company: 'netmarble',
    title: '골든브로스 운영툴',
    line: '3:3 액션 슈팅에 P2E를 얹은 게임',
    stack: ['Spring Boot', 'React', 'MySQL', 'BigQuery'],
    period: '',
    detail: 'NFT와 유저 지갑 조회, 거래 내역 추적, 토큰 시세, 랜덤박스 시뮬레이터, 배틀 리포트 분석. 블록체인 서비스와 연동한 운영 기능을 처음부터 만들었어요.',
  },
  {
    id: 'dms',
    company: 'netmarble',
    title: '데이터 관리 시스템',
    line: '다국어 텍스트와 모델 데이터의 형상관리',
    stack: ['Spring', 'AngularJS', 'Kotlin', 'MySQL'],
    period: '',
    detail: '다국어 키 매핑, 리소스 머지와 충돌 해결, 브랜치 기반 모델 형상관리. 여러 게임이 같이 쓰는 도구라 라이브 이슈 대응을 맡았고, Kotlin 기반 2세대 재구축에 참여했어요.',
  },
  {
    id: 'stark',
    company: 'netmarble',
    title: '메시지 봇 플랫폼',
    line: '서버 오류·이슈·빌드 소식을 메신저 봇으로',
    stack: ['Spring Boot', 'AngularJS', 'MySQL', 'LDAP'],
    period: '',
    detail: '실시간 서버 오류 체크, 이슈 알림, 빌드·패치 현황, 채널과 구독자 관리. 프로젝트 개념이 없던 구조를 프로젝트별로 나눠 여러 팀이 같이 쓸 수 있게 바꿨어요.',
  },
  {
    id: 'chat-sdk',
    company: 'netmarble',
    title: '공통 채팅·통합 로그인',
    line: 'LDAP 통합 로그인과 실시간 채팅',
    stack: ['Spring Boot', 'WebSocket', 'Redis Pub/Sub', 'Kurento'],
    period: '',
    detail: '게임이 공통으로 쓰는 채팅과 LDAP 로그인 연동, 실시간 메시지. WebRTC(Kurento) 기반 음성 채팅 서버도 구축해 시험했어요.',
  },
  // ----- 와이즈스톤 · 2015 ~ 2017 -----
  {
    id: 'its',
    company: 'wisestone',
    title: '이슈 트래킹 시스템(ITS)',
    line: 'Jira 같은 이슈 트래커를 처음부터',
    stack: ['AngularJS', 'Spring', 'JPA'],
    period: '2015 ~ 2017',
    detail: '프론트와 백엔드를 함께 설계·개발했어요. 복잡한 엔티티 연관관계의 한계를 여기서 겪고, 이후로는 "연관관계 최소화 + 공통 로직 캡슐화"를 원칙으로 삼았어요.',
  },
  // ----- 디지그루브 · 2014 ~ 2015 -----
  { id: 'hotel', company: 'digigroove', title: '관광호텔 예약·관리 시스템', line: '예약부터 운영 관리까지 한 사이트에', stack: ['JSP', 'Spring'], period: '', detail: 'JSP와 Spring으로 예약과 운영 관리 기능을 만들었어요.' },
  { id: 'edu-remote', company: 'digigroove', title: '교육 원격 지원 앱', line: 'FAQ와 게시물로 배우는 학습 지원', stack: ['AngularJS', 'Spring'], period: '', detail: '선생님이 학생의 FAQ와 게시물을 보고 원격으로 지도하는 앱. AngularJS와 Spring으로 만들고, 쿼리는 프로시저로 관리해 보안을 높였어요.' },
  { id: 'auction', company: 'digigroove', title: '미술품·공예품 경매 사이트', line: '수천만 건 이력을 조회하는 경매 플랫폼', stack: ['JSP', 'Spring'], period: '', detail: '유물·미술품·공예품의 경매와 위탁판매. 유저 관리와 수천만 건 이력 조회 화면을 맡았어요.' },
  // ----- 스케치랩 · 2013 ~ 2014 -----
  { id: 'kt-olleh', company: 'sketchlab', title: 'KT 올레 웹 유지보수', line: '첫 직장, 첫 라이브 웹', stack: ['jQuery', 'Spring', 'JSP'], period: '2013 ~ 2014', detail: 'DB와 페이지 유지보수, jQuery 퍼블리싱, Spring 기반 외주 프로젝트 프론트엔드.' },
]

export const stats = [
  { id: 'years', value: '13', unit: '년+', label: '웹 개발' },
  { id: 'tools', value: '4', unit: '종', label: '게임 운영툴 + 공통 플랫폼 1종' },
]

export const stack = [
  { group: '주력', items: ['Go (gRPC · 고루틴)', 'React + TypeScript', 'Python'] },
  { group: '자주 쓰는', items: ['Redis', 'MySQL', 'Docker', 'Jenkins', 'Nginx', 'Linux', 'Windows 서버'] },
  { group: '데이터', items: ['GCP BigQuery', 'AWS Athena', 'S3 로그 수집', '지표 파이프라인'] },
  { group: '인증·보안', items: ['Okta SAML', 'LDAP', 'Google OTP', '첨부파일 암호화'] },
  { group: 'AI 도구', items: ['Claude Code', 'Codex', '로컬 Whisper (GPU)', 'Claude in Chrome'] },
  { group: '2017 ~ 2023', items: ['Spring Boot', 'Spring', 'Kotlin', 'JPA', 'Recoil'] },
  { group: '2013 ~ 2017', items: ['AngularJS', 'JSP / Servlet', 'jQuery', 'Bootstrap', 'MSSQL'] },
]

export const career = [
  {
    id: 'seconddive',
    company: '세컨드다이브',
    role: '서버팀 · 웹/툴 개발',
    period: '2024.01 ~ 현재',
    bullets: [
      '아레스 게임 운영툴(국내·대만·글로벌) 단독 개발·운영 — Go gRPC + React/TS',
      'BI 콘솔: 로그 자동 수집·시각화, 이상 징후 알림, 수집 결손 자동 복구',
      'Jira 간트 콘솔, 회사 홈페이지 운영과 2026 리디자인',
      '서버통합·유저 롤백 자동화(Python), 회의록 자동화 도구',
      '사내 AI 작업 체계: 프로젝트별 규칙·스킬·메모리·게이트, 핸드오프 문서 자동화',
    ],
  },
  {
    id: 'netmarble',
    company: '넷마블에프앤씨',
    sub: '구 포플랫 — 합병으로 상호 변경',
    role: 'R&D실 서버파트 · 팀원 → 파트장(2020.04)',
    period: '2017.03 ~ 2023.12',
    bullets: [
      '공통 백오피스 플랫폼: 운영자·권한·동적 메뉴, 스케줄 잡, 실시간 쿼리, 동적 차트, 로그 수집기',
      '아이언쓰론(전략 MMO) 운영툴 — 소프트 론칭부터 3년 이상 라이브',
      '파라곤: 디 오버프라임 운영툴 — Steam API, 지표 30종+, 아이템·제재',
      '골든브로스 운영툴 — NFT·토큰 시세·지갑 거래 추적, 랜덤박스 시뮬레이터',
      'DMS(다국어·모델 파일 형상관리), Stark(메시지 봇 플랫폼), 공통 채팅·LDAP 통합 로그인',
      '수억 건 로그 수집기, Okta 2차 인증 도입, 신고 처리·자동 제재 등 24시간 대응 자동화',
    ],
  },
  {
    id: 'wisestone',
    company: '와이즈스톤',
    role: '솔루션개발팀 · 주임연구원',
    period: '2015.10 ~ 2017.02',
    bullets: ['ITS(이슈 트래킹) 프론트·백엔드 — AngularJS, Spring, JPA', '연관관계 설계의 한계를 겪고 "연관관계 최소화 + 공통 로직 캡슐화" 원칙을 세움'],
  },
  {
    id: 'digigroove',
    company: '디지그루브',
    role: '웹개발팀 · 주임',
    period: '2014.09 ~ 2015.08',
    bullets: ['관광호텔 예약 시스템, 교육 원격 지원 앱, 미술품 경매 사이트(수천만 건 이력 조회)', 'JSP · Spring · AngularJS · MySQL/MSSQL'],
  },
  {
    id: 'sketchlab',
    company: '스케치랩',
    role: '솔루션개발팀',
    period: '2013.07 ~ 2014.08',
    bullets: ['KT 올레 웹 유지보수(DB·페이지), Spring 기반 외주 프로젝트 프론트엔드'],
  },
]

// 회사 목록: 경력 순서 그대로. 프로젝트 탭의 순서·이름·재직 기간은 여기서 온다.
export const companies = career.map((c) => ({ id: c.id, name: c.company, period: c.period, sub: c.sub }))
export const projectsByCompany = (id) => projects.filter((p) => p.company === id)

export const education = ['한국방송통신대학교 컴퓨터과학과 졸업 (2025.02)', '유한대학교 컴퓨터제어 졸업']

export const aiMethod = {
  principles: [
    '프로젝트마다 샌드박스 단위로 규칙·스킬·메모리를 분리해요.',
    '보안과 외부 쓰기는 반드시 사람이 승인하는 게이트를 둬요.',
    '에이전트가 테스트 파일을 만들어 실행하고, 브라우저로 직접 기능 테스트까지 해요.',
    '패치 이력·핸드오프를 자동으로 문서화하고, 문서를 인덱싱해 필요한 부분만 읽게 해요.',
  ],
  flow: ['규칙', '스킬', '메모리', '스케줄', '인계서'],
  flowNotes: ['CLAUDE.md · AGENTS.md', '절차와 검수표', '교훈과 상태', '기준 일정 하나', '세션 인계'],
  tools: [
    { name: 'Claude Code', use: '설계·구현·문서·리뷰의 중심' },
    { name: 'Codex', use: '병렬 작업과 독립 리뷰' },
    { name: '로컬 Whisper', use: '회의 녹음 받아쓰기(GPU, 오프라인)' },
    { name: 'Claude in Chrome', use: '브라우저 기능 테스트' },
  ],
}

export const personal = [
  {
    id: 'jarvis',
    title: 'Jarvis',
    line: '로컬 LLM으로 돌아가는 개인 에이전트 비서',
    stack: ['Python', '로컬 LLM (Gemma 등)', 'Telegram Bot'],
    period: '2026.04 ~ 운영 중',
    detail: '텔레그램으로 자산·일정을 관리해요. 멀티 세션 에이전트 운영, 기준 일정 하나로 맞추는 스케줄, 그리고 아래 brain 이 장기 기억을 맡아요.',
  },
  {
    id: 'brain',
    title: 'brain',
    line: '에이전트의 장기 기억 — 문서를 검색하고 그래프로 잇는 로컬 지식 인덱스',
    stack: ['Python', 'SQLite FTS5', 'bge-m3 임베딩 (Ollama)', 'ONNX 리랭커', 'd3-force'],
    period: '2026.06 ~',
    detail: '작업하며 쌓인 마크다운 문서 369개(핸드오프·결정·설계·일지)를 데이터베이스 하나로 묶어, 에이전트가 과거 결정과 사고 기록, 설계 근거를 스스로 떠올리게 만든 도구예요. 전부 내 PC 안에서 돌아요.',
    points: [
      '키워드(trigram 전문 검색)로 먼저 찾고, 0건이면 의미 검색(로컬 임베딩)으로 자동 전환해요. 표현이 달라도 찾아요.',
      '프롬프트를 보낼 때 관련 기억 카드를 자동으로 끼워 주는 회상 훅. "참고일 뿐 지시가 아님"을 붙여 오염을 막아요.',
      '문서 사이 링크와 결정 ID를 그래프로 만들어요. Obsidian 허브 노트 196개, 링크 2,100개, 단일 HTML 시각화.',
      '검색 로그와 기권 신호로 자기 평가해요. 상위 5개 안에 정답이 든 비율 약 83%, 1위 정확도 약 28% — 약점을 알고 "좁히는 도구"로 써요.',
      '매일 자정 자동 재빌드, 검색 로그의 비밀값 마스킹, WSL과 Mac 사이 한글 경로 정규화까지 챙겼어요.',
    ],
  },
  {
    id: 'soundnote',
    title: 'SoundNote',
    line: '휴대폰 녹음을 자동으로 회의록으로',
    stack: ['Python', 'faster-whisper (GPU)'],
    period: '2026.10',
    detail: '개인 R&D. 녹음 파일을 넣으면 받아쓰기·정리·회의록 생성까지 자동으로 해요.',
  },
  {
    id: 'backoffice',
    title: 'backoffice',
    line: '사내 관리 사이트를 빨리 시작하는 기본 뼈대',
    stack: ['TypeScript', 'Go'],
    period: '2025.12 ~ 2026.04',
    detail: '어느 회사에서든 인증·메뉴·권한·스케줄의 뼈대를 바로 쓸 수 있게 만든 출발점이에요.',
  },
  {
    id: 'mdviewer',
    title: 'MD Viewer',
    line: 'VSCode 없이 마크다운 문서를 보는 Windows 뷰어',
    stack: ['Electron', 'markdown-it', 'chokidar', 'highlight.js'],
    period: '2026.06',
    detail: '폴더 트리, 라이브 리로드, 목차, 문서 내 검색, 다크·라이트 테마. 편집은 VSCode에서, 보기는 여기서.',
  },
]

export const nav = [
  { id: 'career', label: '경력' },
  { id: 'projects', label: '프로젝트' },
  { id: 'method', label: 'AI 방식' },
  { id: 'personal', label: 'R&D' },
  { id: 'contact', label: '연락' },
]
