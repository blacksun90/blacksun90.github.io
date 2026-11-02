import { useEffect } from 'react'

const key = (source) => `portfolio:overview:${source}`
const dPath = import.meta.env.PORTFOLIO_MAIN_PATH || '/d/'

export function overviewReturn() {
  const source = new URLSearchParams(window.location.search).get('from')
  const isC = source === 'c'
  return { href: `${isC ? '/c/' : dPath}?resume=1`, label: isC ? 'C 포트폴리오로 돌아가기' : 'D 포트폴리오로 돌아가기' }
}

export function useOverviewReturn(source) {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('resume') !== '1') return
    let y = 0
    try { y = Number(sessionStorage.getItem(key(source))) || 0 } catch { /* 저장소 차단 시 상단으로 복귀 */ }
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: Number.isFinite(y) ? Math.max(0, y) : 0, behavior: 'instant' })
      url.searchParams.delete('resume')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    })
    return () => cancelAnimationFrame(frame)
  }, [source])
}

export default function OverviewLink({ source, className, onClick }) {
  return <a className={className} href={`/e-4/?from=${source}`} onClick={(event) => {
    try { sessionStorage.setItem(key(source), String(window.scrollY)) } catch { /* 이동은 저장소 없이도 가능 */ }
    onClick?.(event)
  }}>한눈에 보기 <span aria-hidden="true">↗</span></a>
}
