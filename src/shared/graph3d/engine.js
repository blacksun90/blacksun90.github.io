import { Color, DirectionalLight, HemisphereLight, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { gsap } from '../gsap.js'
import { BG } from './presets.js'
import { layout, clusters as podsOf, bfsDepth } from './layout.js'
import { softDot, glowDot } from './textures.js'
import { makeNodes } from './nodes.js'
import { makeLinks, makeStars } from './links.js'
import { makeParticles, makeHulls } from './effects.js'
import { makeLabels } from './labels.js'
import { availRect, computeFrame, flyTo } from './camera.js'

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const NARROW = () => window.matchMedia('(max-width: 760px)').matches
const IDLE_MS = 9000 // 손을 뗀 뒤 이만큼 지나면 다시 천천히 돈다

// 3D 그래프 엔진. React 는 마운트와 상태(선택·호버·검색어·막 모드)만 넘긴다. 세 시안은 preset 만 다르다.
export function createEngine(container, graph, preset, { onSelect }) {
  const reduced = REDUCED()
  const { byId, neighbors } = graph
  // hideSkills(e-4): 기술 점과 그 선은 그래프에서 빼고 패널(기술 칩·'이 기술을 쓴 곳')에서만 보인다.
  // 데이터(byId·neighbors)에는 남겨 두어, 칩으로 기술을 고르면 그 기술을 쓴 프로젝트가 밝아지고 카메라가 그쪽으로 간다.
  const hidden = (n) => !!preset.hideSkills && n?.type === 'skill'
  const endOf = (x) => (typeof x === 'object' ? x : byId.get(x)) // layout 전엔 id, StrictMode 재마운트 뒤엔 객체
  const nodes = graph.nodes.filter((n) => !hidden(n))
  const links = graph.links.filter((l) => !hidden(endOf(l.source)) && !hidden(endOf(l.target)))
  const view = { nodes, links, byId, neighbors }
  layout(view, preset)
  // 세로 화면에서는 회사 묶음을 위아래로 펼쳐 제목이 놓일 공간을 확보한다.
  if (NARROW()) for (const n of nodes) { n.x *= 0.65; n.y *= 1.45; n.z *= 0.65 }

  // ----- 렌더러·장면·카메라 -----
  const renderer = new WebGLRenderer({ antialias: !preset.bloom, alpha: !preset.bloom, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.bloom ? 1.5 : 2))
  renderer.setClearColor(new Color(BG), preset.bloom ? 1 : 0) // 블룸이 없으면 body 의 은은한 그라디언트가 비친다
  renderer.domElement.className = 'g3-canvas'
  container.appendChild(renderer.domElement)
  const css2d = new CSS2DRenderer()
  css2d.domElement.className = 'g3-labels'
  container.appendChild(css2d.domElement)

  const scene = new Scene()
  const camera = new PerspectiveCamera(50, 1, 1, 4000)
  camera.position.set(0, 30, 330)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 40
  controls.maxDistance = 2000 // 좁은 화면은 시트 위 띠가 낮아 아주 멀리서 봐야 한다(update() 가 이 값으로 거리를 자른다)
  controls.screenSpacePanning = true
  controls.zoomSpeed = 0.8
  controls.autoRotateSpeed = preset.autoRotate
  if (preset.lights) {
    scene.add(new HemisphereLight(0xdfe8ff, 0x0b1020, 1.2))
    const sun = new DirectionalLight(0xffffff, 1.8)
    sun.position.set(140, 180, 220)
    scene.add(sun)
  }

  // ----- 물체 -----
  const tex = { dot: softDot(), glow: glowDot() }
  const N = makeNodes(nodes, preset, tex)
  scene.add(N.glowGroup, N.meshGroup)
  const LK = makeLinks(links, preset, N.meshes)
  scene.add(LK.lines)
  const stars = preset.stars ? makeStars(preset.stars, tex) : null
  if (stars) scene.add(stars.group)
  const particles = preset.particles !== 'none' ? makeParticles(links, preset, N.meshes, tex) : null
  if (particles) scene.add(particles.points)
  const pods = preset.hulls ? podsOf(view) : []
  const hulls = preset.hulls ? makeHulls(pods, N.meshes, preset.hullStrength ?? 1) : null
  if (hulls) scene.add(hulls.group)
  const labels = makeLabels(nodes, N.meshes, pods, hulls, { onSelect, onHover: (id) => setHover(id), vis: N.vis })
  scene.add(labels.group)

  let composer = null
  if (preset.bloom) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new UnrealBloomPass(new Vector2(1, 1), 0.75, 0.5, 0.42)) // 세기·번짐·문턱. 문턱이 낮으면 선까지 번져 화면이 뿌옇다
    composer.addPass(new OutputPass())
  }

  let W = 1
  let H = 1
  const resize = () => {
    W = container.clientWidth || 1
    H = container.clientHeight || 1
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    renderer.setSize(W, H, false)
    css2d.setSize(W, H)
    composer?.setSize(W, H)
  }
  resize()

  // ----- 상태(선택·호버·검색·막) → 목표값. 실제 값은 루프에서 조금씩 따라간다 -----
  const state = { selected: null, hover: null, query: '', hullMode: 'on' }
  let interacted = false
  let idleTimer = 0
  const apply = () => {
    const sel = state.selected
    const near = sel ? neighbors.get(sel) || new Set() : new Set()
    const focus = !!sel && sel !== 'me' // 소개 상태에선 전체를 제 색으로 보여 준다(첫인상)
    const hov = state.hover
    const hnear = hov ? neighbors.get(hov) || new Set() : new Set()
    const q = state.query.trim().toLowerCase()
    const match = (n) => !q || n.label.toLowerCase().includes(q)
    for (const n of nodes) {
      const isSel = n.id === sel
      const isNear = near.has(n.id)
      const isHov = n.id === hov
      const isHNear = hnear.has(n.id)
      const dim = (focus && !isSel && !isNear) || !match(n)
      N.setTarget(n.id, { opacity: dim ? 0.14 : 1, glow: isSel || isNear || isHov || isHNear ? 1 : dim ? 0.1 : 0.5, lit: isSel ? 1 : isHov ? 0.5 : 0 })
      labels.set(n.id, { sel: isSel, near: isNear, hover: isHov, hnear: isHNear, match: !!q && match(n), dim })
    }
    links.forEach((l, i) => {
      const a = l.source.id
      const b = l.target.id
      const on = (!!sel && (a === sel || b === sel)) || (!!hov && (a === hov || b === hov))
      const dim = (focus && a !== sel && b !== sel) || (!!q && !(match(l.source) && match(l.target)))
      LK.target[i] = on ? 0.95 : dim ? 0.05 : preset.linkAlpha
    })
    particles?.setActive((l) => (preset.particles === 'all' ? !(focus && l.source.id !== sel && l.target.id !== sel) : !!sel && (l.source.id === sel || l.target.id === sel)))
    if (hulls) {
      for (const it of hulls.items) {
        const touched = (!!sel && it.cluster.memberIds.has(sel)) || (!!hov && it.cluster.memberIds.has(hov))
        it.target = state.hullMode === 'off' ? 0 : state.hullMode === 'hover' ? (touched ? 1 : 0) : focus ? (touched ? 1 : 0.3) : 1
        it.label = !NARROW() || touched // 좁은 화면의 낮은 띠에선 이름표가 겹치므로 고른·올린 묶음만
      }
    }
    controls.autoRotate = preset.autoRotate > 0 && !NARROW() && !reduced && (!sel || sel === 'me') && !interacted
  }
  const setHover = (id) => {
    if (state.hover === id) return
    state.hover = id
    apply()
  }
  const touched = () => {
    interacted = true
    controls.autoRotate = false
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      interacted = false
      apply()
    }, IDLE_MS)
  }

  // ----- 카메라: 고른 점과 이웃이 패널에 가리지 않는 자리에 들어오게 -----
  // 카메라 거리의 한계 [가까이, 멀리]. 좁은 화면은 띠가 낮아 1800 까지 물러선다(점은 작아져도 이름표는 DOM 이라 읽힌다).
  const LIMITS = (focus) => [focus ? (NARROW() ? 110 : 90) : 160, NARROW() ? 1800 : 1400] // 데스크톱 전체 보기도 그래프가 커지면 900 으론 모자란다(E-4 간격 조정 뒤 확인)
  let camTween = null
  let camIntro = null
  const frameParams = (id, hasPanel) => {
    const focusList = id && (id !== 'me' || NARROW()) ? [byId.get(id), ...[...(neighbors.get(id) || [])].map((i) => byId.get(i))].filter((n) => n && N.meshes.has(n.id)) : null
    if (focusList && !focusList.length) return frameParams(null, hasPanel)
    const list = focusList || nodes
    let pts = list.map((n) => N.meshes.get(n.id).userData.base)
    // 자동 회전이 도는 상태(선택 없음·소개)에서는 어느 각도에서도 들어오게: 회전축이 세로(y)라 가로 반지름만 8방향으로 돌려 본다
    if ((!id || id === 'me') && preset.autoRotate > 0 && !reduced) {
      const c = new Vector3()
      for (const p of pts) c.add(p)
      c.multiplyScalar(1 / Math.max(1, pts.length))
      pts = pts.flatMap((p) => {
        const h = Math.hypot(p.x - c.x, p.z - c.z)
        return Array.from({ length: 8 }, (_, k) => new Vector3(c.x + h * Math.cos((k * Math.PI) / 4), p.y, c.z + h * Math.sin((k * Math.PI) / 4)))
      })
    }
    // 여유(월드 단위): 이름표가 점 위에 붙으므로 조금 넉넉히. 좁은 화면의 초점은 시트 위 띠가 낮아 멀리서 본다.
    return computeFrame(camera, controls, W, H, availRect(W, H, hasPanel), pts, focusList ? 12 : 8, LIMITS(!!focusList), focusList ? 0.9 : 0.96)
  }
  const frame = (id, hasPanel, instant) => {
    const f = frameParams(id, hasPanel)
    camTween?.kill()
    camIntro?.kill()
    camTween = flyTo(camera, controls, f, { instant: instant || reduced })
    return f
  }

  // ----- 포인터: 끌기(회전)와 누르기(선택)를 이동 거리로 가른다 -----
  const ray = new Raycaster()
  const ptr = new Vector2()
  let ptrDirty = false
  let down = null
  const el = renderer.domElement
  const toNdc = (e) => {
    const r = el.getBoundingClientRect()
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }
  const hit = () => {
    ray.setFromCamera(ptr, camera)
    const h = ray.intersectObjects(N.meshGroup.children, false)[0]
    return h ? h.object.userData.node : null
  }
  const onMove = (e) => {
    toNdc(e)
    ptrDirty = true
  }
  const onDown = (e) => {
    down = { x: e.clientX, y: e.clientY }
    touched()
  }
  const onUp = (e) => {
    const d = down
    down = null
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return
    toNdc(e)
    const n = hit()
    onSelect(n ? n.id : null)
  }
  const onLeave = () => setHover(null)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointerleave', onLeave)
  el.addEventListener('wheel', touched, { passive: true })
  const pick = () => {
    if (!ptrDirty || down) return
    ptrDirty = false
    const n = hit()
    setHover(n ? n.id : null)
    el.style.cursor = n ? 'pointer' : ''
  }

  // ----- 등장: 카메라는 조금 먼 데서 다가오고, 점은 사람에서 바깥으로(BFS 깊이) 맺힌다 -----
  const depth = bfsDepth(graph)
  let intro = null
  const f0 = frame(NARROW() ? null : 'me', !NARROW(), true)
  if (!reduced) {
    const dir = camera.position.clone().sub(controls.target).normalize()
    camera.position.copy(controls.target).addScaledVector(dir, f0.distance * 1.35)
    controls.update()
    for (const v of N.vis.values()) {
      v.k = 0
      v.s = 0.001
    }
    camIntro = gsap.to(camera.position, { x: f0.position.x, y: f0.position.y, z: f0.position.z, duration: 1.8, ease: 'expo.out', onUpdate: () => controls.update() })
    intro = gsap.timeline({ delay: 0.1 })
    for (const n of nodes) {
      const v = N.vis.get(n.id)
      const t0 = (depth.get(n.id) ?? 6) * 0.16 + Math.random() * 0.08
      intro.to(v, { s: 1, duration: 0.8, ease: 'back.out(2)' }, t0)
      intro.to(v, { k: 1, duration: 0.5, ease: 'power1.out' }, t0)
    }
    intro.fromTo(LK.lines.material.uniforms.uOpacity, { value: 0 }, { value: 1, duration: 1.4, ease: 'power2.out' }, 0.4)
    if (particles) intro.fromTo(particles.mat, { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2)
    if (stars) for (const m of stars.mats) intro.fromTo(m, { opacity: 0 }, { opacity: m.userData.base, duration: 2 }, 0)
    if (hulls) for (const it of hulls.items) intro.fromTo(it.mat.uniforms.uOpacity, { value: 0 }, { value: 1, duration: 1.2, ease: 'power2.out' }, 1.1)
  }

  // 글꼴이 늦게 오면 패널(특히 아래 시트) 높이가 바뀐다 — 한 번 더 맞춘다. 등장 카메라가 가는 중이면 목적지만 바꾼다.
  const reframe = () => {
    if (interacted) return // 이미 손을 댔으면 카메라를 빼앗지 않는다
    const hasPanel = !!document.querySelector('.panel')
    if (camIntro && camIntro.isActive()) {
      const remain = Math.max(0.6, camIntro.duration() - camIntro.time())
      const f = frameParams(state.selected, hasPanel)
      camIntro.kill()
      controls.target.copy(f.target)
      camIntro = gsap.to(camera.position, { x: f.position.x, y: f.position.y, z: f.position.z, duration: remain, ease: 'expo.out', onUpdate: () => controls.update() })
    } else if (!camTween?.isActive()) {
      frame(state.selected, hasPanel, true)
    }
  }
  document.fonts?.ready.then(reframe)

  // ----- 루프 -----
  let raf = 0
  let last = performance.now()
  const step = (dt, t) => {
    controls.update()
    N.update(dt, t, preset.drift && !reduced)
    if (preset.drift && !reduced) LK.sync()
    LK.lerp(Math.min(1, dt * 7))
    particles?.update(reduced ? 0 : dt)
    hulls?.lerp(Math.min(1, dt * 6))
    labels.sync()
    const dist = camera.position.distanceTo(controls.target)
    container.classList.toggle('is-zoomed', dist < 150)
    container.classList.toggle('is-far', dist > 470)
    pick()
    if (composer) composer.render()
    else renderer.render(scene, camera)
    css2d.render(scene, camera)
    labels.declutter(availRect(W, H, false))
  }
  const tick = (now) => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    step(dt, now / 1000)
  }
  raf = requestAnimationFrame(tick)
  const onVis = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
  }
  document.addEventListener('visibilitychange', onVis)
  let roFirst = true
  const ro = new ResizeObserver(() => {
    if (roFirst) {
      roFirst = false
      return
    }
    resize()
    frame(state.selected, !!document.querySelector('.panel'), true)
  })
  ro.observe(container)

  // 개발용: 점의 화면 좌표와 가리지 않는 영역 안인지(자동화 탭에서 눈 대신 재는 손잡이)
  const screen = (id) => {
    const m = N.meshes.get(id)
    if (!m) return null
    const p = m.position.clone().project(camera)
    const r = availRect(W, H, !!document.querySelector('.panel'))
    const x = ((p.x + 1) / 2) * W
    const y = ((1 - p.y) / 2) * H
    return { x: Math.round(x), y: Math.round(y), inFront: p.z < 1, inRect: x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h }
  }
  const settle = () => {
    gsap.globalTimeline.getChildren(true, true, true).forEach((tw) => tw.progress(1))
    controls.autoRotate = false
    for (let i = 0; i < 60; i++) step(1 / 30, 0)
  }

  const debug = { frame, rect: (hasPanel) => availRect(W, H, hasPanel), vis: (id) => ({ ...N.vis.get(id) }), pos: (id) => N.meshes.get(id)?.userData.base.toArray().map((v) => +v.toFixed(1)), cam: () => ({ pos: camera.position.toArray().map((v) => +v.toFixed(1)), target: controls.target.toArray().map((v) => +v.toFixed(1)), d: +camera.position.distanceTo(controls.target).toFixed(1) }) }

  return {
    debug,
    setState(next) {
      Object.assign(state, next)
      apply()
    },
    frame,
    settle,
    screen,
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      clearTimeout(idleTimer)
      document.removeEventListener('visibilitychange', onVis)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('wheel', touched)
      camTween?.kill()
      camIntro?.kill()
      intro?.kill()
      controls.dispose()
      N.dispose()
      LK.dispose()
      stars?.dispose()
      particles?.dispose()
      hulls?.dispose()
      labels.dispose()
      tex.dot.dispose()
      tex.glow.dispose()
      composer?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      css2d.domElement.remove()
    },
  }
}
