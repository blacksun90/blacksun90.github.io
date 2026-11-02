import { gsap, ScrollTrigger } from '../../shared/gsap.js'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// <Wash/> 가 마운트되면 자기 루트를 등록한다. 전환 연출은 그 안에서만 그려진다.
let wash = null
export function registerWash(el) {
  wash = el
}

let busy = false

// 물결 가장자리. 두 모양은 점 개수가 같아서 d 속성을 바로 보간한다.
function waveD(W, H, phase) {
  const a = phase ? 34 : 54
  const b = phase ? 62 : 26
  return [
    `M0,${a}`,
    `C${W * 0.18},${b} ${W * 0.32},${a - 30} ${W * 0.5},${a}`,
    `C${W * 0.68},${a + 30} ${W * 0.82},${b} ${W},${a}`,
    `L${W},${H + 300} L0,${H + 300} Z`,
  ].join(' ')
}

const svgNS = 'http://www.w3.org/2000/svg'

// 3차 베지어 위의 점
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  }
}

// 점열을 따라 폭이 변하는 띠(닫힌 path). offset 은 법선 방향으로 띠를 한쪽으로 미는 양.
function ribbon(pts, widthAt, offset = 0) {
  const L = []
  const R = []
  const last = pts.length - 1
  for (let i = 0; i <= last; i++) {
    const p = pts[i]
    const q = pts[Math.min(i + 1, last)]
    const o = pts[Math.max(i - 1, 0)]
    let tx = q.x - o.x
    let ty = q.y - o.y
    const len = Math.hypot(tx, ty) || 1
    tx /= len
    ty /= len
    const nx = -ty
    const ny = tx
    const w = widthAt(i / last) / 2
    const cx = p.x + nx * offset
    const cy = p.y + ny * offset
    L.push(`${(cx + nx * w).toFixed(1)},${(cy + ny * w).toFixed(1)}`)
    R.push(`${(cx - nx * w).toFixed(1)},${(cy - ny * w).toFixed(1)}`)
  }
  return `M${L.join(' L')} L${R.reverse().join(' L')} Z`
}

