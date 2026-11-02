// 시안 E-1·E-2·E-3 — 옵시디언 3D 그래프 플러그인 세 가지의 콘셉트. 엔진은 하나(engine.js)고 셋의 차이는 이 값뿐이다.
//   e-1  New 3D Graph  : 종류별 도형, 선을 따라 흐르는 입자
//   e-2  3D Graph      : 구슬 + 빛무리 + 별 배경 + 블룸(은하)
//   e-3  Semantic Graph: 묶음을 감싸는 반투명 막, 기술을 공유하는 프로젝트끼리 끌어당김
export const PRESETS = {
  'e-1': {
    key: 'e-1',
    tag: 'E-1',
    name: '도형과 입자',
    shapes: true,
    particles: 'all', // 모든 선에 입자
    glow: 'none',
    bloom: false,
    stars: 0,
    hulls: false,
    similarity: false,
    drift: true, // 점이 제자리에서 아주 천천히 흔들린다
    autoRotate: 0.45, // 도/초 느낌의 OrbitControls 속도. 0 이면 끔
    lights: true,
    linkAlpha: 0.3,
    additiveLinks: false,
  },
  'e-2': {
    key: 'e-2',
    tag: 'E-2',
    name: '은하',
    shapes: false,
    particles: 'none',
    glow: 'full',
    bloom: true,
    stars: 1800,
    hulls: false,
    similarity: false,
    drift: true,
    autoRotate: 0.55,
    lights: false,
    linkAlpha: 0.2,
    additiveLinks: true,
  },
  'e-3': {
    key: 'e-3',
    tag: 'E-3',
    name: '덩어리',
    shapes: false,
    particles: 'selection', // 고른 점의 선에서만
    glow: 'soft',
    bloom: false,
    stars: 0,
    hulls: true,
    similarity: true,
    drift: false, // 막을 다시 계산하지 않으려고 점은 고정
    autoRotate: 0.3,
    lights: true,
    linkAlpha: 0.26,
    additiveLinks: false,
  },
  //   e-4  은하 + 덩어리   : E-2 의 빛무리·별·블룸에 E-3 의 막(약하게)·기술 유사도. 프로젝트 점은 회사와 다른 색(장미)
  'e-4': {
    key: 'e-4',
    tag: 'E-4',
    name: '성운',
    shapes: false,
    particles: 'selection',
    glow: 'full',
    bloom: true,
    stars: 1800,
    hulls: true,
    hullStrength: 0.35, // 막의 투명도와 가장자리 밝기를 함께 줄인다(1 = E-3). 양면이라 겹쳐 보이고 블룸까지 받으니 낮게
    similarity: true,
    drift: false,
    autoRotate: 0.5,
    lights: false,
    linkAlpha: 0.2,
    additiveLinks: true,
    projectColor: '#ff6fb5', // 회사 프로젝트만. 개인 프로젝트는 R&D 민트 그대로
    hideSkills: true, // 기술 점은 그래프에서 숨기고 패널에서만(사용자 2026-10-29)
    // 프로젝트 점 사이를 벌린다(사용자 2026-10-29: "너무 모여 있다"): 회사→프로젝트 선을 길게, 프로젝트끼리 더 밀고, 유사도 끌어당김은 멀고 약하게
    linkDistance: { 3: 120, 2: 110, 1: 42 },
    projectRadius: 365, // 사람↔프로젝트 20% 더 멀리(사용자 2026-10-29): 평균 258 → 310 을 겨냥한 반지름 힘
    projectRadiusStrength: 0.28,
    hubGap: 230, // 하위 점이 적은 회사끼리 붙지 않게(사용자 2026-10-29): 허브 사이 최소 거리
    projectCharge: -340,
    projectCollide: 18,
    simDistance: 120,
    simStrength: 0.5,
  },
}

// 점의 색. 프로젝트 전용 색이 있는 preset 이면 회사 프로젝트만 그 색, 나머지는 묶음 색.
export const colorOf = (node, preset) => (preset?.projectColor && node.type === 'project' ? preset.projectColor : COLOR[node.group] || COLOR.me)

// 묶음 색 — graph.css 토큰과 같은 값
export const COLOR = { me: '#ffffff', career: '#37d3ff', skill: '#b36bff', ai: '#ffc857', rd: '#5ff0c0' }
export const BG = '#0b1020'
// 2D(E) 반지름 → 3D 단위. 선 길이(36~88)에 맞춘 축척.
export const R_SCALE = 0.5
