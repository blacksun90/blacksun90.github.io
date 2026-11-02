import { useEffect, useState } from 'react'
import { nav, profile } from '../../content/site.js'
import { actions, labels } from '../copy.js'
import OverviewLink from '../../shared/OverviewLink.jsx'

const items = nav.filter((n) => n.id !== 'wall')
const ids = { career: 'career', projects: 'projects', method: 'method', personal: 'personal', contact: 'contact' }

export default function Nav() {
  const [current, setCurrent] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id)
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header className="nav">
      <div className="wrap nav__in">
        <a className="nav__name" href="#top">
          {profile.name}
        </a>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-list"
          onClick={() => setOpen((o) => !o)}
        >
          {labels.menu}
        </button>
        <nav id="nav-list" className={`nav__links${open ? ' is-open' : ''}`} aria-label="섹션">
          <ul>
            {items.map((it) => (
              <li key={it.id}>
                <a href={`#${ids[it.id] || it.id}`} aria-current={current === (ids[it.id] || it.id) ? 'true' : undefined} onClick={() => setOpen(false)}>
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav__actions">
            <OverviewLink source="c" className="btn btn--small" onClick={() => setOpen(false)} />
            <a className="btn btn--small" href={`mailto:${profile.email}`}>
              {actions.mail}
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
