import { Vector3 } from 'three'
import { gsap } from '../gsap.js'

const NARROW = () => window.matchMedia('(max-width: 760px)').matches
const cssPx = (name, fallback) => parseInt(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback

// 패널이 가리지 않는 화면 사각형(E 의 availRect 와 같은 규칙).
// 패널 높이는 내용에 따라 달라지므로(아래 시트) 실제 사각형을 읽는다. 없으면 토큰값으로 어림.
export function availRect(W, H, hasPanel) {
  const top = document.querySelector('.top')?.getBoundingClientRect().bottom || cssPx('--top-h', 72)
  const panel = hasPanel ? document.querySelector('.panel')?.getBoundingClientRect() : null
  if (NARROW()) {
    return { x: 0, y: top, w: W, h: Math.max(120, H - top) }
  }
  const right = panel ? panel.left - 16 : hasPanel ? W - cssPx('--panel-w', 440) - 48 : W
  return { x: 0, y: top, w: Math.max(240, right), h: H - top }
}

// 점들이 사각형 rect 안에 들어오는 카메라 자리. 보는 방향은 그대로 두고, 점들의 (화면 기준) 가운데가 rect 의 중심에 오도록
// 과녁(target)을 화면 옆으로 민다 — 그래서 패널 옆(좁은 화면에선 시트 위)에 선다.
// 거리는 원근을 셈에 넣어 점마다 정확히: 카메라에 가까운 점일수록 크게 보이므로 그만큼 더 물러선다.
export function computeFrame(camera, controls, W, H, rect, points, pad, [dMin, dMax], fill = 0.9) {
  camera.updateMatrixWorld()
  const t = Math.tan((camera.fov * Math.PI) / 360)
  const aspect = W / H
  const kx = t * aspect * (rect.w / W) * fill // 거리 1당 화면에 담기는 반폭(가로)
  const ky = t * (rect.h / H) * fill
  const dir = camera.position.clone().sub(controls.target).normalize() // 과녁 → 카메라
  const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize()
  const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize()
  const ps = points.map((p) => ({ u: p.dot(right), v: p.dot(up), w: p.dot(dir) }))
  let uMin = Infinity
  let uMax = -Infinity
  let vMin = Infinity
  let vMax = -Infinity
  let wSum = 0
  for (const p of ps) {
    uMin = Math.min(uMin, p.u)
    uMax = Math.max(uMax, p.u)
    vMin = Math.min(vMin, p.v)
    vMax = Math.max(vMax, p.v)
    wSum += p.w
  }
  const cu = (uMin + uMax) / 2
  const cv = (vMin + vMax) / 2
  const cw = wSum / Math.max(1, ps.length)
  const xn = ((rect.x + rect.w / 2) / W) * 2 - 1 // rect 중심의 NDC 좌표
  const yn = 1 - ((rect.y + rect.h / 2) / H) * 2
  // 점마다 필요한 거리. 과녁이 rect 중심 쪽으로 밀려 있으므로(xn·yn), 카메라에 가까운 점(dw > 0)은
  // 그 밀림이 더 크게 투영된다 — |옆 거리 + xn·t·aspect·dw| 로 보정해야 가까운 점이 rect 밖으로 새지 않는다.
  let d = dMin
  for (const p of ps) {
    const dw = p.w - cw
    d = Math.max(d, dw + (Math.abs(p.u - cu + xn * t * aspect * dw) + pad) / kx, dw + (Math.abs(p.v - cv + yn * t * dw) + pad) / ky)
  }
  d = Math.min(dMax, d)
  const halfH = d * t
  const halfW = halfH * aspect
  const center = new Vector3().addScaledVector(right, cu).addScaledVector(up, cv).addScaledVector(dir, cw)
  const target = center.addScaledVector(right, -xn * halfW).addScaledVector(up, -yn * halfH)
  const position = target.clone().addScaledVector(dir, d)
  return { target, position, distance: d }
}

// 카메라 이동. instant 면 바로, 아니면 GSAP 으로 과녁과 자리를 함께 옮긴다.
export function flyTo(camera, controls, { target, position }, { instant = false, duration = 0.9, onDone } = {}) {
  const o = { px: camera.position.x, py: camera.position.y, pz: camera.position.z, tx: controls.target.x, ty: controls.target.y, tz: controls.target.z }
  const to = { px: position.x, py: position.y, pz: position.z, tx: target.x, ty: target.y, tz: target.z }
  const apply = () => {
    camera.position.set(o.px, o.py, o.pz)
    controls.target.set(o.tx, o.ty, o.tz)
    controls.update()
  }
  if (instant) {
    Object.assign(o, to)
    apply()
    onDone?.()
    return null
  }
  return gsap.to(o, { ...to, duration, ease: 'expo.out', onUpdate: apply, onComplete: onDone })
}
