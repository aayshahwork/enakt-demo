/**
 * Simulated behavior: timers, token-by-token text, fake progress.
 * Everything is deterministic — same inputs, same timing, same output.
 */

export const TIMING = {
  routeSkeletonMs: 380,
  intakeThinkMs: 650,
  intakeTokenMs: 18,
  intakeBetweenMs: 420,
  mergeProgressMs: 1500,
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

/** Split text into display tokens: words with trailing whitespace kept attached. */
export function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? []
}

/**
 * Stream `text` token by token. Calls onChunk with the accumulated string.
 * Token cadence varies slightly by token length so it reads as generation, not a typewriter —
 * but it is a pure function of the text, so every take is identical.
 */
export async function streamText(
  text: string,
  onChunk: (partial: string) => void,
  opts: { tokenMs?: number; signal?: AbortSignal } = {},
): Promise<void> {
  const tokenMs = opts.tokenMs ?? TIMING.intakeTokenMs
  const tokens = tokenize(text)
  let acc = ""
  for (const tok of tokens) {
    acc += tok
    onChunk(acc)
    const punct = /[.,;:]\s*$/.test(tok) ? 90 : 0
    await wait(tokenMs + Math.min(tok.length, 10) * 2 + punct, opts.signal)
  }
}

/** Drive a 0..100 progress value over `durationMs` with an ease-out curve. */
export function runProgress(
  durationMs: number,
  onTick: (pct: number) => void,
  opts: { signal?: AbortSignal; fps?: number } = {},
): Promise<void> {
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

/** Animate a number from a to b over durationMs. */
export function tween(
  from: number,
  to: number,
  durationMs: number,
  onTick: (v: number) => void,
): () => void {
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
