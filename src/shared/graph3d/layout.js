import { forceSimulation, forceLink, forceManyBody, forceCollide, forceCenter, forceRadial, forceX, forceY, forceZ } from 'd3-force-3d'
import { radius } from '../graph/graph.js'
import { R_SCALE } from './presets.js'

// 묶음별 목표점(3D 단위). 경력은 왼쪽, 기술은 오른쪽, AI 위·뒤, R&D 아래·앞 — 어느 각도로 돌려도 네 덩어리가 읽힌다.
const ANCHOR = {
  me: [0, 0, 0],
  career: [-78, 4, 12],
  skill: [82, -6, -14],
  ai: [6, 76, -44],
  rd: [22, -80, 34],
}

export const r3 = (n) => radius(n) * R_SCALE

// 기술을 공유하는 프로젝트 쌍(자카드 유사도 0.2 이상).
// 선이 없어도 비슷한 것끼리 가깝게 — 시맨틱 그래프의 '내용 유사도'를 AI 없이 site.js 데이터로만 흉내 낸다.
export function similarityPairs(graph) {
  const items = graph.nodes.filter((n) => n.type === 'project' || n.type === 'personal')
  const out = []
  for (let i = 0; i < items.length; i++) {
    const a = new Set(items[i].ref.stack || [])
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j].ref.stack || []
      const inter = b.filter((s) => a.has(s)).length
      if (!inter) continue
      const jac = inter / (a.size + b.length - inter)
      if (jac >= 0.2) out.push({ source: items[i].id, target: items[j].id, jac })
    }
  }
  return out
}

// 허브(회사·R&D·AI)끼리 최소 거리(화면 평면 기준). 하위 점이 적은 회사는 반발(차수 비례)이 약해 서로 붙는다 — 허브 쌍에만 거는 충돌 힘.
function forceHubGap(hubs, gap) {
  const force = (alpha) => {
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        const a = hubs[i]
        const b = hubs[j]
        // 화면 평면(x·y)에서만 잰다 — 처음 보는 각도(+z 에서)에서 허브가 앞뒤로 겹쳐 보이지 않게
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dz = 0
        const l = Math.sqrt(dx * dx + dy * dy) || 1e-6
        if (l >= gap) continue
        const k = ((gap - l) / l) * alpha * 0.6
        dx *= k
        dy *= k
        dz *= k
        a.vx -= dx
        a.vy -= dy
        a.vz -= dz
        b.vx += dx
        b.vy += dy
        b.vz += dz
      }
    }
  }
  force.initialize = () => {}
  return force
}

