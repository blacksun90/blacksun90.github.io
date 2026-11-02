import { useId, useState } from 'react'
import { companies, projectsByCompany } from '../../content/site.js'
import { labels, sections } from '../copy.js'
import Section from './Section.jsx'
import Tabs from '../../shared/Tabs.jsx'

// 회사별 탭으로 묶은 프로젝트. 카드는 글로만 — 대표 이미지는 싣지 않는다(2026-10-29 사용자 결정).
const years = (period) => period.replace(/\.\d{2}/g, '').replace('현재', '').trim()

function Chips({ items, label }) {
  return (
    <ul className="chips" aria-label={label}>
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  )
}

export default function Projects() {
  const s = sections.projects
  const [company, setCompany] = useState(companies[0].id)
  const base = useId()
  const org = companies.find((c) => c.id === company) || companies[0]
  const list = projectsByCompany(company)
  const items = companies.map((c) => ({ id: c.id, label: c.name, sub: `${years(c.period)} · ${projectsByCompany(c.id).length}` }))

  return (
    <Section id={s.id} title={s.title} lead={s.lead}>
      <Tabs items={items} active={company} onChange={setCompany} label={labels.company} idBase={base} panelId={`${base}-panel`} classes={{ list: 'pj__tabs', tab: 'pj__tab' }} />

      <div className="pj__panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${company}`} key={company}>
        <p className="pj__org">
          <strong>{org.name}</strong>
          <span>{org.period}</span>
          {org.sub && <span>{org.sub}</span>}
        </p>
        <ul className="others others--all" data-reveal="rows">
          {list.map((p) => (
            <li key={p.id} className="other">
              <p className="other__org">{org.name}</p>
              <h4>{p.title}</h4>
              <p className="other__line">{p.line}</p>
              <p className="other__detail">{p.detail}</p>
              {(p.period || p.ai != null) && (
                <p className="other__meta">
                  <span>{p.period}</span>
                  {p.ai != null && (
                    <span>
                      {labels.aiShare} {p.ai}%
                    </span>
                  )}
                </p>
              )}
              <Chips items={p.stack} label={labels.stack} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
