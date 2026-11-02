import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { profile, stats } from '../../content/site.js'
import { drops, intro } from '../copy.js'
import { gsap } from '../../shared/gsap.js'
import { flowTo, prefersReduced } from '../motion/flow.js'
import { ripple as waterRipple } from '../motion/water.js'
import Caustics from './Caustics.jsx'

// 물 표면: 바닥은 WebGL 물(커스틱), 그 위에 SVG 물방울, 맨 위에 라벨 버튼.
// 물방울 한 개 = 몸통(구이 필터 아래) + 피부(굴절 띠·림라이트·반사·하이라이트) + 바닥(그림자와 모인 빛).
// 좌표 이동은 React가 바깥 <g transform=translate>로, GSAP의 드리프트·흔들림·확대는 안쪽 그룹에만 건다.
// 안쪽 도형은 모두 (0,0) 기준이라 창 크기가 바뀌어도 scale 기준점이 물방울 중심에 머문다(라벨 어긋남 방지).

const BASE = 64 // 기준 반지름(px)

function layout(w, h) {
  const narrow = w < 760
  const r = narrow ? Math.min(BASE * 0.82, w / 7.2) : Math.min(BASE, w / 17)
  const pos = narrow
    ? { career: [0.34, 0.56], projects: [0.72, 0.6], method: [0.36, 0.74], personal: [0.78, 0.79], contrib: [0.3, 0.9], contact: [0.7, 0.94] }
    : { career: [0.6, 0.3], projects: [0.8, 0.5], method: [0.6, 0.7], personal: [0.9, 0.25], contrib: [0.78, 0.86], contact: [0.46, 0.86] }
  const items = drops.map((d) => ({ ...d, x: pos[d.id][0] * w, y: pos[d.id][1] * h, r: r * d.size }))
  const ar = r * 0.62
  const actions = narrow ? [{ id: 'mail', x: 0.11 * w, y: 0.6 * h, r: ar }] : [{ id: 'mail', x: 0.16 * w, y: 0.76 * h, r: ar }]
  return { items, actions, r, narrow }
}

