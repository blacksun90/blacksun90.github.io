import { useEffect, useRef } from 'react'
import { registerWash } from '../motion/flow.js'

// 화면 전체를 덮는 전환 층. 평소엔 비어 있고, 물방울을 터뜨릴 때만 그려진다.
// glass: 물결 모양으로 잘린 흐림 유리(backdrop-filter) — 물이 지나갈 때 뒤의 페이지가 굴절돼 보인다.
// stream: 폭이 변하는 물 띠(clipPath 로 위에서 아래로 드러남) + 밝은 줄 + 띠를 따라 떨어지는 방울(구이).
export default function Wash() {
  const ref = useRef(null)
  useEffect(() => {
    registerWash(ref.current)
    return () => registerWash(null)
  }, [])
  return (
    <div className="wash" ref={ref} aria-hidden="true">
      <div className="wash__glass" />
      <svg className="wash__svg" preserveAspectRatio="none">
        <defs>
          <filter id="goo-wash" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dff2f8" />
            <stop offset="0.12" stopColor="#b6e1ee" />
            <stop offset="1" stopColor="#8fd3e8" />
          </linearGradient>
          <linearGradient id="stream-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7f1f8" />
            <stop offset="0.35" stopColor="#5cc6df" />
            <stop offset="1" stopColor="#0a8fb0" />
          </linearGradient>
          <clipPath id="stream-clip" clipPathUnits="userSpaceOnUse">
            <rect className="wash__stream-clip" x="0" y="0" width="0" height="0" />
          </clipPath>
        </defs>
        <g className="wash__splash" filter="url(#goo-wash)" />
        <circle className="wash__ring" r="0" />
        <g clipPath="url(#stream-clip)">
          <path className="wash__stream" d="M0,0" />
          <path className="wash__stream-gloss" d="M0,0" />
        </g>
        <g className="wash__beads" filter="url(#goo-wash)" />
        <path className="wash__deep" d="M0,0" />
        <path className="wash__foam" d="M0,0" />
        <path className="wash__wave" d="M0,0" />
      </svg>
    </div>
  )
}
