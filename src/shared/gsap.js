import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ ease: 'power3.out', duration: 0.6 })

export { gsap, ScrollTrigger }

// 개발 중 브라우저 자동화 탭(rAF 제한)에서 끝 상태를 확인하기 위한 손잡이.
if (import.meta.env.DEV) {
  window.__motion = {
    gsap,
    ScrollTrigger,
    finish() {
      gsap.globalTimeline.getChildren(true, true, true).forEach((t) => t.progress(1))
      ScrollTrigger.getAll().forEach((st) => st.refresh())
    },
  }
}

// 마커로 글씨를 쓰듯 왼쪽에서 오른쪽으로 드러낸다. 글자 수에 따라 길이가 달라진다.
export function markerWrite(el, { delay = 0, perChar = 0.045, min = 0.5, max = 1.6 } = {}) {
  const len = (el.textContent || '').trim().length
  const duration = Math.min(max, Math.max(min, len * perChar))
  return gsap.fromTo(
    el,
    { clipPath: 'inset(-10% 100% -10% -2%)' },
    { clipPath: 'inset(-10% -2% -10% -2%)', duration, delay, ease: 'power2.inOut' },
  )
}

// SVG 획을 그린다(stroke-dashoffset).
export function drawStroke(path, { duration = 0.7, delay = 0 } = {}) {
  const len = path.getTotalLength()
  path.style.strokeDasharray = `${len}`
  path.style.strokeDashoffset = `${len}`
  return gsap.to(path, { strokeDashoffset: 0, duration, delay, ease: 'power2.inOut' })
}
