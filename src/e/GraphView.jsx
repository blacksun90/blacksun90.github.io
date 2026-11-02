import { useEffect, useRef } from 'react'
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force'
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
import { drag } from 'd3-drag'
import { gsap } from '../shared/gsap.js'
import { radius } from '../shared/graph/graph.js'

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const NARROW = () => window.matchMedia('(max-width: 760px)').matches

// 묶음별 자리 잡기(힘의 목표점). 참고 이미지처럼 경력(청록)과 기술(보라)이 두 덩어리로, AI는 위, R&D는 아래.
const ANCHOR = {
  me: [0.5, 0.5],
  career: [0.36, 0.52],
  skill: [0.68, 0.46],
  ai: [0.52, 0.28],
  rd: [0.6, 0.84],
}
// 구슬 색(그라디언트 stop). CSS 토큰과 같은 값.
const COLOR = { me: '#ffffff', career: '#37d3ff', skill: '#b36bff', ai: '#ffc857', rd: '#5ff0c0' }
const DEEP = { me: '#9fb4ff', career: '#0b6f8f', skill: '#4c1d95', ai: '#8a5a00', rd: '#0f6b55' }

// d3가 SVG를 직접 그린다. React는 마운트·선택·검색어만 넘기고 틱마다 다시 그리지 않는다.
export default function GraphView({ graph, selected, query, onSelect }) {
  const svgRef = useRef(null)
  const selRef = useRef(null)

  useEffect(() => {
    const svgEl = svgRef.current
    const svg = select(svgEl)
    const W = svgEl.clientWidth || 1200
    const H = svgEl.clientHeight || 800
    const reduced = REDUCED()
    const { nodes, links } = graph
    const cssPx = (name, fallback) => parseInt(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback

    // 구슬 질감: 묶음마다 흰 심지 → 제 색 → 짙은 가장자리
    const defs = svg.append('defs')
    for (const g of Object.keys(COLOR)) {
      const grad = defs.append('radialGradient').attr('id', `g-grad-${g}`).attr('cx', '35%').attr('cy', '32%').attr('r', '70%')
      grad.append('stop').attr('offset', '0').attr('stop-color', '#ffffff')
      grad.append('stop').attr('offset', '0.32').attr('stop-color', COLOR[g])
      grad.append('stop').attr('offset', '1').attr('stop-color', DEEP[g])
    }

    const root = svg.append('g').attr('class', 'g-root')
    const linkSel = root
      .append('g')
      .attr('class', 'g-links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', (l) => `g-link g-link--${l.group || 'me'}`)
    const nodeSel = root
      .append('g')
      .attr('class', 'g-nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', (d) => `g-node g-node--${d.group} g-node--${d.type}`)
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (d) => d.label)
    nodeSel.append('circle').attr('class', 'g-glow').attr('r', (d) => radius(d) * 1.9 + 3)
    nodeSel.append('circle').attr('class', 'g-halo').attr('r', (d) => radius(d) + 6)
    nodeSel
      .append('circle')
      .attr('class', 'g-dot')
      .attr('r', (d) => radius(d))
      .attr('fill', (d) => `url(#g-grad-${d.group})`)
    nodeSel
      .append('text')
      .attr('class', (d) => `g-label${d.degree >= 4 || d.type === 'person' ? ' g-label--on' : ''}`)
      .attr('dy', (d) => radius(d) + 14)
      .attr('text-anchor', 'middle')
      .text((d) => d.label)

    // 힘: 링크 거리는 종류(w)에 따라, 반발은 차수에 비례, 묶음별 목표점으로 모은다.
    const sim = forceSimulation(nodes)
      .force('link', forceLink(links).id((d) => d.id).distance((l) => 36 + (3 - l.w) * 26).strength((l) => 0.25 + 0.2 * l.w))
      .force('charge', forceManyBody().strength((d) => -110 - d.degree * 22))
      .force('collide', forceCollide((d) => radius(d) + 9).iterations(2))
      .force('x', forceX((d) => (ANCHOR[d.group] || ANCHOR.me)[0] * W).strength((d) => (d.type === 'person' ? 0.2 : 0.045)))
      .force('y', forceY((d) => (ANCHOR[d.group] || ANCHOR.me)[1] * H).strength((d) => (d.type === 'person' ? 0.2 : 0.06)))
      .force('center', forceCenter(W / 2, H / 2).strength(0.02))
      .alphaDecay(0.03)

    // 시뮬레이션 좌표는 상단 바 아래, 가장자리 안쪽으로 붙잡는다(화면 밖 방지)
    const TOP = cssPx('--top-h', 72) + 12
    const PAD = 28
    const tick = () => {
      for (const d of nodes) {
        d.x = Math.max(PAD, Math.min(W - PAD, d.x))
        d.y = Math.max(TOP, Math.min(H - PAD, d.y))
      }
      linkSel
        .attr('x1', (l) => l.source.x)
        .attr('y1', (l) => l.source.y)
        .attr('x2', (l) => l.target.x)
        .attr('y2', (l) => l.target.y)
      nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`)
    }
    sim.on('tick', tick)

    // 먼저 조용히 자리를 잡고(동기 120틱), 그다음 천천히 식으면서 보여 준다 — 등장할 때 점이 튀지 않는다
    sim.stop()
    for (let i = 0; i < 120; i++) sim.tick()
    tick()

    // 확대·이동(휠·드래그). 1.4배 넘게 들어가면 라벨을 모두 켠다.
    const zoomBehavior = zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (e) => {
        root.attr('transform', e.transform)
        svg.classed('is-zoomed', e.transform.k > 1.4)
      })
    svg.call(zoomBehavior).on('dblclick.zoom', null)

    // 카메라: 보이는 영역(패널이 가리지 않는 부분)에 주어진 노드들이 들어오게 이동·확대
    // 패널은 내용 길이에 따라 높이가 달라지므로(아래 시트) 실제 사각형을 읽는다. 없으면 토큰값으로 어림.
    const availRect = (hasPanel) => {
      const top = cssPx('--top-h', 72)
      const panel = hasPanel ? document.querySelector('.panel')?.getBoundingClientRect() : null
      if (NARROW()) {
        const bottom = panel ? panel.top - 8 : hasPanel ? H * 0.38 : H
        return { x: 0, y: top, w: W, h: Math.max(120, bottom - top) }
      }
      const right = panel ? panel.left - 16 : hasPanel ? W - cssPx('--panel-w', 440) - 48 : W
      return { x: 0, y: top, w: Math.max(240, right), h: H - top }
    }
    let camTween = null
    const fitTo = (list, [kMin, kMax], hasPanel, instant = false) => {
      if (!list.length) return
      let x0 = Infinity
      let y0 = Infinity
      let x1 = -Infinity
      let y1 = -Infinity
      for (const d of list) {
        const r = radius(d) + 14
        x0 = Math.min(x0, d.x - r)
        y0 = Math.min(y0, d.y - r)
        x1 = Math.max(x1, d.x + r)
        y1 = Math.max(y1, d.y + r)
      }
      const a = availRect(hasPanel)
      const bw = Math.max(1, x1 - x0)
      const bh = Math.max(1, y1 - y0)
      const k = Math.max(kMin, Math.min(kMax, Math.min(a.w / bw, a.h / bh) * 0.86))
      const cx = (x0 + x1) / 2
      const cy = (y0 + y1) / 2
      const target = { k, x: a.x + a.w / 2 - k * cx, y: a.y + a.h / 2 - k * cy }
      const cur = zoomTransform(svgEl)
      const o = { k: cur.k, x: cur.x, y: cur.y }
      camTween?.kill()
      const apply = () => svg.call(zoomBehavior.transform, zoomIdentity.translate(o.x, o.y).scale(o.k))
      if (instant || REDUCED()) {
        Object.assign(o, target)
        apply()
        return
      }
      camTween = gsap.to(o, { ...target, duration: 0.6, ease: 'expo.out', onUpdate: apply })
    }
    const fitAll = (hasPanel, instant) => fitTo(nodes, [0.3, 1.1], hasPanel, instant)
    const focusOn = (id, hasPanel, instant) => {
      const n = graph.byId.get(id)
      if (!n) return
      const near = [...(graph.neighbors.get(id) || [])].map((i) => graph.byId.get(i)).filter(Boolean)
      fitTo([n, ...near], [NARROW() ? 0.4 : 0.55, 1.5], hasPanel, instant) // 좁은 화면은 시트 위 띠가 낮아 더 멀리서
    }
    // 처음엔 소개 패널이 열려 있으니 그 옆에 맞춰 시작. 좁은 화면은 시트 위 띠가 좁아 전체 대신 사람과 이웃만.
    const frame = (id, hasPanel, instant) => (id && (id !== 'me' || NARROW()) ? focusOn(id, hasPanel, instant) : fitAll(hasPanel, instant))
    frame('me', true, true)

    // 노드 끌기: 끄는 동안만 잠깐 다시 데운다
    nodeSel.call(
      drag()
        .on('start', (e, d) => {
          if (!e.active) sim.alphaTarget(0.25).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (e, d) => {
          d.fx = e.x
          d.fy = e.y
        })
        .on('end', (e, d) => {
          if (!e.active) sim.alphaTarget(0)
          d.fx = null
          d.fy = null
        }),
    )

    // 선택·호버
    const hover = (d) => {
      if (d == null) {
        nodeSel.classed('is-hover', false).classed('is-hover-near', false)
        linkSel.classed('is-hover', false)
        return
      }
      const near = graph.neighbors.get(d.id) || new Set()
      nodeSel.classed('is-hover', (n) => n.id === d.id).classed('is-hover-near', (n) => near.has(n.id))
      linkSel.classed('is-hover', (l) => l.source.id === d.id || l.target.id === d.id)
    }
    nodeSel
      .on('click', (e, d) => {
        e.stopPropagation()
        onSelect(d.id)
      })
      .on('keydown', (e, d) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(d.id)
        }
      })
      .on('mouseenter', (e, d) => hover(d))
      .on('focus', (e, d) => hover(d))
      .on('mouseleave', () => hover(null))
      .on('blur', () => hover(null))
    svg.on('click', () => onSelect(null))

    // 등장: 중심(사람)에서 바깥으로 피어난다. 거리(BFS 깊이) 순서로 점이 맺히고 선이 그어진다.
    const depth = new Map([['me', 0]])
    const queue = ['me']
    while (queue.length) {
      const id = queue.shift()
      for (const nb of graph.neighbors.get(id) || []) {
        if (!depth.has(nb)) {
          depth.set(nb, depth.get(id) + 1)
          queue.push(nb)
        }
      }
    }
    const byDepth = [...nodes].sort((a, b) => (depth.get(a.id) ?? 9) - (depth.get(b.id) ?? 9))
    const dotsByDepth = byDepth.map((d) => nodeSel.filter((n) => n.id === d.id).select('.g-dot').node())
    const glowsByDepth = byDepth.map((d) => nodeSel.filter((n) => n.id === d.id).select('.g-glow').node())
    const labelsByDepth = byDepth.map((d) => nodeSel.filter((n) => n.id === d.id).select('.g-label').node())
    const breathing = []
    // 허브의 빛무리가 천천히 숨 쉰다. opacity 는 CSS(호버·선택)가 다스리므로 반지름만 움직인다.
    const startBreathing = () => {
      if (reduced) return
      nodeSel
        .filter((d) => d.degree >= 4)
        .select('.g-glow')
        .each(function () {
          breathing.push(gsap.to(this, { attr: { r: '+=4' }, duration: 2.4 + Math.random() * 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() * 2 }))
        })
    }
    let intro = null
    if (reduced) {
      for (let i = 0; i < 200; i++) sim.tick()
      tick()
      frame('me', true, true)
    } else {
      intro = gsap.timeline({ delay: 0.15, onComplete: startBreathing })
      intro.from(dotsByDepth, { attr: { r: 0 }, duration: 0.7, ease: 'back.out(2.2)', stagger: { each: 0.018 } }, 0)
      intro.from(glowsByDepth, { attr: { r: 0 }, duration: 0.9, ease: 'power2.out', stagger: { each: 0.018 } }, 0.05)
      // 라벨은 끝나면 인라인 opacity 를 걷어서 호버·선택 CSS 가 다시 다스리게 한다
      intro.from(labelsByDepth.filter(Boolean), { opacity: 0, duration: 0.5, stagger: { each: 0.018 }, clearProps: 'opacity' }, 0.25)
      linkSel.each(function () {
        const len = Math.hypot(+this.getAttribute('x2') - +this.getAttribute('x1'), +this.getAttribute('y2') - +this.getAttribute('y1')) || 1
        this.style.strokeDasharray = `${len}`
        this.style.strokeDashoffset = `${len}`
      })
      intro.to(linkSel.nodes(), { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out', stagger: { each: 0.006 }, clearProps: 'strokeDasharray,strokeDashoffset' }, 0.2)
      sim.alpha(0.22).restart() // 보여 주면서 마저 식는다(살짝만 — 점이 튀지 않게)
      // 식는 동안 선 길이가 변하므로 dash 는 clearProps 로 걷힌 뒤에만 정확하다 — 1.5초면 충분히 걷힌다
    }
    const onVis = () => (document.hidden ? breathing.forEach((t) => t.pause()) : breathing.forEach((t) => t.resume()))
    document.addEventListener('visibilitychange', onVis)

    selRef.current = { nodeSel, linkSel, sim, svg, frame }
    if (import.meta.env.DEV) {
      window.__graph = {
        settle() {
          sim.stop()
          for (let i = 0; i < 300; i++) sim.tick()
          tick()
          gsap.globalTimeline.getChildren(true, true, true).forEach((t) => t.progress(1))
          linkSel.nodes().forEach((el) => {
            el.style.strokeDasharray = ''
            el.style.strokeDashoffset = ''
          })
          frame(document.querySelector('.panel__title') ? document.querySelector('.g-node.is-selected')?.__data__?.id || 'me' : null, !!document.querySelector('.panel'), true)
        },
        select: onSelect,
        fitAll: () => fitAll(false),
      }
    }
    return () => {
      sim.stop()
      camTween?.kill()
      intro?.kill() // StrictMode 재마운트 때 옛 요소를 계속 움직이지 않게
      breathing.forEach((t) => t.kill())
      document.removeEventListener('visibilitychange', onVis)
      svg.on('.zoom', null).on('click', null)
      svg.selectAll('*').remove()
      if (import.meta.env.DEV) delete window.__graph
    }
    // graph 와 onSelect 는 마운트 동안 바뀌지 않는다(App 이 고정)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 선택·검색어가 바뀌면 클래스만 바꾸고, 선택한 노드 쪽으로 카메라를 옮긴다
  const first = useRef(true)
  useEffect(() => {
    const s = selRef.current
    if (!s) return
    const { nodeSel, linkSel } = s
    const near = selected ? graph.neighbors.get(selected) || new Set() : null
    const focus = !!selected && selected !== 'me' // 소개 상태에선 그래프 전체를 제 색으로 보여 준다(첫인상)
    const q = (query || '').trim().toLowerCase()
    const match = (n) => !q || n.label.toLowerCase().includes(q)
    nodeSel
      .classed('is-selected', (n) => n.id === selected)
      .classed('is-near', (n) => !!near && near.has(n.id))
      .classed('is-dim', (n) => (focus ? n.id !== selected && !near.has(n.id) : false) || !match(n))
      .classed('is-match', (n) => !!q && match(n))
    linkSel
      .classed('is-on', (l) => !!selected && (l.source.id === selected || l.target.id === selected))
      .classed('is-dim', (l) => (focus && l.source.id !== selected && l.target.id !== selected) || (!!q && !(match(l.source) && match(l.target))))
    if (selected && !REDUCED() && !first.current) {
      const el = nodeSel.filter((n) => n.id === selected).select('.g-halo').node()
      if (el) gsap.fromTo(el, { attr: { r: radius(graph.byId.get(selected)) + 4 }, opacity: 0.9 }, { attr: { r: radius(graph.byId.get(selected)) + 26 }, opacity: 0, duration: 0.9, ease: 'power2.out', overwrite: 'auto' })
    }
    // 카메라: 선택하면 그 노드와 이웃이 패널 옆(좁은 화면에선 시트 위)에 들어오게, 닫으면 전체
    if (!first.current) s.frame(selected, !!selected, false)
    first.current = false
  }, [selected, query, graph])

  return <svg ref={svgRef} className="graph" aria-label="포트폴리오 그래프 — 노드를 고르면 오른쪽에 내용이 열립니다" />
}
