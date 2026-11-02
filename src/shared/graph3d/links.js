import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, LineSegments, NormalBlending, Points, PointsMaterial, ShaderMaterial } from 'three'
import { COLOR, colorOf } from './presets.js'

// 선: 한 덩어리 LineSegments. 꼭짓점마다 색(출발 묶음)과 투명도(선택·호버·흐림)를 따로 가진다.
const LINK_VERT = `attribute vec3 aColor; attribute float aAlpha; varying vec3 vC; varying float vA;
void main(){ vC = aColor; vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const LINK_FRAG = `uniform float uOpacity; varying vec3 vC; varying float vA;
void main(){ gl_FragColor = vec4(vC, vA * uOpacity); }`

export function makeLinks(links, preset, meshes) {
  const L = links.length
  const pos = new Float32Array(L * 6)
  const col = new Float32Array(L * 6)
  const alpha = new Float32Array(L * 2)
  links.forEach((l, i) => {
    // 출발 점의 색. layout 뒤라 l.source 는 점 객체다(프로젝트 전용 색이면 프로젝트에서 나가는 선도 그 색)
    const c = new Color(typeof l.source === 'object' ? colorOf(l.source, preset) : COLOR[l.group] || '#c8d4ff')
    for (const k of [0, 1]) {
      col.set([c.r, c.g, c.b], i * 6 + k * 3)
      alpha[i * 2 + k] = preset.linkAlpha
    }
  })
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('aColor', new BufferAttribute(col, 3))
  geo.setAttribute('aAlpha', new BufferAttribute(alpha, 1))
  const mat = new ShaderMaterial({ vertexShader: LINK_VERT, fragmentShader: LINK_FRAG, uniforms: { uOpacity: { value: 1 } }, transparent: true, depthWrite: false, blending: preset.additiveLinks ? AdditiveBlending : NormalBlending })
  const lines = new LineSegments(geo, mat)
  lines.frustumCulled = false
  const target = new Float32Array(L).fill(preset.linkAlpha)
  const api = {
    lines,
    target,
    // 점 위치를 선 끝에 반영
    sync() {
      for (let i = 0; i < L; i++) {
        const a = meshes.get(links[i].source.id).position
        const b = meshes.get(links[i].target.id).position
        pos[i * 6] = a.x
        pos[i * 6 + 1] = a.y
        pos[i * 6 + 2] = a.z
        pos[i * 6 + 3] = b.x
        pos[i * 6 + 4] = b.y
        pos[i * 6 + 5] = b.z
      }
      geo.attributes.position.needsUpdate = true
    },
    // 투명도를 목표값 쪽으로 k 만큼
    lerp(k) {
      let moved = false
      for (let i = 0; i < L; i++) {
        const d = target[i] - alpha[i * 2]
        if (Math.abs(d) > 0.002) {
          const v = alpha[i * 2] + d * k
          alpha[i * 2] = v
          alpha[i * 2 + 1] = v
          moved = true
        }
      }
      if (moved) geo.attributes.aAlpha.needsUpdate = true
    },
    dispose() {
      geo.dispose()
      mat.dispose()
    },
  }
  api.sync()
  return api
}

// 별 배경(e-2): 먼 구 껍질에 흩뿌린 점 두 층(잔별 많이, 밝은 별 조금). 가산 합성이라 겹쳐도 탁해지지 않는다.
export function makeStars(count, tex) {
  const group = new Group()
  const mats = []
  const tints = ['#ffffff', '#cfd7ff', '#9fe8ff', '#d9c4ff', '#ffe9b8']
  for (const [n, size, opacity] of [
    [Math.round(count * 0.8), 1.5, 0.55],
    [Math.round(count * 0.2), 2.8, 0.85],
  ]) {
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 650 + Math.random() * 500
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3)
      const c = new Color(tints[Math.floor(Math.random() * tints.length)])
      col.set([c.r, c.g, c.b], i * 3)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('color', new BufferAttribute(col, 3))
    const mat = new PointsMaterial({ size, map: tex.dot, transparent: true, opacity, depthWrite: false, blending: AdditiveBlending, vertexColors: true, sizeAttenuation: false })
    mat.userData.base = opacity
    const pts = new Points(geo, mat)
    pts.frustumCulled = false
    group.add(pts)
    mats.push(mat)
  }
  return {
    group,
    mats,
    dispose() {
      group.children.forEach((p) => {
        p.geometry.dispose()
        p.material.dispose()
      })
    },
  }
}
