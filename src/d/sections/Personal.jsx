import { personal } from '../../content/site.js'
import { intro } from '../copy.js'
import Pool from '../components/Pool.jsx'

export default function Personal() {
  return (
    <Pool id="personal" title="R&D · 개인 프로젝트" intro={intro.personal} tone={2}>
      <ul className="side">
        {personal.map((p) => (
          <li key={p.id} className={`side__item${p.points ? ' side__item--wide' : ''}`}>
            <div className="side__title">
              <h3>{p.title}</h3>
              <span className="side__period">{p.period}</span>
            </div>
            <p className="side__line">{p.line}</p>
            <p className="side__detail">{p.detail}</p>
            {p.points && (
              <ul className="side__points">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
            <p className="side__stack">{p.stack.join(' · ')}</p>
          </li>
        ))}
      </ul>
    </Pool>
  )
}
