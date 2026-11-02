import { aiMethod } from '../../content/site.js'
import { intro } from '../copy.js'
import Pool from '../components/Pool.jsx'
import { drawStroke } from '../../shared/gsap.js'

// 웅덩이가 왼쪽부터 차례로 차고, 그 사이 물길이 그어진다. 원칙·도구는 그 뒤에 조용히.
function entrance(root, tl) {
  const pools = root.querySelectorAll('.channel__pool')
  const links = root.querySelectorAll('.channel__link path')
  tl.from(pools, { scale: 0.86, opacity: 0, transformOrigin: '50% 50%', stagger: 0.15, duration: 0.6, ease: 'back.out(1.6)', clearProps: 'transform' }, 0.35)
  links.forEach((p, i) => tl.add(drawStroke(p, { duration: 0.36 }), 0.5 + i * 0.15))
  tl.from(root.querySelectorAll('.method__principles li'), { x: -14, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out', clearProps: 'transform' }, 1.05)
  tl.from(root.querySelectorAll('.method__tools li'), { opacity: 0, y: 12, stagger: 0.06, duration: 0.5, ease: 'power3.out', clearProps: 'transform' }, 1.35)
}

export default function Method() {
  return (
    <Pool id="method" title="AI와 일하는 방식" intro={intro.method} tone={1} entrance={entrance}>
      <ol className="channel" aria-label="작업 체계의 흐름">
        {aiMethod.flow.map((step, i) => (
          <li key={step} className="channel__pool">
            <span className="channel__name">{step}</span>
            <span className="channel__note">{aiMethod.flowNotes[i]}</span>
            {i < aiMethod.flow.length - 1 && (
              <svg className="channel__link" viewBox="0 0 80 24" aria-hidden="true" preserveAspectRatio="none">
                <path d="M0,12 C20,4 30,20 50,12 S70,6 80,12" />
              </svg>
            )}
          </li>
        ))}
      </ol>

      <div className="method">
        <ol className="method__principles">
          {aiMethod.principles.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>


        <ul className="method__tools" aria-label="쓰는 도구">
          {aiMethod.tools.map((t) => (
            <li key={t.name}>
              <strong>{t.name}</strong>
              <span>{t.use}</span>
            </li>
          ))}
        </ul>
      </div>
    </Pool>
  )
}
