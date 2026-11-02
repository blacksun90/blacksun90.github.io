// 관계선 중 기술 공유·작업 순서 연결을 제외한 탐색 계층.
const parentId = (node) => {
  if (['company', 'hub', 'ai', 'activity', 'contact'].includes(node.type)) return 'me'
  if (node.type === 'project') return `company:${node.ref.company}`
  if (node.type === 'personal') return 'rd'
  if (node.type === 'flow' || node.type === 'tool') return 'ai'
  return null
}

export function titleScope(graph, selected, visibleIds) {
  const id = graph.byId.has(selected) ? selected : 'me'
  const children = graph.nodes.filter((n) => visibleIds.has(n.id) && parentId(n) === id).map((n) => n.id)
  const result = new Set(visibleIds.has(id) ? [id] : [])
  if (children.length) children.forEach((child) => result.add(child))
  else {
    const parent = parentId(graph.byId.get(id))
    if (visibleIds.has(parent)) result.add(parent)
    // 기술은 그래프에 점이 없지만 상세 패널에서 선택할 수 있다.
    if (!visibleIds.has(id)) for (const link of graph.links) {
      const source = typeof link.source === 'object' ? link.source.id : link.source
      const target = typeof link.target === 'object' ? link.target.id : link.target
      if (target === id && visibleIds.has(source)) result.add(source)
    }
  }
  return result
}
