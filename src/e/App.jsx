import { useEffect, useMemo, useState } from 'react'
import { profile } from '../content/site.js'
import { buildGraph } from '../shared/graph/graph.js'
import GraphView from './GraphView.jsx'
import Panel from '../shared/graph/Panel.jsx'

// 시안 E — 그래프. 화면 전체가 노드와 선이고, 고른 노드의 내용은 오른쪽 패널에.
// 처음 열면 소개 패널이 열려 있어서, 그래프를 몰라도 60초 안에 경력·연락처에 닿는다.
export default function App() {
  const graph = useMemo(() => buildGraph(), [])
  const [selected, setSelected] = useState('me')
  const [query, setQuery] = useState('')
  const node = selected ? graph.byId.get(selected) : null

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === 'Escape') {
          setQuery('')
          e.target.blur()
        }
        return
      }
      if (e.key === 'Escape') setSelected(null)
      if (e.key === '?') setSelected('me')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 검색: Enter 로 첫 일치 노드 선택
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return graph.nodes.filter((n) => n.label.toLowerCase().includes(q))
  }, [query, graph])

  return (
    <div className={`site${node ? ' has-panel' : ''}`}>
      <header className="top">
        <div className="top__who">
          <h1 className="top__name">{profile.name}</h1>
          <p className="top__role">{profile.role}</p>
        </div>
        <form
          className="top__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            if (matches[0]) setSelected(matches[0].id)
          }}
        >
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="찾기 — 회사, 프로젝트, 기술" aria-label="그래프에서 찾기" />
          {query && (
            <span className="top__count" aria-live="polite">
              {matches.length}개
            </span>
          )}
        </form>
        <ul className="legend" aria-label="색 뜻">
          <li className="legend__career">경력 · 프로젝트</li>
          <li className="legend__skill">기술</li>
          <li className="legend__ai">AI 방식</li>
          <li className="legend__rd">R&D</li>
        </ul>
      </header>

      <main className="stage">
        <GraphView graph={graph} selected={selected} query={query} onSelect={setSelected} />
        <p className="stage__hint">점을 누르면 오른쪽에 내용이 열려요 · 휠로 확대, 끌어서 이동 · Esc 닫기 · ? 소개</p>
      </main>

      <Panel node={node} onSelect={setSelected} onClose={() => setSelected(null)} />
    </div>
  )
}
