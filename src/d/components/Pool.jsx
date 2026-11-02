import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../shared/gsap.js'
import { prefersReduced } from '../motion/flow.js'

// 섹션 하나 = 웅덩이 하나. 물길이 닿으면 아래에서 차오르고, 제목이 떠오른다.
// 본문의 등장은 섹션마다 다르다 — entrance(root, tl) 가 그 섹션만의 연출을 더한다.
export default function Pool({ id, title, intro, children, tone = 1, entrance }) {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (prefersReduced()) {
      root.classList.add('is-filled')
      return undefined
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          root.classList.add('is-filled')
          const tl = gsap.timeline()
          tl.fromTo(root.querySelector('.pool__fill'), { scaleY: 0 }, { scaleY: 1, duration: 1.0, ease: 'power3.out' }, 0)
          tl.from(root.querySelector('.pool__edge'), { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0)
          tl.from(root.querySelectorAll('.pool__head > *'), { opacity: 0, y: 16, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.25)
          if (entrance) entrance(root, tl)
          else tl.from(root.querySelectorAll('.pool__body > *'), { opacity: 0, y: 18, stagger: 0.08, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.45)
        },
      })
    }, root)
    return () => ctx.revert()
  }, [entrance])

  return (
    <section className={`pool pool--${tone}`} id={id} ref={ref} aria-labelledby={`${id}-title`}>
      <svg className="pool__edge" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,34 C150,60 290,8 450,30 C610,52 760,6 920,28 C1060,46 1140,22 1200,34 L1200,60 L0,60 Z" />
      </svg>
      <div className="pool__fill" aria-hidden="true" />
      <div className="pool__inner">
        <header className="pool__head">
          <h2 id={`${id}-title`}>{title}</h2>
          {intro && <p>{intro}</p>}
        </header>
        <div className="pool__body">{children}</div>
      </div>
    </section>
  )
}
