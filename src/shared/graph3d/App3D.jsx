import { useEffect, useMemo, useState } from 'react'
import { profile } from '../../content/site.js'
import { buildGraph } from '../graph/graph.js'
import Panel from '../graph/Panel.jsx'
import Graph3D from './Graph3D.jsx'
import { PRESETS } from './presets.js'
import { overviewReturn } from '../OverviewLink.jsx'

const HULL_LABEL = { on: '막 켬', hover: '막 올릴 때', off: '막 끔' }
const NEXT_HULL = { on: 'hover', hover: 'off', off: 'on' }

// E-4 성운 탐색 화면: 상단·검색·범례·그래프·상세 패널.
export default function App3D() {
  const preset = PRESETS['e-4']
  const back = overviewReturn()
  const graph = useMemo(() => buildGraph(), [])
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [selected, setSelected] = useState(() => window.matchMedia('(max-width: 760px)').matches ? null : 'me')
  const [query, setQuery] = useState('')
  const [hullMode, setHullMode] = useState('on')
  const node = selected ? graph.byId.get(selected) : null

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const change = () => setMobile(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

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

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return graph.nodes.filter((n) => n.label.toLowerCase().includes(q))
  }, [query, graph])

  return (
    <div className={`site site--3d site--overview${node ? ' has-panel' : ''}`}>
      <header className="top">
        <a className="top__back" href={back.href}>← {back.label}</a>
        <div className="top__who">
          <h1 className="top__name">{profile.name}</h1>
          <p className="top__role">
            {profile.role}
          </p>
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
          {preset.projectColor ? (
            <>
              <li className="legend__career">회사</li>
              <li className="legend__project">프로젝트</li>
            </>
          ) : (
            <li className="legend__career">경력 · 프로젝트</li>
          )}
          {!preset.hideSkills && <li className="legend__skill">기술</li>}
          <li className="legend__ai">AI 방식</li>
          <li className="legend__rd">R&D</li>
          {preset.hulls && (
            <li className="legend__hull">
              <button type="button" className="hull-toggle" onClick={() => setHullMode((m) => NEXT_HULL[m])} aria-label={`묶음 막 표시: ${HULL_LABEL[hullMode]}`}>
                {HULL_LABEL[hullMode]}
              </button>
            </li>
          )}
        </ul>
      </header>

      <main className="stage">
        <Graph3D key={mobile ? 'mobile' : 'desktop'} graph={graph} preset={preset} selected={selected} query={query} hullMode={hullMode} onSelect={setSelected} />
        <p className="stage__hint">점을 누르면 오른쪽에 내용이 열려요 · 끌어서 돌리기, 휠로 확대, 오른쪽 버튼으로 옮기기 · Esc 닫기 · ? 소개</p>
      </main>

      <Panel node={node} fullscreen={mobile} onSelect={setSelected} onClose={() => setSelected(null)} />
    </div>
  )
}
