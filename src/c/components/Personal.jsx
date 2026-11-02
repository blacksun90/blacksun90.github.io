import { personal } from '../../content/site.js'
import { labels, sections } from '../copy.js'
import Section from './Section.jsx'

export default function Personal() {
  const s = sections.personal
  return (
    <Section id={s.id} title={s.title} lead={s.lead}>
      <ul className="personal" data-reveal="rows">
        {personal.map((p) => (
          <li key={p.id} className={`personal__item${p.points ? ' personal__item--wide' : ''}`}>
            <div className="personal__head">
              <h3>{p.title}</h3>
              <span className="personal__period">{p.period}</span>
            </div>
            <p className="personal__line">{p.line}</p>
            <p className="personal__detail">{p.detail}</p>
            {p.points && (
              <ul className="personal__points">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
            <ul className="chips" aria-label={labels.stack}>
              {p.stack.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  )
}
