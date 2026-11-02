// E-4 성운 그래프 설정. 프로젝트 색·간격·기술 숨김은 공개 화면에서 사용하는 값이다.
export const PRESETS = {
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
// 그래프 데이터의 반지름을 3D 단위로 변환한다.
export const R_SCALE = 0.5
