import { stack } from '../../content/site.js'
import { sections } from '../copy.js'
import Section from './Section.jsx'

export default function About() {
  const s = sections.about
  return (
    <Section id={s.id} title={s.title} lead={s.lead}>
      <dl className="stack" data-reveal="rows">
        {stack.map((g) => (
          <div key={g.group} className="stack__row">
            <dt>{g.group}</dt>
            <dd>
              <ul>
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
