import { AdditiveBlending, Color, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, OctahedronGeometry, SphereGeometry, Sprite, SpriteMaterial, TetrahedronGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { COLOR, colorOf } from './presets.js'
import { r3 } from './layout.js'

const WHITE = new Color('#ffffff')

// 종류별 도형(e-1). 도형을 안 쓰면 전부 구.
function geometryFor(n, shapes, cache) {
  const key = !shapes ? 'sphere' : n.type === 'person' ? 'person' : ['company', 'ai', 'hub'].includes(n.type) ? 'box' : n.type === 'skill' ? 'tetra' : ['flow', 'tool'].includes(n.type) ? 'octa' : 'sphere'
  if (!cache[key]) {
    cache[key] =
      key === 'person' ? new IcosahedronGeometry(1, 4) : key === 'box' ? new RoundedBoxGeometry(1.7, 1.7, 1.7, 3, 0.4) : key === 'tetra' ? new TetrahedronGeometry(1.45, 0) : key === 'octa' ? new OctahedronGeometry(1.3, 0) : new SphereGeometry(1, 28, 18)
  }
  return cache[key]
}

// 점(mesh)과 빛무리(sprite). 선택·호버 상태는 목표값으로 받아 매 프레임 조금씩 따라간다(트윈 200개 대신).
export function makeNodes(nodes, preset, tex) {
  const meshGroup = new Group()
  const glowGroup = new Group()
  const meshes = new Map()
  const glows = new Map()
  const cache = {}
  const vis = new Map() // id → { o, g, lit, to, tg, tlit, k(등장 불투명), s(등장 크기) }
  for (const n of nodes) {
    const col = new Color(colorOf(n, preset))
    const r = r3(n)
    const mat = preset.lights
      ? new MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: n.type === 'person' ? 0.9 : 0.32, roughness: 0.38, metalness: 0.12, transparent: true })
      : new MeshBasicMaterial({ color: n.type === 'person' ? col : col.clone().lerp(WHITE, 0.22), transparent: true })
    const mesh = new Mesh(geometryFor(n, preset.shapes, cache), mat)
    mesh.position.set(n.x, n.y, n.z)
    mesh.scale.setScalar(r)
    mesh.userData = {
      node: n,
      r,
      base: mesh.position.clone(),
      spin: preset.shapes && n.type !== 'person' ? 0.2 + Math.random() * 0.3 : 0,
      ph: Math.random() * Math.PI * 2,
      f: 0.25 + Math.random() * 0.35,
      baseColor: mat.color.clone(),
      baseEm: mat.emissiveIntensity || 0,
    }
    meshGroup.add(mesh)
    meshes.set(n.id, mesh)
    if (preset.glow !== 'none') {
      const full = preset.glow === 'full'
      const sm = new SpriteMaterial({ map: tex.glow, color: col, transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: full ? 0.36 : 0.3 })
      const sp = new Sprite(sm)
      sp.scale.setScalar(r * (full ? 5.4 : 4.2) * (n.type === 'person' ? 1.05 : 1) + 4) // 사람은 블룸까지 받으면 하얗게 터지므로 빛무리를 덜 키운다
      sp.position.copy(mesh.position)
      sp.userData.base = sm.opacity
      glowGroup.add(sp)
      glows.set(n.id, sp)
    }
    vis.set(n.id, { o: 1, g: 0.5, lit: 0, to: 1, tg: 0.5, tlit: 0, k: 1, s: 1 })
  }
  return {
    meshGroup,
    glowGroup,
    meshes,
    glows,
    vis,
    setTarget(id, { opacity, glow, lit }) {
      const v = vis.get(id)
      v.to = opacity
      v.tg = glow
      v.tlit = lit
    },
    // dt 초 진행. drift 면 제자리에서 아주 천천히 흔들린다(선·입자·라벨은 mesh 위치를 읽으므로 따라온다).
    update(dt, t, drift) {
      const k = Math.min(1, dt * 7)
      for (const [id, m] of meshes) {
        const v = vis.get(id)
        const u = m.userData
        v.o += (v.to - v.o) * k
        v.g += (v.tg - v.g) * k
        v.lit += (v.tlit - v.lit) * k
        m.material.opacity = v.o * v.k
        if (u.baseEm) m.material.emissiveIntensity = u.baseEm * (1 + v.lit * 1.6)
        else m.material.color.copy(u.baseColor).lerp(WHITE, v.lit * 0.5)
        m.scale.setScalar(u.r * v.s * (1 + v.lit * 0.15))
        if (u.spin) m.rotation.y += u.spin * dt
        if (drift) m.position.set(u.base.x + Math.sin(t * u.f + u.ph) * 1.4, u.base.y + Math.sin(t * u.f * 0.8 + u.ph * 1.7) * 1.4, u.base.z + Math.cos(t * u.f * 0.6 + u.ph) * 1.4)
        const g = glows.get(id)
        if (g) {
          g.material.opacity = g.userData.base * (0.7 + 0.9 * v.g) * v.o * v.k
          g.position.copy(m.position)
        }
      }
    },
    dispose() {
      for (const g of Object.values(cache)) g.dispose()
      for (const m of meshes.values()) m.material.dispose()
      for (const s of glows.values()) s.material.dispose()
    },
  }
}
