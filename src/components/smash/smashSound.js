/**
 * Procedural break sounds for the Smash Room — no audio assets needed.
 * Glass = bright noise burst through a bandpass; wood = low thud.
 * Safe no-op (returns false) where WebAudio is unavailable, e.g. tests/SSR.
 */

export const isAudioSupported = () =>
  typeof window !== 'undefined' &&
  (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined')

/** Module-level mute switch — the overlay toggles it, every player honors it. */
let muted = false

export const setMuted = (value) => {
  muted = !!value
}

export const isMuted = () => muted

const getContext = () => {
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  if (!getContext.shared) getContext.shared = new Ctor()
  const ctx = getContext.shared
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}

export const playSmashSound = (material = 'glass', intensity = 1) => {
  try {
    if (muted || !isAudioSupported()) return false
    const ctx = getContext()
    if (!ctx) return false

    const volume = Math.min(1, Math.max(0.2, intensity))
    playCrackLayer(ctx, material, volume)
    playThumpLayer(ctx, volume)
    return true
  } catch {
    return false
  }
}

/**
 * Bright fracturing noise burst — the "shatter" top end.
 */
const playCrackLayer = (ctx, material, volume) => {
  const duration = material === 'wood' ? 0.22 : 0.32
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const decay = Math.exp((-4 * i) / data.length)
    data[i] = (Math.random() * 2 - 1) * decay
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  if (material === 'wood') {
    filter.type = 'lowpass'
    filter.frequency.value = 420
    filter.Q.value = 0.8
  } else {
    filter.type = 'bandpass'
    filter.frequency.value = 2900
    filter.Q.value = 0.9
  }

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.5 * volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

/**
 * Low sine-drop thump — the bodily "whump" under every impact.
 */const playThumpLayer = (ctx, volume) => {
  const duration = 0.28
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(130, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.55 * volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration + 0.02)
}

/**
 * Sharp procedural gunshot: crack transient + body. No assets.
 */
export const playGunshot = (intensity = 1) => {
  try {
    if (muted || !isAudioSupported()) return false
    const ctx = getContext()
    if (!ctx) return false

    const volume = Math.min(1, Math.max(0.2, intensity))
    const duration = 0.18
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      const decay = Math.exp((-9 * i) / data.length)
      data[i] = (Math.random() * 2 - 1) * decay
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 900

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.6 * volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    playThumpLayer(ctx, volume * 0.8)
    return true
  } catch {
    return false
  }
}
