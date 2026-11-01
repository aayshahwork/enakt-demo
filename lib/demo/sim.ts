/**
 * Small deterministic helpers: timers, eased progress, number tweens.
 */

export const TIMING = {
  routeSkeletonMs: 360,
  mergeProgressMs: 1200,
  toastMs: 3200,
}

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(t)
      reject(new DOMException("aborted", "AbortError"))
    })
  })
}

/** Drive a 0..100 progress value over `durationMs` with an ease-out curve. */
export function runProgress(durationMs: number, onTick: (pct: number) => void, opts: { signal?: AbortSignal; fps?: number } = {}): Promise<void> {
  const fps = opts.fps ?? 30
  const start = performance.now()
  return new Promise((resolve, reject) => {
    let raf = 0
    const tick = () => {
      if (opts.signal?.aborted) return reject(new DOMException("aborted", "AbortError"))
      const t = Math.min(1, (performance.now() - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      onTick(Math.round(eased * 100))
      if (t < 1) raf = window.setTimeout(tick, 1000 / fps)
      else resolve()
    }
    tick()
    opts.signal?.addEventListener("abort", () => clearTimeout(raf))
  })
}

/** Animate a number from a to b over durationMs. Returns a cancel function. */
export function tween(from: number, to: number, durationMs: number, onTick: (v: number) => void): () => void {
  const start = performance.now()
  let raf = 0
  const step = () => {
    const t = Math.min(1, (performance.now() - start) / durationMs)
    const eased = 1 - Math.pow(1 - t, 3)
    onTick(from + (to - from) * eased)
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}
