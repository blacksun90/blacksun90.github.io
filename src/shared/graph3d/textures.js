import { CanvasTexture, SRGBColorSpace } from 'three'

// 캔버스로 만드는 흰 텍스처 둘. 색은 재질(color)로 입힌다.
function radial(size, stops) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [o, col] of stops) g.addColorStop(o, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

// 입자·별: 가운데가 단단하고 가장자리가 부드러운 점
export const softDot = () =>
  radial(64, [
    [0, 'rgba(255,255,255,1)'],
    [0.35, 'rgba(255,255,255,0.9)'],
    [0.7, 'rgba(255,255,255,0.18)'],
    [1, 'rgba(255,255,255,0)'],
  ])

// 빛무리: 넓고 옅게 번지는 원
export const glowDot = () =>
  radial(128, [
    [0, 'rgba(255,255,255,0.9)'],
    [0.18, 'rgba(255,255,255,0.45)'],
    [0.45, 'rgba(255,255,255,0.12)'],
    [1, 'rgba(255,255,255,0)'],
  ])
