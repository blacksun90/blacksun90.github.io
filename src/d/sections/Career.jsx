import { career, education, stack } from '../../content/site.js'
import { intro } from '../copy.js'
import Pool from '../components/Pool.jsx'
import { drawStroke } from '../../shared/gsap.js'

// 물길이 위에서 아래로 그어지고, 정거장이 차례로 맺히고, 카드가 물길에서 밀려 나온다.
function entrance(root, tl) {
  const line = root.querySelector('.stream__line path')
  const marks = root.querySelectorAll('.stream__mark')
  const cards = root.querySelectorAll('.stream__card')
  const rest = root.querySelectorAll('.edu, .stack')
  tl.add(drawStroke(line, { duration: 1.5 }), 0.3)
  tl.from(marks, { scale: 0, transformOrigin: '50% 50%', stagger: 0.2, duration: 0.5, ease: 'back.out(2.4)' }, 0.42)
  tl.from(cards, { x: -20, opacity: 0, stagger: 0.2, duration: 0.75, ease: 'power3.out', clearProps: 'transform' }, 0.48)
  tl.from(rest, { opacity: 0, y: 14, stagger: 0.12, duration: 0.6, ease: 'power3.out', clearProps: 'transform' }, 1.3)
}

export default function Career() {
  return (
    <Pool id="career" title="경력 — 13년, 회사 다섯 곳" intro={intro.career} tone={1} entrance={entrance}>
      <ol className="stream">
        <svg className="stream__line" viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2,0 L2,100" vectorEffect="non-scaling-stroke" />
        </svg>
        {career.map((c) => (
          <li key={c.id} className="stream__stop">
            <div className="stream__mark" aria-hidden="true" />
            <div className="stream__card">
              <div className="stream__title">
                <h3>{c.company}</h3>
                <span className="stream__period">{c.period}</span>
              </div>
              {c.sub && <p className="stream__sub">{c.sub}</p>}
              <p className="stream__role">{c.role}</p>
              <ul>
                {c.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <p className="edu">{education.join(' · ')}</p>

      <div className="stack">
        <h3>기술</h3>
        <dl className="stack__list">
          {stack.map((g) => (
            <div key={g.group} className="stack__row">
              <dt>{g.group}</dt>
              <dd>{g.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Pool>
  )
}
