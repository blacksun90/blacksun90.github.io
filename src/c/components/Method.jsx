import { aiMethod } from '../../content/site.js'
import { labels, sections } from '../copy.js'
import Section from './Section.jsx'

// 흐름(규칙→인계서) 아래 두 열: 원칙과 쓰는 도구. 내부 수치는 싣지 않는다(2026-10-29).
export default function Method() {
  const s = sections.method
  return (
    <Section id={s.id} title={s.title} lead={s.lead}>
      <ol className="flow" aria-label={labels.flow} data-reveal="rows">
        {aiMethod.flow.map((step, i) => (
          <li key={step} className="flow__step">
            <span className="flow__name">{step}</span>
            <span className="flow__note">{aiMethod.flowNotes[i]}</span>
          </li>
        ))}
      </ol>

      <div className="method">
        <div className="method__col" data-reveal="up">
          <h3>{labels.principles}</h3>
          <ul className="principles">
            {aiMethod.principles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="method__col" data-reveal="up">
          <h3>{labels.tools}</h3>
          <ul className="tools tools--col">
            {aiMethod.tools.map((t) => (
              <li key={t.name}>
                <strong>{t.name}</strong>
                <span>{t.use}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
