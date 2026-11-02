import { gsap, ScrollTrigger } from '../shared/gsap.js'

const REDUCE = '(prefers-reduced-motion: reduce)'

export function prefersReduced() {
  return window.matchMedia(REDUCE).matches
}

// 첫 화면 한 번: 내비가 내려오고 히어로 줄이 차례로 자리 잡는다. 기본 상태는 이미 보이는 상태.
export function entrance(root) {
  if (prefersReduced()) return () => {}
  const ctx = gsap.context(() => {
    const nav = root.querySelector('.nav')
    const lines = root.querySelectorAll('.hero [data-line]')
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from(nav, { y: -12, opacity: 0, duration: 0.7 }, 0)
    tl.from(lines, { y: 14, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.15)
  }, root)
  return () => ctx.revert()
}

// 스크롤 진입 한 번: 섹션마다 다른 한 가지 움직임. 제목은 올라오고, 본문은 종류별로 다르게.
export function reveals(root) {
  if (prefersReduced()) return () => {}
  const ctx = gsap.context(() => {
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      const kind = el.dataset.reveal
      const from =
        kind === 'left'
          ? { x: -18, opacity: 0 }
          : kind === 'right'
            ? { x: 18, opacity: 0 }
            : kind === 'rows'
              ? { y: 10, opacity: 0 }
              : kind === 'scale'
                ? { scale: 0.98, opacity: 0, transformOrigin: 'left center' }
                : { y: 16, opacity: 0 }
      const targets = kind === 'rows' ? el.children : el
      gsap.from(targets, {
        ...from,
        duration: 0.9,
        ease: 'expo.out',
        stagger: kind === 'rows' ? 0.05 : 0,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })
  }, root)
  return () => {
    ctx.revert()
    ScrollTrigger.refresh()
  }
}
