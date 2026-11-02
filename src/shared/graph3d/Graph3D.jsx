import { useEffect, useRef, useState } from 'react'
import { createEngine } from './engine.js'

// React 는 마운트와 상태만 넘긴다. 그리기는 engine.js(three.js)가 맡는다.
export default function Graph3D({ graph, preset, selected, focused, query, hullMode, onSelect }) {
  const ref = useRef(null)
  const eng = useRef(null)
  const first = useRef(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let e = null
    try {
      e = createEngine(ref.current, graph, preset, { onSelect })
    } catch (err) {
      console.error('[graph3d] WebGL 을 시작하지 못했습니다', err)
      setFailed(true)
      return undefined
    }
    eng.current = e
    first.current = true // StrictMode 재마운트 뒤에도 첫 선택 효과는 카메라를 옮기지 않는다(등장 카메라를 지키려고)
    if (import.meta.env.DEV) window.__graph = { settle: () => e.settle(), select: onSelect, fitAll: () => e.frame(null, false, true), screen: (id) => e.screen(id), ...e.debug }
    return () => {
      e.dispose()
      eng.current = null
      if (import.meta.env.DEV) delete window.__graph
    }
    // graph·preset·onSelect 는 마운트 동안 바뀌지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 선택·검색어: 상태를 넘기고 카메라를 옮긴다(첫 번째는 엔진이 이미 맞춰 둔 자리)
  useEffect(() => {
    const e = eng.current
    if (!e) return
    e.setState({ selected: focused, query })
    if (!first.current) e.frame(focused, !!selected, false)
    first.current = false
  }, [selected, focused, query])
  // 막 모드는 카메라와 무관
  useEffect(() => {
    eng.current?.setState({ hullMode })
  }, [hullMode])

  if (failed) {
    return (
      <div className="g3-fallback" role="alert">
        <p>이 환경에서는 3D 그래프를 그릴 수 없어요.</p>
        <a href="/c/">포트폴리오로 보기</a>
      </div>
    )
  }
  return <div ref={ref} className="g3" aria-label="포트폴리오 3D 그래프 — 점을 고르면 상세 내용이 열립니다" />
}
