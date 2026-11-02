import { useId, useState } from 'react'
import { career, education } from '../../content/site.js'
import { labels, sections } from '../copy.js'
import Section from './Section.jsx'
import Tabs from '../../shared/Tabs.jsx'

// 회사별 탭. 왼쪽 세로 탭, 오른쪽 내용.
export default function Experience() {
  const s = sections.career
  const [active, setActive] = useState(career[0].id)
  const base = useId()
  const c = career.find((it) => it.id === active) || career[0]
  const items = career.map((it) => ({ id: it.id, label: it.company, sub: it.period.split('~')[0].trim() }))

  return (
    <Section id={s.id} title={s.title} lead={s.lead}>
      <div className="xp" data-reveal="left">
        <Tabs items={items} active={active} onChange={setActive} label={labels.company} idBase={base} panelId={`${base}-panel`} orientation="vertical" classes={{ list: 'xp__tabs', tab: 'xp__tab' }} />

        <div className="xp__panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${c.id}`} key={c.id}>
          <h3 className="xp__company">
            {c.company}
            {c.sub && <span className="xp__sub">{c.sub}</span>}
          </h3>
          <p className="xp__role">{c.role}</p>
          <p className="xp__period">{c.period}</p>
          <ul className="xp__bullets">
            {c.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="edu">
        <h3>{labels.education}</h3>
        <ul>
          {education.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
