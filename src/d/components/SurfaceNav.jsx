import { useEffect, useRef } from 'react'
import { drops } from '../copy.js'
import { flowTo } from '../motion/flow.js'
import { gsap, ScrollTrigger } from '../../shared/gsap.js'

// 표면을 지나 아래로 내려오면 나타나는 작은 물방울 줄. 다시 터뜨려 다른 이야기로 흘러간다.
export default function SurfaceNav({ current }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const st = ScrollTrigger.create({
      trigger: '#surface',
      start: 'bottom 70%',
      onEnter: () => el.classList.add('is-on'),
      onLeaveBack: () => el.classList.remove('is-on'),
    })
    return () => st.kill()
  }, [])

  function go(id, btn) {
    const r = btn.getBoundingClientRect()
    flowTo(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 }, {
      onBurst: () => gsap.fromTo(btn, { scale: 1 }, { scale: 0.6, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.inOut' }),
    })
  }

  return (
    <nav className="snav" ref={ref} aria-label="빠른 이동">
      <button type="button" className="snav__drop snav__drop--top" onClick={(e) => go('surface', e.currentTarget)} aria-label="표면으로">
        <span className="snav__label">표면</span>
      </button>
      {drops.map((d) => (
        <button key={d.id} type="button" className="snav__drop" aria-current={current === d.id ? 'true' : undefined} onClick={(e) => go(d.id, e.currentTarget)}>
          <span className="snav__label">{d.label}</span>
        </button>
      ))}
    </nav>
  )
}
