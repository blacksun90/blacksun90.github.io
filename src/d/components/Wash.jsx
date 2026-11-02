import { useEffect, useRef } from 'react'
import { registerWash } from '../motion/flow.js'

// 화면 전체를 덮는 전환 층. 평소엔 비어 있고, 물방울을 터뜨릴 때만 그려진다.
// glass: 물결 모양으로 잘린 흐림 유리(backdrop-filter) — 물이 지나갈 때 뒤의 페이지가 굴절돼 보인다.
// stream: 투명한 굴절 띠 + 반사광 + 중력에 따라 떨어지는 작은 유리 물방울.
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
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3ffff" stopOpacity="0.5" />
            <stop offset="0.08" stopColor="#b8e8ed" stopOpacity="0.36" />
            <stop offset="0.32" stopColor="#93d3e0" stopOpacity="0.18" />
            <stop offset="0.7" stopColor="#d8f6f1" stopOpacity="0.09" />
            <stop offset="1" stopColor="#efffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stream-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ecffff" stopOpacity="0.7" />
            <stop offset="0.2" stopColor="#63b8ce" stopOpacity="0.14" />
            <stop offset="0.52" stopColor="#efffff" stopOpacity="0.48" />
            <stop offset="0.74" stopColor="#83ccd5" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="wash-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#428aab" stopOpacity="0.3" />
            <stop offset="0.16" stopColor="#8cd8dd" stopOpacity="0.12" />
            <stop offset="0.65" stopColor="#b5e9df" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wash-foam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.78" />
            <stop offset="0.025" stopColor="#f3ffff" stopOpacity="0.34" />
            <stop offset="0.09" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wash-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.48" stopColor="#c5f3ee" stopOpacity="0.35" />
            <stop offset="1" stopColor="#79bdcf" stopOpacity="0.52" />
          </linearGradient>
          <radialGradient id="wash-droplet" cx="34%" cy="26%" r="76%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="0.22" stopColor="#eaffff" stopOpacity="0.62" />
            <stop offset="0.65" stopColor="#acdfe5" stopOpacity="0.2" />
            <stop offset="0.9" stopColor="#4fa2b9" stopOpacity="0.38" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.75" />
          </radialGradient>
          <radialGradient id="wash-impact">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="0.7" stopColor="#c9f4ef" stopOpacity="0.03" />
            <stop offset="0.9" stopColor="#ffffff" stopOpacity="0.48" />
            <stop offset="1" stopColor="#a4dce8" stopOpacity="0" />
          </radialGradient>
          <pattern id="wash-caustics" width="220" height="170" patternUnits="userSpaceOnUse">
            <path d="M-20 46 C28 8 54 94 112 58 S188 6 244 48 M-14 145 C38 100 70 168 126 126 S190 100 232 132 M58 -12 C16 34 116 58 72 110 S48 158 80 188" fill="none" stroke="url(#wash-rim)" strokeWidth="2" />
          </pattern>
          <clipPath id="stream-clip" clipPathUnits="userSpaceOnUse">
            <rect className="wash__stream-clip" x="0" y="0" width="0" height="0" />
          </clipPath>
        </defs>
        <circle className="wash__impact" r="0" />
        <g className="wash__splash" />
        <circle className="wash__ring" r="0" />
        <circle className="wash__ring wash__ring--echo" r="0" />
        <g clipPath="url(#stream-clip)">
          <path className="wash__stream" d="M0,0" />
          <path className="wash__stream-gloss" d="M0,0" />
        </g>
        <g className="wash__beads" />
        <path className="wash__deep" d="M0,0" />
        <path className="wash__wave" d="M0,0" />
        <path className="wash__caustics" d="M0,0" />
        <path className="wash__foam" d="M0,0" />
      </svg>
    </div>
  )
}
