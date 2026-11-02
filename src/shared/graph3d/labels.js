import { Group, Vector3 } from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { r3 } from './layout.js'

// 라벨은 진짜 DOM 버튼(CSS2D). 한글이 선명하고 키보드로 닿는다. 보이는 라벨만 Tab 순서에 든다.
// 점(mesh)의 자식으로 달지 않는다 — 도형이 돌면 라벨이 따라 돌고, 크기(scale)가 자식 좌표를 늘린다. 대신 프레임마다 위치를 베낀다.
export function makeLabels(nodes, meshes, clusterList, hulls, { onSelect, onHover, vis }) {
  const group = new Group()
  const items = new Map()
  for (const n of nodes) {
    const on = n.degree >= 4 || n.type === 'person'
    const el = document.createElement('button')
    el.type = 'button'
    el.className = `g3-label g3-label--${n.group} g3-label--${n.type}${on ? ' g3-label--on' : ''}`
    el.textContent = n.label
    el.dataset.id = n.id // 개발 중 확인용(어느 점의 이름표인지)
    el.tabIndex = on ? 0 : -1
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onSelect(n.id)
    })
    el.addEventListener('pointerenter', () => onHover(n.id))
    el.addEventListener('pointerleave', () => onHover(null))
    el.addEventListener('focus', () => onHover(n.id))
    el.addEventListener('blur', () => onHover(null))
    const obj = new CSS2DObject(el)
    obj.center.set(0.5, 1) // 아래 가운데가 기준점 → 점 위에 뜬다
    group.add(obj)
    items.set(n.id, { el, obj, on, type: n.type, up: r3(n) + 2.5 })
  }
  // 막 이름표(e-3): 누를 수 없는 글자
  const pods = []
  if (hulls) {
    for (const it of hulls.items) {
      const el = document.createElement('span')
      el.className = `g3-pod g3-pod--${it.cluster.group}`
      el.textContent = it.cluster.label
      const obj = new CSS2DObject(el)
      obj.center.set(0.5, 1)
      obj.position.copy(it.top)
      group.add(obj)
      pods.push({ el, obj, item: it })
    }
  }
  const tmp = new Vector3()
  let lastLayout = 0
  return {
    group,
    items,
    // 상태 → 클래스. 보이는 라벨만 Tab 순서에 든다(숨은 채 포커스되는 것이 가장 헷갈린다).
    set(id, { sel, near, hover, hnear, match, dim }) {
      const it = items.get(id)
      const el = it.el
      el.classList.toggle('is-selected', sel)
      el.classList.toggle('is-near', near)
      el.classList.toggle('is-hover', hover)
      el.classList.toggle('is-hover-near', hnear)
      el.classList.toggle('is-match', match)
      el.classList.toggle('is-dim', dim)
      it.tabIndex = (it.on || sel || near || match) && !dim ? 0 : -1
      el.tabIndex = window.matchMedia('(max-width: 760px)').matches && !dim ? 0 : it.tabIndex
    },
    sync() {
      const mobile = window.matchMedia('(max-width: 760px)').matches
      for (const [id, it] of items) {
        it.el.tabIndex = mobile ? (it.el.classList.contains('is-dim') || it.el.style.visibility === 'hidden' ? -1 : 0) : (it.tabIndex ?? (it.on ? 0 : -1))
        const p = meshes.get(id).position
        it.obj.position.set(p.x, p.y + it.up, p.z)
        // 이름표는 점이 맺힌 뒤에(등장 중엔 점보다 먼저 뜨지 않게)
        if (!it.born && (vis?.get(id)?.k ?? 1) > 0.6) {
          it.born = true
          it.el.classList.add('is-born')
        }
      }
      for (const pd of pods) pd.el.style.opacity = (pd.item.label === false ? 0 : pd.item.cur).toFixed(3)
    },
    // 확대 임계값 대신 실제 화면의 빈 공간을 기준으로 제목을 배치한다.
    declutter(rect) {
      const mobile = window.matchMedia('(max-width: 760px)').matches
      if (!mobile) {
        for (const it of items.values()) { it.el.style.visibility = ''; it.el.style.marginLeft = ''; it.el.style.marginTop = '' }
        return
      }
      if (performance.now() - lastLayout < 120) return
      lastLayout = performance.now()
      const priority = { person: 100, company: 90, hub: 80, ai: 80, project: 60, personal: 60 }
      const ranked = [...items.values()].sort((a, b) => {
        const score = (it) => (it.el.classList.contains('is-selected') || it.el.classList.contains('is-match') ? 200 : 0) + (priority[it.type] || 30)
        return score(b) - score(a)
      })
      const occupied = []
      const boxes = ranked.map((it) => {
        it.el.style.marginLeft = '0px'; it.el.style.marginTop = '0px'
        return { it, box: it.el.getBoundingClientRect() }
      })
      for (const { it, box } of boxes) {
        const el = it.el
        let placed = false
        if (it.born && !el.classList.contains('is-dim') && box.width && box.height) {
          const x = Math.max(rect.x + 8, Math.min(box.left, rect.x + rect.w - box.width - 8))
          const y = Math.max(rect.y + 8, Math.min(box.top, rect.y + rect.h - box.height - 8))
          for (const [dx, dy] of [[0, 0], [0, -30], [0, 30], [-36, 0], [36, 0], [0, -60], [0, 60]]) {
            const r = { left: x + dx, top: y + dy, right: x + dx + box.width, bottom: y + dy + box.height }
            if (r.left < rect.x + 4 || r.right > rect.x + rect.w - 4 || r.top < rect.y + 4 || r.bottom > rect.y + rect.h - 4) continue
            if (occupied.some((p) => r.left < p.right + 4 && r.right + 4 > p.left && r.top < p.bottom + 4 && r.bottom + 4 > p.top)) continue
            el.style.marginLeft = `${r.left - box.left}px`; el.style.marginTop = `${r.top - box.top}px`
            occupied.push(r); placed = true; break
          }
        }
        el.style.visibility = placed ? 'visible' : 'hidden'
        el.tabIndex = placed ? 0 : -1
      }
    },
    // 카메라에서 먼 점의 라벨은 작게 보이지 않게 — 거리로 등급을 매긴다(컨테이너 클래스는 엔진이 토글)
    dispose() {
      for (const it of items.values()) it.el.remove()
      for (const pd of pods) pd.el.remove()
      tmp.set(0, 0, 0)
    },
  }
}