// 물방울이 터져(충격 고리 + 튀어 올랐다 떨어지는 물방울) → 물줄기(폭이 변하는 물 띠)가 아래로 흘러내리고
// → 흐림 유리를 앞세운 물결이 화면을 씻어 내리며 → 덮인 순간 그 섹션에 도착하고 → 물이 걷힌다.
export function flowTo(targetId, origin, { radius = 56, onBurst, onDone } = {}) {
  const target = document.getElementById(targetId)
  if (!target) return
  if (busy) return
  const W = window.innerWidth
  const H = window.innerHeight

  if (prefersReduced() || !wash) {
    onBurst?.()
    gsap.to(window, { scrollTo: { y: target, offsetY: 0 }, duration: prefersReduced() ? 0 : 0.6, ease: 'power2.out', onComplete: () => onDone?.() })
    history.replaceState(null, '', `#${targetId}`)
    return
  }

  busy = true
  // GSAP 스크롤과 CSS smooth 스크롤이 겹쳐 도착 위치가 밀리지 않도록 한다.
  const scrollStyle = document.documentElement.style
  const previousScrollBehavior = scrollStyle.scrollBehavior
  scrollStyle.scrollBehavior = 'auto'
  const svg = wash.querySelector('.wash__svg')
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  const glass = wash.querySelector('.wash__glass')
  const splash = wash.querySelector('.wash__splash')
  const ringEl = wash.querySelector('.wash__ring')
  const echo = wash.querySelector('.wash__ring--echo')
  const impact = wash.querySelector('.wash__impact')
  const stream = wash.querySelector('.wash__stream')
  const gloss = wash.querySelector('.wash__stream-gloss')
  const clipRect = wash.querySelector('.wash__stream-clip')
  const beadsG = wash.querySelector('.wash__beads')
  const deep = wash.querySelector('.wash__deep')
  const wave = wash.querySelector('.wash__wave')
  const foam = wash.querySelector('.wash__foam')
  const caustics = wash.querySelector('.wash__caustics')
  const layers = [deep, wave, caustics, foam]
  const { x, y } = origin

  // 1. 충격 고리와 튀는 물방울. 물방울은 위로 튀었다가 중력에 끌려 떨어진다.
  ringEl.setAttribute('cx', x)
  ringEl.setAttribute('cy', y)
  gsap.set(ringEl, { attr: { r: radius * 0.6, 'stroke-width': 3 }, opacity: 0.6 })
  gsap.set(echo, { attr: { cx: x, cy: y, r: radius * 0.38, 'stroke-width': 1.4 }, opacity: 0.28 })
  gsap.set(impact, { attr: { cx: x, cy: y, r: radius * 0.65 }, opacity: 0.42 })
  const n = W < 760 ? 11 : 16
  const dots = []
  for (let i = 0; i < n; i++) {
    const c = document.createElementNS(svgNS, 'circle')
    c.setAttribute('cx', x)
    c.setAttribute('cy', y)
    c.setAttribute('r', 3 + Math.random() * 6)
    splash.appendChild(c)
    dots.push(c)
  }

  // 2. 물줄기: 방울에서 화면 아래 가운데로 굽어 흐르는 띠. 윗머리는 가늘고 아래로 갈수록 굵어지며 폭이 살짝 출렁인다.
  const ex = W / 2
  const ey = H + 80
  const p0 = { x, y }
  const p1 = { x, y: y + (ey - y) * 0.35 }
  const p2 = { x: ex, y: y + (ey - y) * 0.55 }
  const p3 = { x: ex, y: ey }
  const pts = Array.from({ length: 40 }, (_, i) => bez(p0, p1, p2, p3, i / 39))
  const phase = Math.random() * Math.PI * 2
  const wAt = (t) => (5 + 26 * t) * (1 + 0.14 * Math.sin(t * 11 + phase))
  stream.setAttribute('d', ribbon(pts, wAt))
  gloss.setAttribute('d', ribbon(pts, (t) => wAt(t) * 0.26, -wAt(0.6) * 0.22))
  clipRect.setAttribute('x', 0)
  clipRect.setAttribute('width', W)
  clipRect.setAttribute('y', y - radius)
  clipRect.setAttribute('height', 0)
  gsap.set(stream, { opacity: 0.65 })
  gsap.set(gloss, { opacity: 0.42 })

  // 띠를 따라 떨어지는 방울들. 구이 필터 안이라 띠 근처에서 물처럼 뭉친다.
  const beads = []
  for (let i = 0; i < 7; i++) {
    const c = document.createElementNS(svgNS, 'circle')
    c.setAttribute('cx', x)
    c.setAttribute('cy', y)
    c.setAttribute('r', 3 + Math.random() * 5)
    beadsG.appendChild(c)
    beads.push({ c, side: (Math.random() - 0.5) * 18, prog: { t: 0 } })
  }

  // 3. 물결 세 겹(깊은 물·물·거품)과 흐림 유리
  const d0 = waveD(W, H, 0)
  const d1 = waveD(W, H, 1)
  for (const p of layers) p.setAttribute('d', d0)
  glass.style.clipPath = `path('${d0}')`
  glass.style.height = `${H + 300}px`
  const off = -(H + 360)
  gsap.set(layers, { y: off })
  gsap.set(deep, { opacity: 0.32 })
  gsap.set(wave, { opacity: 0.7 })
  gsap.set(caustics, { opacity: 0.2 })
  gsap.set(foam, { opacity: 0.52 })
  gsap.set(glass, { y: off, opacity: 0.7 })

  const hideStream = () => {
    gsap.set([stream, gloss], { opacity: 0 })
    clipRect.setAttribute('height', 0)
  }

  const tl = gsap.timeline({
    onComplete: () => {
      dots.forEach((c) => c.remove())
      beads.forEach((b) => b.c.remove())
      hideStream()
      gsap.set(layers, { y: off, opacity: 0 })
      gsap.set(glass, { y: off, opacity: 0 })
      gsap.set([ringEl, echo, impact], { opacity: 0 })
      busy = false
      ScrollTrigger.refresh()
      scrollStyle.scrollBehavior = previousScrollBehavior
      onDone?.()
    },
  })

  tl.add(() => onBurst?.(), 0)
  tl.to(ringEl, { attr: { r: radius * 3.2, 'stroke-width': 0.3 }, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0)
  tl.to(echo, { attr: { r: radius * 2.7, 'stroke-width': 0.2 }, opacity: 0, duration: 0.75, ease: 'power2.out' }, 0.12)
  tl.to(impact, { attr: { r: radius * 2.5 }, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0)
  dots.forEach((c, i) => {
    const ang = -Math.PI / 2 + (i / n - 0.5) * Math.PI * 1.5 + (Math.random() - 0.5) * 0.4
    const v = 50 + Math.random() * 90
    const dx = Math.cos(ang) * v
    const up = Math.abs(Math.sin(ang)) * (20 + Math.random() * 50)
    tl.to(c, { attr: { cx: x + dx }, duration: 0.8, ease: 'none' }, 0)
    tl.to(c, { attr: { cy: y - up }, duration: 0.24, ease: 'power2.out' }, 0)
    tl.to(c, { attr: { cy: y + 90 + Math.random() * 160 }, duration: 0.56, ease: 'power2.in' }, 0.24)
    tl.to(c, { attr: { r: 1 }, opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.5)
  })
  // 띠가 위에서 아래로 흘러내린다(clip 이 아래로 열림)
  tl.to(clipRect, { attr: { height: ey - y + radius + 80 }, duration: 0.5, ease: 'power2.in' }, 0.1)
  beads.forEach((b, i) => {
    const at = 0.14 + i * 0.05
    tl.to(b.prog, {
      t: 1.02,
      duration: 0.52,
      ease: 'power1.in',
      onUpdate: () => {
        const p = bez(p0, p1, p2, p3, Math.min(1, b.prog.t))
        b.c.setAttribute('cx', p.x + b.side * Math.min(1, b.prog.t * 2))
        b.c.setAttribute('cy', p.y)
      },
    }, at)
    tl.to(b.c, { attr: { r: 1.5 }, opacity: 0, duration: 0.14, ease: 'power1.in' }, at + 0.4)
  })

  // 물결 도착: 유리가 먼저 닿고, 깊은 물·물·거품이 살짝씩 늦게 따라온다
  tl.to(glass, { y: 0, duration: 0.56, ease: 'power2.in' }, 0.38)
  tl.to(deep, { y: 28, duration: 0.6, ease: 'power2.in' }, 0.4)
  tl.to(wave, { y: 0, duration: 0.56, ease: 'power2.in' }, 0.42)
  tl.to(caustics, { y: 8, duration: 0.58, ease: 'power2.in' }, 0.42)
  tl.to(foam, { y: -14, duration: 0.56, ease: 'power2.in' }, 0.42)
  tl.to([deep, wave, caustics], { attr: { d: d1 }, duration: 0.5, ease: 'sine.inOut' }, 0.42)
  tl.to(foam, { attr: { d: d1 }, duration: 0.55, ease: 'sine.inOut' }, 0.42)
  tl.to(window, {
    scrollTo: { y: target, offsetY: 0, autoKill: false }, duration: 0.4, ease: 'power2.inOut',
    onComplete: () => window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }),
  }, 0.72)
  tl.add(() => {
    history.replaceState(null, '', `#${targetId}`)
    hideStream()
  }, 1.12)
  // 물이 걷힌다: 거품이 먼저, 물, 깊은 물, 유리 순으로 아래로 빠진다
  tl.to(foam, { y: H + 360, duration: 0.66, ease: 'power2.out' }, 1.02)
  tl.to(wave, { y: H + 360, duration: 0.72, ease: 'power2.out' }, 1.04)
  tl.to(caustics, { y: H + 360, duration: 0.76, ease: 'power2.out' }, 1.04)
  tl.to(deep, { y: H + 360, duration: 0.8, ease: 'power2.out' }, 1.06)
  tl.to(glass, { y: H + 360, duration: 0.8, ease: 'power2.out' }, 1.06)
  tl.to(layers, { attr: { d: d0 }, duration: 0.6, ease: 'sine.inOut' }, 1.02)
  return tl
}
