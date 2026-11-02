import { useEffect, useRef } from 'react'
import { createWater, registerWater } from '../motion/water.js'
import { prefersReduced } from '../motion/flow.js'

// 첫 화면 바닥의 물. host(첫 화면 section)의 크기를 따라가고, 보이지 않으면 멈춘다.
export default function Caustics({ host }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const hero = host.current
    if (!canvas || !hero) return undefined
    const water = createWater(canvas)
    if (!water) {
      canvas.hidden = true
      return undefined
    }
    registerWater(water)
    const reduced = prefersReduced()
    let visible = true

    const sync = () => {
      if (reduced) return water.freeze()
      if (visible && !document.hidden) water.start()
      else water.stop()
    }
    const ro = new ResizeObserver(([e]) => water.resize(e.contentRect.width, e.contentRect.height))
    ro.observe(hero)
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        sync()
      },
      { threshold: 0 },
    )
    io.observe(hero)
    document.addEventListener('visibilitychange', sync)
    const onLost = (e) => {
      e.preventDefault()
      water.stop()
      canvas.hidden = true
    }
    canvas.addEventListener('webglcontextlost', onLost)
    water.resize(hero.clientWidth, hero.clientHeight)
    sync()
    requestAnimationFrame(() => canvas.classList.add('is-on'))
    if (import.meta.env.DEV) window.__water = water

    return () => {
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('webglcontextlost', onLost)
      registerWater(null)
      water.destroy()
      if (import.meta.env.DEV && window.__water === water) delete window.__water
    }
  }, [host])
  return <canvas className="surface__water" ref={ref} aria-hidden="true" />
}
