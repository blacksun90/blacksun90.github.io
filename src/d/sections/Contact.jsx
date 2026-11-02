import { profile } from '../../content/site.js'
import { intro } from '../copy.js'
import Pool from '../components/Pool.jsx'

// 메일 단추가 물방울처럼 맺히고, 한 번 파문이 번진다(CSS, .is-filled).
function entrance(root, tl) {
  tl.from(root.querySelector('.reach__mail'), { scale: 0.9, opacity: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(1.8)', clearProps: 'transform' }, 0.4)
  tl.from(root.querySelector('.reach__foot'), { opacity: 0, y: 10, duration: 0.5, ease: 'power3.out', clearProps: 'transform' }, 0.6)
}

export default function Contact() {
  return (
    <Pool id="contact" title="연락 주세요" intro={intro.contact} tone={3} entrance={entrance}>
      <div className="reach">
        <a className="reach__mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
      </div>
      <p className="reach__foot">© 2026 {profile.name}</p>
    </Pool>
  )
}
