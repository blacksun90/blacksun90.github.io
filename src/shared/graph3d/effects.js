import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, Points, PointsMaterial, ShaderMaterial, Vector3 } from 'three'
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { COLOR, colorOf } from './presets.js'
import { r3 } from './layout.js'

const WHITE = new Color('#ffffff')

// 선을 따라 흐르는 입자(e-1 전부, e-3 고른 점의 선만). 방향은 선의 방향 = 나 → 회사 → 프로젝트 → 기술.
// 밝기는 색으로 조절한다 — 가산 합성에서 검정은 안 보이므로 꺼진 입자는 검게 두면 된다.
export function makeParticles(links, preset, meshes, tex) {
  const spec = []
  links.forEach((l, i) => {
    const n = l.w >= 3 ? 3 : l.w === 2 ? 2 : 1
    for (let k = 0; k < n; k++) spec.push({ link: i, u: (k + Math.random()) / n, speed: 0.1 + Math.random() * 0.08 })
  })
  const N = spec.length
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  const base = spec.map((s) => new Color(colorOf(links[s.link].source, preset)).lerp(WHITE, 0.55))
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('color', new BufferAttribute(col, 3))
  const mat = new PointsMaterial({ size: 5.5, map: tex.dot, transparent: true, depthWrite: false, blending: AdditiveBlending, vertexColors: true, sizeAttenuation: true })
  const points = new Points(geo, mat)
  points.frustumCulled = false
  const active = new Uint8Array(links.length).fill(preset.particles === 'all' ? 1 : 0)
  const cur = new Float32Array(N).fill(preset.particles === 'all' ? 1 : 0)
  return {
    points,
    mat,
    setActive(fn) {
      for (let i = 0; i < links.length; i++) active[i] = fn(links[i], i) ? 1 : 0
    },
    update(dt) {
      let i3 = 0
      for (let i = 0; i < N; i++) {
        const s = spec[i]
        const l = links[s.link]
        s.u += s.speed * dt
        if (s.u > 1) s.u -= 1
        const a = meshes.get(l.source.id).position
        const b = meshes.get(l.target.id).position
        pos[i3] = a.x + (b.x - a.x) * s.u
        pos[i3 + 1] = a.y + (b.y - a.y) * s.u
        pos[i3 + 2] = a.z + (b.z - a.z) * s.u
        cur[i] += (active[s.link] - cur[i]) * Math.min(1, dt * 6)
        const fade = Math.min(1, Math.min(s.u, 1 - s.u) * 7) * cur[i] // 양 끝에서는 사그라든다(점 밖으로 튀어나오지 않게)
        col[i3] = base[i].r * fade
        col[i3 + 1] = base[i].g * fade
        col[i3 + 2] = base[i].b * fade
        i3 += 3
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    },
    dispose() {
      geo.dispose()
      mat.dispose()
    },
  }
}

// 묶음을 감싸는 반투명 막(e-3). 볼록 껍질(ConvexGeometry) + 가장자리가 밝아지는 셰이더 — 비눗방울 같은 막.
const HULL_VERT = `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`
// uStrength: 막의 세기. 투명도와 가장자리 밝기를 함께 줄여야 블룸 아래서 테두리만 빛나는 일이 없다
// 부동소수점 오차로 |내적|이 1을 넘으면 음수의 소수 거듭제곱이 NaN이 된다.
// 법선/시선이 0인 경우도 보호하고 pow 입력을 제한해 블룸 전체로 NaN이 번지는 것을 막는다.
const HULL_FRAG = `uniform vec3 uColor; uniform float uOpacity; uniform float uStrength; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n = vN * inversesqrt(max(dot(vN, vN), 1e-8));
  vec3 v = vV * inversesqrt(max(dot(vV, vV), 1e-8));
  float facing = clamp(abs(dot(n, v)), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.4);
  float a = (0.045 + 0.5 * rim) * uOpacity * uStrength;
  gl_FragColor = vec4(uColor * (0.8 + 0.6 * rim * uStrength), a);
}`

// 26방향 패딩(축 6 + 모서리 12 + 꼭짓점 8): 점이 둘셋뿐인 pod 도 부피가 생기고, 막이 각지지 않고 둥글어진다
const DIRS = []
for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
  if (x || y || z) DIRS.push(new Vector3(x, y, z).normalize())
}

export function makeHulls(clusterList, meshes, strength = 1) {
  const group = new Group()
  const items = []
  for (const c of clusterList) {
    const pts = []
    for (const m of c.members) {
      const p = meshes.get(m.id).position
      const pad = r3(m) + (strength < 1 ? 9 : 11) // 약한 막은 점에 더 바싹
      for (const d of DIRS) pts.push(p.clone().addScaledVector(d, pad))
    }
    let geo = new ConvexGeometry(pts)
    geo.deleteAttribute('normal') // 면 법선을 지우고 꼭짓점을 합쳐야 부드러운 법선이 나온다
    geo.deleteAttribute('uv')
    geo = mergeVertices(geo, 1e-3)
    geo.computeVertexNormals()
    geo.computeBoundingBox()
    const mat = new ShaderMaterial({ vertexShader: HULL_VERT, fragmentShader: HULL_FRAG, uniforms: { uColor: { value: new Color(COLOR[c.group]) }, uOpacity: { value: 1 }, uStrength: { value: strength } }, transparent: true, depthWrite: false, side: DoubleSide })
    const mesh = new Mesh(geo, mat)
    mesh.renderOrder = -1
    mesh.userData.cluster = c
    group.add(mesh)
    const bb = geo.boundingBox
    const top = new Vector3((bb.min.x + bb.max.x) / 2, bb.max.y + 3, (bb.min.z + bb.max.z) / 2)
    items.push({ cluster: c, mesh, mat, top, cur: 1, target: 1 })
  }
  return {
    group,
    items,
    lerp(k) {
      for (const it of items) {
        const d = it.target - it.cur
        if (Math.abs(d) > 0.003) {
          it.cur += d * k
          it.mat.uniforms.uOpacity.value = it.cur
        }
      }
    },
    dispose() {
      for (const it of items) {
        it.mesh.geometry.dispose()
        it.mat.dispose()
      }
    },
  }
}
