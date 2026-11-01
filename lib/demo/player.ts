/**
 * Plays a flat, time-sorted list of events with timers. Pausable, resettable, speed-aware.
 * Deterministic: the order and content of events never depend on wall-clock time, only their spacing.
 */

import type { TimelineEvent } from "./script"

export type PlayerStatus = "idle" | "playing" | "paused" | "done"

export class TimelinePlayer {
  private events: TimelineEvent[]
  private apply: (e: TimelineEvent) => void
  private speed: () => number
  private onStatus: (s: PlayerStatus) => void
  private idx = 0
  /** Virtual position on the timeline in script ms. */
  private pos = 0
  private tickStart = 0
  private timer: number | null = null
  status: PlayerStatus = "idle"

  constructor(events: TimelineEvent[], apply: (e: TimelineEvent) => void, opts: { speed?: () => number; onStatus?: (s: PlayerStatus) => void } = {}) {
    this.events = [...events].sort((a, b) => a.t - b.t)
    this.apply = apply
    this.speed = opts.speed ?? (() => 1)
    this.onStatus = opts.onStatus ?? (() => {})
  }

  private setStatus(s: PlayerStatus) {
    this.status = s
    this.onStatus(s)
  }

  private schedule() {
    if (this.idx >= this.events.length) {
      this.setStatus("done")
      return
    }
    const next = this.events[this.idx]
    const delay = Math.max(0, (next.t - this.pos) / this.speed())
    this.tickStart = performance.now()
    this.timer = window.setTimeout(() => this.fire(), delay)
  }

  private fire() {
    this.timer = null
    // Apply every event that falls on the same tick so chips and canvas stay in lockstep.
    const t = this.events[this.idx].t
    this.pos = t
    while (this.idx < this.events.length && this.events[this.idx].t <= t) {
      this.apply(this.events[this.idx])
      this.idx++
    }
    if (this.status === "playing") this.schedule()
  }

  start() {
    if (this.status === "playing") return
    this.idx = 0
    this.pos = 0
    this.setStatus("playing")
    this.schedule()
  }

  pause() {
    if (this.status !== "playing") return
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
      this.pos += (performance.now() - this.tickStart) * this.speed()
    }
    this.setStatus("paused")
  }

  resume() {
    if (this.status !== "paused") return
    this.setStatus("playing")
    this.schedule()
  }

  toggle() {
    if (this.status === "playing") this.pause()
    else if (this.status === "paused") this.resume()
  }

  /** Re-time the pending event after a speed change. */
  retime() {
    if (this.status !== "playing") return
    this.pause()
    this.resume()
  }

  /** Apply everything that is left, synchronously. */
  skipToEnd() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    while (this.idx < this.events.length) {
      this.apply(this.events[this.idx])
      this.idx++
    }
    this.pos = this.events.length ? this.events[this.events.length - 1].t : 0
    this.setStatus("done")
  }

  stop() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    this.idx = 0
    this.pos = 0
    this.setStatus("idle")
  }
}
