// Shared control motion: thin ticks on confirmations and two drawn accents.
// Positions are viewport coordinates. Every effect is skipped under reduced motion.
// Speed lines and glint are adapted from Sakuga VFX core.js (MIT, Copyright (c) 2026 Justin Finkelman).

const LAYER_CLASS = 'pointer-events-none fixed inset-0 z-1001'

const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeIn = (t: number) => t ** 3
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const between = (min: number, max: number) => min + Math.random() * (max - min)
const themeColor = (token: string) =>
  getComputedStyle(document.body).getPropertyValue(token).trim()

export const motionAllowed = () =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface TickOptions {
  /** Direction the ticks fly, in radians (0 is right, -PI/2 is up). */
  direction?: number
  spread?: number
  length?: number
  distance?: number
}

let tickLayer: HTMLDivElement | null = null

/** Three thin DARE-red marks that fly off a point. */
export function ticks(
  x: number,
  y: number,
  {
    direction = -Math.PI / 4,
    spread = 1.1,
    length = 8,
    distance = 12,
  }: TickOptions = {}
) {
  if (!motionAllowed()) return
  if (!tickLayer) {
    tickLayer = document.createElement('div')
    tickLayer.className = LAYER_CLASS
    tickLayer.setAttribute('aria-hidden', 'true')
    document.body.append(tickLayer)
  }
  for (const offset of [-0.5, 0, 0.5]) {
    const degrees = ((direction + offset * spread) * 180) / Math.PI + 90
    const tick = document.createElement('i')
    tick.className = 'absolute w-0.5 rounded-full bg-dare'
    tick.style.cssText = `left:${x}px;top:${y}px;height:${length}px`
    const at = (travel: number, stretch: number) =>
      `translate(-50%,-50%) rotate(${degrees}deg) translateY(${-travel}px) scaleY(${stretch})`
    tickLayer.append(tick)
    tick.animate(
      [
        { transform: at(distance * 0.5, 0.3), opacity: 1 },
        { transform: at(distance, 1), opacity: 1, offset: 0.45 },
        { transform: at(distance * 1.6, 0), opacity: 0 },
      ],
      { duration: 380, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
    ).onfinish = () => tick.remove()
  }
}

type DrawAccent = (
  ctx: CanvasRenderingContext2D,
  progress: number,
  age: number
) => void

interface Accent {
  age: number
  life: number
  draw: DrawAccent
}

interface AccentLayer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  ratio: number
}

let accentLayer: AccentLayer | null = null
let accents: Accent[] = []
let frame = 0
let lastFrame = 0

function sizeAccentLayer(layer: AccentLayer) {
  layer.ratio = Math.min(2.5, window.devicePixelRatio)
  layer.canvas.width = window.innerWidth * layer.ratio
  layer.canvas.height = window.innerHeight * layer.ratio
}

function getAccentLayer() {
  if (accentLayer) return accentLayer
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  canvas.className = `${LAYER_CLASS} h-screen w-screen`
  canvas.setAttribute('aria-hidden', 'true')
  document.body.append(canvas)
  const layer: AccentLayer = { canvas, ctx, ratio: 1 }
  sizeAccentLayer(layer)
  window.addEventListener('resize', () => sizeAccentLayer(layer))
  accentLayer = layer
  return layer
}

function renderAccents(layer: AccentLayer, now: number) {
  // A frame's timestamp can be earlier than the moment an accent was added.
  const elapsed = Math.min(0.034, Math.max(0, (now - lastFrame) / 1000))
  lastFrame = now
  const { ctx, ratio } = layer
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  ctx.lineJoin = ctx.lineCap = 'round'
  accents = accents.filter((accent) => (accent.age += elapsed) < accent.life)
  for (const accent of accents) {
    ctx.save()
    accent.draw(ctx, accent.age / accent.life, accent.age)
    ctx.restore()
  }
  frame = accents.length
    ? requestAnimationFrame((time) => renderAccents(layer, time))
    : 0
}

function addAccent(life: number, draw: DrawAccent) {
  if (!motionAllowed()) return
  const layer = getAccentLayer()
  if (!layer) return
  accents.push({ age: 0, life, draw })
  if (!frame) {
    lastFrame = performance.now()
    frame = requestAnimationFrame((time) => renderAccents(layer, time))
  }
}

interface SpeedLineOptions {
  count?: number
  /** Direction the lines shoot, in radians (0 is right, PI is left). */
  direction?: number
  length?: number
  spread?: number
  life?: number
}

/** Strokes that shoot out one way and thin away. */
export function speedLines(
  x: number,
  y: number,
  {
    count = 6,
    direction = Math.PI,
    length = 44,
    spread = 12,
    life = 0.3,
  }: SpeedLineOptions = {}
) {
  const color = themeColor('--foreground')
  const cos = Math.cos(direction)
  const sin = Math.sin(direction)
  for (let i = 0; i < count; i++) {
    const side = between(-spread, spread)
    const reach = length * between(0.5, 1.3)
    const delay = between(0, 0.25)
    const width = between(1, 2.6)
    const startX = x - sin * side
    const startY = y + cos * side
    addAccent(life, (ctx, progress) => {
      const local = clamp01((progress - delay) / (1 - delay))
      if (local <= 0) return
      const head = reach * (0.2 + easeOut(local) * 1.2)
      const tail = reach * easeIn(local) * 1.4
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.7
      ctx.lineWidth = width * (1 - easeIn(local))
      ctx.beginPath()
      ctx.moveTo(startX + cos * tail, startY + sin * tail)
      ctx.lineTo(startX + cos * head, startY + sin * head)
      ctx.stroke()
    })
  }
}

/** A four-point sparkle that opens and closes. */
export function glint(x: number, y: number, radius = 6) {
  const fill = themeColor('--primary-foreground')
  const edge = themeColor('--dare')
  addAccent(0.6, (ctx, progress, age) => {
    const size = radius * Math.sin(progress * Math.PI) ** 0.6
    const waist = size * 0.16
    const star = new Path2D()
    star.moveTo(0, -size)
    star.quadraticCurveTo(waist, -waist, size * 0.7, 0)
    star.quadraticCurveTo(waist, waist, 0, size)
    star.quadraticCurveTo(-waist, waist, -size * 0.7, 0)
    star.quadraticCurveTo(-waist, -waist, 0, -size)
    ctx.translate(x, y)
    ctx.rotate(Math.sin(age * 3) * 0.2)
    ctx.fillStyle = fill
    ctx.fill(star)
    ctx.strokeStyle = edge
    ctx.lineWidth = 2
    ctx.stroke(star)
  })
}