// 자리 잡기. 동기로 식을 때까지 돌려 고정 좌표를 만든다 — 그 뒤 선·막은 한 번만 만들고, 등장할 때 점이 튀지 않는다.
// preset 에서 읽는 간격 값(없으면 기본값 = E-1·E-2·E-3 의 배치 그대로):
//   linkDistance {3: 사람→허브, 2: 회사→프로젝트·허브→개인, 1: 프로젝트→기술 등}, projectCharge(프로젝트 추가 반발),
//   projectCollide(프로젝트 추가 충돌 반지름), simDistance·simStrength(기술 유사도 끌어당김), hubGap(허브끼리 최소 거리), projectRadius·projectRadiusStrength(프로젝트를 사람에서 이만큼 밖으로)
export function layout(graph, preset = {}) {
  const { similarity = false, linkDistance = { 3: 64, 2: 48, 1: 36 }, projectCharge = 0, projectCollide = 0, simDistance = 46, simStrength = 1, hubGap = 0, projectRadius = 0, projectRadiusStrength = 0.1 } = preset
  const { nodes, links } = graph
  const pairs = similarity ? similarityPairs(graph) : []
  const anchor = (d, k) => (ANCHOR[d.group] || ANCHOR.me)[k]
  const pull = (d) => (d.type === 'person' ? 0.3 : d.type === 'skill' ? 0.085 : 0.055)
  // 선 길이: 허브(w=3)는 사람에서 떨어뜨려 이름표가 겹치지 않게
  const sim = forceSimulation(nodes, 3) // 차원은 생성자에서 — nodes 를 넣는 순간 좌표가 초기화되므로 뒤늦은 numDimensions(3) 으론 z 가 안 생긴다
    .force('link', forceLink(links).id((d) => d.id).distance((l) => linkDistance[l.w] ?? 36).strength((l) => 0.25 + 0.2 * l.w))
    .force('charge', forceManyBody().strength((d) => -120 - d.degree * 24 + (d.type === 'project' ? projectCharge : 0)))
    .force('collide', forceCollide((d) => r3(d) + 7 + (d.type === 'project' ? projectCollide : 0)).iterations(2))
    .force('x', forceX((d) => anchor(d, 0)).strength(pull))
    .force('y', forceY((d) => anchor(d, 1)).strength(pull))
    .force('z', forceZ((d) => anchor(d, 2)).strength(pull))
    .force('center', forceCenter(0, 0, 0).strength(0.02))
    .alphaDecay(0.028)
  if (pairs.length) sim.force('sim', forceLink(pairs).id((d) => d.id).distance(simDistance).strength((l) => (0.15 + 0.45 * l.jac) * simStrength))
  // 프로젝트를 사람(원점)에서 일정 거리 밖으로 — 선 길이만 늘리면 힘들이 섞여 오히려 안쪽으로 모이기도 한다
  if (projectRadius > 0) sim.force('projectRadius', forceRadial(projectRadius, 0, 0, 0).strength((d) => (d.type === 'project' ? projectRadiusStrength : 0)))
  if (hubGap > 0) sim.force('hubgap', forceHubGap(nodes.filter((n) => n.type === 'company' || n.type === 'hub' || n.type === 'ai'), hubGap))
  sim.stop()
  for (let i = 0; i < 400 && sim.alpha() > sim.alphaMin(); i++) sim.tick()
  if (!nodes.some((n) => Math.abs(n.z || 0) > 1)) console.warn('[graph3d] 배치가 평면입니다(z≈0) — numDimensions 확인')
  return { pairs }
}

// 사람에서부터의 거리(BFS). 등장 순서에 쓴다.
export function bfsDepth(graph, root = 'me') {
  const depth = new Map([[root, 0]])
  const queue = [root]
  while (queue.length) {
    const id = queue.shift()
    for (const nb of graph.neighbors.get(id) || []) {
      if (!depth.has(nb)) {
        depth.set(nb, depth.get(id) + 1)
        queue.push(nb)
      }
    }
  }
  return depth
}

// 막(hull)으로 감쌀 묶음과 그 이름표. 회사 pod(회사 + 그곳 프로젝트), R&D pod, AI pod.
// 기술 점은 pod 사이를 잇는 결합 조직이라 막에 넣지 않는다(넣으면 막끼리 겹쳐 번진다).
export function clusters(graph) {
  const out = []
  for (const c of graph.nodes.filter((n) => n.type === 'company')) {
    const members = [c, ...graph.nodes.filter((p) => p.type === 'project' && p.ref.company === c.ref.id)]
    out.push({ id: `pod:${c.id}`, group: 'career', title: c.label, members })
  }
  out.push({ id: 'pod:rd', group: 'rd', title: 'R&D', members: graph.nodes.filter((n) => n.type === 'hub' || n.type === 'personal') })
  out.push({ id: 'pod:ai', group: 'ai', title: 'AI 방식', members: graph.nodes.filter((n) => n.group === 'ai') })
  for (const c of out) {
    // 이름표: 이름 · 많이 쓴 기술 둘(없으면 도구 둘). 전부 site.js 에서 센 것 — 새 문구는 없다.
    const freq = new Map()
    for (const m of c.members) for (const s of m.ref?.stack || []) freq.set(s, (freq.get(s) || 0) + 1)
    let top = [...freq]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 2)
      .map((x) => x[0])
    if (!top.length) top = c.members.filter((m) => m.type === 'tool').slice(0, 2).map((m) => m.label)
    c.label = [c.title, ...top].join(' · ')
    c.memberIds = new Set(c.members.map((m) => m.id))
  }
  return out
}
