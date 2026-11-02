import { profile, companies, projects, personal, aiMethod } from '../../content/site.js'

// 시안 E — 그래프의 데이터. 사이트 공용 문구(site.js)에서만 만든다. 새 내용은 없다.
// 노드: 사람 1, 회사 5, 프로젝트 18, R&D 허브 1 + 개인 프로젝트 5, AI 허브 1 + 흐름 5 + 도구 4, 기술(중복 제거), 활동 1, 연락 1.
// 색 묶음(group): me · career(회사·프로젝트) · skill(기술) · ai · rd

export function buildGraph() {
  const nodes = []
  const links = []
  const byId = new Map()
  const add = (n) => {
    if (!byId.has(n.id)) {
      byId.set(n.id, n)
      nodes.push(n)
    }
    return byId.get(n.id)
  }
  // group 은 출발 노드의 묶음(선 색). d3 가 source 를 노드 객체로 바꿔 버리므로 여기서 미리 적어 둔다.
  const link = (source, target, w = 1) => links.push({ source, target, w, group: byId.get(source).group })
  const skill = (name) => {
    const id = `skill:${name}`
    add({ id, type: 'skill', label: name, group: 'skill' })
    return id
  }

  add({ id: 'me', type: 'person', label: profile.name, group: 'me' })

  for (const c of companies) {
    add({ id: `company:${c.id}`, type: 'company', label: c.name, group: 'career', ref: c })
    link('me', `company:${c.id}`, 3)
  }
  for (const p of projects) {
    const id = `project:${p.id}`
    add({ id, type: 'project', label: p.title, group: 'career', ref: p })
    link(`company:${p.company}`, id, 2)
    for (const s of p.stack) link(id, skill(s), 1)
  }

  add({ id: 'rd', type: 'hub', label: 'R&D · 개인 프로젝트', group: 'rd' })
  link('me', 'rd', 3)
  for (const p of personal) {
    const id = `personal:${p.id}`
    add({ id, type: 'personal', label: p.title, group: 'rd', ref: p })
    link('rd', id, 2)
    for (const s of p.stack) link(id, skill(s), 1)
  }

  add({ id: 'ai', type: 'ai', label: 'AI와 일하는 방식', group: 'ai' })
  link('me', 'ai', 3)
  aiMethod.flow.forEach((name, i) => {
    const id = `flow:${i}`
    add({ id, type: 'flow', label: name, group: 'ai', note: aiMethod.flowNotes[i], index: i })
    link(i === 0 ? 'ai' : `flow:${i - 1}`, id, 2) // 순서대로 잇고
    if (i > 0) link('ai', id, 1) // 허브에도 묶어 한 덩어리로 모은다
  })
  for (const t of aiMethod.tools) {
    const id = `tool:${t.name}`
    add({ id, type: 'tool', label: t.name, group: 'ai', ref: t })
    link('ai', id, 1)
  }

  add({ id: 'activity', type: 'activity', label: 'GitHub 활동', group: 'me' })
  link('me', 'activity', 2)
  add({ id: 'contact', type: 'contact', label: '연락', group: 'me' })
  link('me', 'contact', 2)

  // 차수(연결 수)와 이웃. 허브는 크게, 라벨은 차수 4 이상이면 항상.
  const degree = new Map()
  const neighbors = new Map()
  for (const l of links) {
    degree.set(l.source, (degree.get(l.source) || 0) + 1)
    degree.set(l.target, (degree.get(l.target) || 0) + 1)
    if (!neighbors.has(l.source)) neighbors.set(l.source, new Set())
    if (!neighbors.has(l.target)) neighbors.set(l.target, new Set())
    neighbors.get(l.source).add(l.target)
    neighbors.get(l.target).add(l.source)
  }
  for (const n of nodes) n.degree = degree.get(n.id) || 0

  return { nodes, links, byId, neighbors }
}

// 노드 반지름: 종류와 차수로. 사람이 제일 크고, 기술은 작게.
export function radius(n) {
  if (n.type === 'person') return 22
  if (n.type === 'company' || n.type === 'ai' || n.type === 'hub') return 11 + Math.min(8, n.degree)
  if (n.type === 'skill') return 3.5 + Math.min(5, n.degree * 0.9)
  return 6 + Math.min(5, n.degree * 0.6)
}

// 기술 노드를 쓰는 프로젝트·개인 프로젝트 목록(패널용)
export function usersOfSkill(name) {
  const inProjects = projects.filter((p) => p.stack.includes(name))
  const inPersonal = personal.filter((p) => p.stack.includes(name))
  return { inProjects, inPersonal }
}
