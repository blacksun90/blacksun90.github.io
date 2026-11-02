import { useRef } from 'react'

// 탭 목록 하나. 세 시안의 경력·프로젝트(회사별) 탭이 같이 쓴다. 모양은 각 시안의 classes 로.
// 키보드: 좌우/상하 화살표로 이동, Home/End. 선택된 탭만 Tab 순서에 들어간다.
export default function Tabs({ items, active, onChange, label, idBase, panelId, orientation = 'horizontal', classes }) {
  const refs = useRef([])
  const n = items.length

  function onKey(e, i) {
    let next = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = n - 1
    if (next == null) return
    e.preventDefault()
    onChange(items[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className={classes.list} role="tablist" aria-label={label} aria-orientation={orientation}>
      {items.map((it, i) => (
        <button
          key={it.id}
          ref={(el) => (refs.current[i] = el)}
          type="button"
          role="tab"
          id={`${idBase}-tab-${it.id}`}
          aria-selected={it.id === active}
          aria-controls={panelId}
          tabIndex={it.id === active ? 0 : -1}
          className={classes.tab}
          onClick={() => onChange(it.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          <span>{it.label}</span>
          {it.sub && <small>{it.sub}</small>}
        </button>
      ))}
    </div>
  )
}
