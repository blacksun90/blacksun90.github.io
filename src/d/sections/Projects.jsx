import { useId, useState } from 'react'
import { companies, projectsByCompany } from '../../content/site.js'
import { intro } from '../copy.js'
import Pool from '../components/Pool.jsx'
import Level from '../components/Level.jsx'
import Tabs from '../../shared/Tabs.jsx'

// 물길(회사)을 고르면 그때 흘러가던 것이 나온다. 카드는 글로만(대표 이미지 없음), 수위계(AI)는 지금 회사에만.
const years = (period) => period.replace(/\.\d{2}/g, '').replace('현재', '').trim()

// 카드가 물 밑에서 흐릿하게 떠올라 또렷해지고, 수위계가 그 값까지 찬다.
function entrance(root, tl) {
  tl.from(root.querySelectorAll('.work'), {
    y: 36,
    opacity: 0,
    rotateX: 7,
    transformPerspective: 900,
    transformOrigin: '50% 100%',
    filter: 'blur(8px)',
    stagger: { each: 0.11, from: 'start' },
    duration: 0.95,
    ease: 'power3.out',
    clearProps: 'filter,transform',
  }, 0.4)
  tl.from(root.querySelectorAll('.level__water'), { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.11, duration: 0.9, ease: 'power2.out' }, 0.9)
}

export default function Projects() {
  const [company, setCompany] = useState(companies[0].id)
  const base = useId()
  const org = companies.find((c) => c.id === company) || companies[0]
  const list = projectsByCompany(company)
  const items = companies.map((c) => ({ id: c.id, label: c.name, sub: `${years(c.period)} · ${projectsByCompany(c.id).length}` }))

  return (
    <Pool id="projects" title="프로젝트 — 물길마다 흘러온 것" intro={intro.projects} tone={2} entrance={entrance}>
      <Tabs items={items} active={company} onChange={setCompany} label="회사" idBase={base} panelId={`${base}-panel`} classes={{ list: 'works__tabs', tab: 'works__tab' }} />

      <div className="works__panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${company}`} key={company}>
        <p className="works__org">
          <strong>{org.name}</strong>
          <span>{org.period}</span>
          {org.sub && <span>{org.sub}</span>}
        </p>
        <div className="works">
          {list.map((p) => (
            <article key={p.id} className="work" id={`work-${p.id}`}>
              <div className="work__text">
                <div className="work__title">
                  <h3>{p.title}</h3>
                  <span className="work__period">
                    {org.name}
                    {p.period ? ` · ${p.period}` : ''}
                  </span>
                </div>
                <p className="work__line">{p.line}</p>
                <p className="work__detail">{p.detail}</p>
                <ul className="work__stack" aria-label="기술">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {p.ai != null && <Level value={p.ai} />}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Pool>
  )
}