export default function Surface({ onFlow }) {
  const ref = useRef(null)
  const svgRef = useRef(null)
  const navRef = useRef(null)
  const [size, setSize] = useState({ w: 1200, h: 720 })

  useLayoutEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { items, actions, narrow } = layout(size.w, size.h)
  const all = [...items, ...actions]

  // 한 물방울에 딸린 요소들(몸통·피부·바닥·버튼)
  const partsOf = (id) => ({
    body: svgRef.current.querySelector(`.drops__body[data-drop="${id}"]`),
    skin: svgRef.current.querySelector(`.drops__skin[data-drop="${id}"]`),
    under: svgRef.current.querySelector(`.drops__under-one[data-drop="${id}"]`),
    btn: navRef.current.querySelector(`[data-drop="${id}"]`),
  })

  // 진입 → 떠다님(드리프트 + 젤리 흔들림) → 포인터 파문
  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const reduced = prefersReduced()
    const ctx = gsap.context(() => {
      const sets = all.map((d, i) => ({ d, i, ...partsOf(d.id) }))
      gsap.set(sets.map((s) => s.btn), { xPercent: -50, yPercent: -50 })

      const idle = () => {
        sets.forEach(({ i, body, skin, under, btn }) => {
          const k = 1 + (i % 3) * 0.35
          const wob = [body.firstElementChild, skin.firstElementChild]
          // 드리프트: 가로·세로 주기가 달라 같은 궤적을 반복하지 않는다
          gsap.to([body, skin, under, btn], { x: `+=${5 + k * 3}`, duration: 3.4 + (i % 4) * 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.21 })
          gsap.to([body, skin, under, btn], { y: `+=${-4 - k * 2.4}`, duration: 2.5 + (i % 3) * 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.13 })
          // 젤리 흔들림: 가로로 늘면 세로로 줄어드는 표면장력
          gsap.to(wob, { scaleX: 1.035, scaleY: 0.968, transformOrigin: '50% 50%', duration: 2.1 + (i % 3) * 0.45, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.17 })
          gsap.to(under, { scaleX: 1.06, transformOrigin: '50% 50%', duration: 2.1 + (i % 3) * 0.45, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.17 })
        })
      }

      if (reduced) return
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from(root.querySelectorAll('.surface__name, .surface__tagline, .surface__tally, .surface__hint'), { opacity: 0, y: 14, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0)
      // 아래쪽 물방울부터 수면으로 떠오른다
      ;[...sets]
        .sort((a, b) => b.d.y - a.d.y)
        .forEach(({ body, skin, under, btn }, j) => {
          const at = 0.3 + j * 0.08
          tl.from([body, skin], { y: 42, scale: 0.84, opacity: 0, transformOrigin: '50% 50%', filter: 'blur(10px)', duration: 1.25, ease: 'power3.out', clearProps: 'filter' }, at)
          tl.from(btn, { y: 42, opacity: 0, duration: 1.25, ease: 'power3.out' }, at)
          tl.from(under, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 1.0, ease: 'power2.out' }, at + 0.35)
        })
      tl.add(idle, '-=0.5')
    }, root)

    const onVis = () => (document.hidden ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume())
    document.addEventListener('visibilitychange', onVis)

    // 포인터가 지나간 자리에 물 파문(셰이더)
    let last = 0
    const onMove = (e) => {
      if (reduced) return
      const now = performance.now()
      if (now - last < 90) return
      last = now
      const b = root.getBoundingClientRect()
      waterRipple((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height, 0.55)
    }
    root.addEventListener('pointermove', onMove)
    return () => {
      ctx.revert()
      document.removeEventListener('visibilitychange', onVis)
      root.removeEventListener('pointermove', onMove)
    }
  }, [narrow])

  function ring(x, y, r) {
    const rings = svgRef.current.querySelector('.drops__rings')
    if (rings.childElementCount > 6) return
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    c.setAttribute('cx', x)
    c.setAttribute('cy', y)
    c.setAttribute('r', r * 0.9)
    rings.appendChild(c)
    gsap.to(c, { attr: { r: r * 1.9 }, opacity: 0, duration: 1.0, ease: 'power2.out', onComplete: () => c.remove() })
  }

  function hover(d, on) {
    if (prefersReduced()) return
    const { body, skin } = partsOf(d.id)
    gsap.to([body, skin], { scale: on ? 1.07 : 1, transformOrigin: '50% 50%', duration: on ? 0.45 : 0.6, ease: on ? 'power3.out' : 'power2.out', overwrite: 'auto' })
    if (on) {
      ring(d.x, d.y, d.r)
      waterRipple(d.x / size.w, d.y / size.h, 1.4)
    }
  }

  function burst(item, btn) {
    const { body, skin, under } = partsOf(item.id)
    const label = btn.querySelector('.drop-btn__in')
    const rect = btn.getBoundingClientRect()
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    flowTo(item.id, origin, {
      radius: item.r,
      onBurst: () => {
        gsap.to([body, skin], { scale: 0, transformOrigin: '50% 50%', duration: 0.22, ease: 'power3.in', overwrite: 'auto' })
        gsap.to(under, { opacity: 0, duration: 0.2 })
        gsap.to(label, { opacity: 0, duration: 0.16, overwrite: 'auto' }) // 물방울이 터지면 글자도 함께 사라진다
        waterRipple(item.x / size.w, item.y / size.h, 2.6)
      },
      onDone: () => {
        // 터진 자리에 물이 다시 맺힌다 — 표면장력의 탄성
        gsap.to([body, skin], { scale: 1, transformOrigin: '50% 50%', duration: 1.1, ease: 'elastic.out(1, 0.5)', delay: 0.15, overwrite: 'auto' })
        gsap.to(under, { opacity: 1, duration: 0.6, delay: 0.3 })
        gsap.to(label, { opacity: 1, duration: 0.5, delay: 0.35, overwrite: 'auto' })
      },
    })
    onFlow?.(item.id)
  }

  const tally = stats.filter((s) => ['years', 'tools'].includes(s.id))

  return (
    <section className="surface" id="surface" ref={ref} aria-label="물 표면 — 소개와 목차">
      <Caustics host={ref} />
      <svg className="drops" ref={svgRef} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
        <defs>
          <filter id="goo" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id="soft" x="-40%" y="-60%" width="180%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="soft-s" x="-40%" y="-60%" width="180%" height="220%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <radialGradient id="dropFill" cx="38%" cy="32%" r="72%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#eaf8fb" />
            <stop offset="0.78" stopColor="#bfe6f1" />
            <stop offset="1" stopColor="#86cfe3" />
          </radialGradient>
          <radialGradient id="actionFill" cx="38%" cy="32%" r="72%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.42" stopColor="#cfeef7" />
            <stop offset="1" stopColor="#0a8fb0" />
          </radialGradient>
          {/* 굴절 띠: 가장자리로 갈수록 두꺼운 물이 빛을 꺾어 짙어졌다가 림에서 밝아진다 */}
          <radialGradient id="lens" cx="50%" cy="50%" r="50%">
            <stop offset="0.6" stopColor="#0a8fb0" stopOpacity="0" />
            <stop offset="0.84" stopColor="#0a8fb0" stopOpacity="0.26" />
            <stop offset="0.93" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0a8fb0" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="pooledLight" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="drops__rings" />

        {/* 바닥: 물방울이 모은 빛과 그 둘레의 그림자 */}
        <g className="drops__under">
          {all.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
              <g className="drops__under-one" data-drop={d.id}>
                <ellipse className="drops__shade" cx={d.r * 0.06} cy={d.r * 0.92} rx={d.r * 0.98} ry={d.r * 0.3} filter="url(#soft)" />
                <ellipse className="drops__pooled" cx={d.r * 0.04} cy={d.r * 0.9} rx={d.r * 0.56} ry={d.r * 0.17} fill="url(#pooledLight)" />
              </g>
            </g>
          ))}
        </g>

        {/* 몸통: 서로 가까우면 구이 필터가 이어 붙인다 */}
        <g className="drops__goo" filter="url(#goo)">
          {items.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
              <g className="drops__body" data-drop={d.id}>
                <g>
                  <circle cx={0} cy={0} r={d.r} fill="url(#dropFill)" />
                </g>
              </g>
            </g>
          ))}
          {actions.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
              <g className="drops__body drops__body--action" data-drop={d.id}>
                <g>
                  <circle cx={0} cy={0} r={d.r} fill="url(#actionFill)" />
                </g>
              </g>
            </g>
          ))}
        </g>

        {/* 피부: 굴절 띠, 림라이트, 안쪽 반사, 하이라이트 */}
        <g className="drops__detail">
          {all.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
              <g className="drops__skin" data-drop={d.id}>
                <g>
                  <circle cx={0} cy={0} r={d.r} fill="url(#lens)" />
                  <circle cx={0} cy={0} r={d.r - 0.6} fill="none" stroke="url(#rim)" strokeWidth="1.2" />
                  <ellipse className="drops__inner" cx={d.r * 0.3} cy={d.r * 0.42} rx={d.r * 0.24} ry={d.r * 0.1} filter="url(#soft-s)" />
                  <ellipse className="drops__gloss" cx={-d.r * 0.32} cy={-d.r * 0.4} rx={d.r * 0.27} ry={d.r * 0.14} transform={`rotate(-28 ${-d.r * 0.32} ${-d.r * 0.4})`} />
                  <circle className="drops__spark" cx={-d.r * 0.08} cy={-d.r * 0.62} r={Math.max(1.5, d.r * 0.055)} />
                </g>
              </g>
            </g>
          ))}
        </g>
      </svg>

      <div className="surface__text">
        <h1 className="surface__name">{profile.name}</h1>
        <p className="surface__tagline">{profile.tagline}</p>
        <p className="surface__tally">
          {tally.map((s) => (
            <span key={s.id}>
              <strong>
                {s.value}
                {s.unit}
              </strong>{' '}
              {s.label}
            </span>
          ))}
        </p>
        <p className="surface__hint">{intro.surface}</p>
      </div>

      <nav className="drops__nav" ref={navRef} aria-label="목차">
        {items.map((d) => (
          <button
            key={d.id}
            type="button"
            className="drop-btn"
            data-drop={d.id}
            style={{ left: d.x, top: d.y, width: d.r * 2, height: d.r * 2, fontSize: Math.max(15, d.r * 0.3) }}
            onClick={(e) => burst(d, e.currentTarget)}
            onPointerEnter={() => hover(d, true)}
            onPointerLeave={() => hover(d, false)}
            onFocus={() => hover(d, true)}
            onBlur={() => hover(d, false)}
          >
            <span className="drop-btn__in">
              <span className="drop-btn__label">{d.label}</span>
              {d.r >= 48 && <span className="drop-btn__hint">{d.hint}</span>}
            </span>
          </button>
        ))}
        <a
          className="drop-btn drop-btn--action"
          data-drop="mail"
          href={`mailto:${profile.email}`}
          style={{ left: actions[0].x, top: actions[0].y, width: actions[0].r * 2, height: actions[0].r * 2 }}
          onPointerEnter={() => hover(actions[0], true)}
          onPointerLeave={() => hover(actions[0], false)}
        >
          <span className="drop-btn__in">
            <MailIcon />
            <span className="drop-btn__label">메일</span>
          </span>
        </a>
      </nav>
    </section>
  )
}

function MailIcon() {
  return (
    <svg className="drop-btn__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  )
}
