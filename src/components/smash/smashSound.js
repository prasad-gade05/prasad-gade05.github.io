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
 * dest/rate default to the historic behavior so smash sounds are untouched;
 * the gunshot passes its own bus + slight random detune.
 */
const playThumpLayer = (ctx, volume, dest, rate = 1) => {
  const duration = 0.28
  const out = dest || ctx.destination
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(130 * rate, t)
  osc.frequency.exponentialRampToValueAtTime(38 * rate, t + duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.55 * volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

  osc.connect(gain)
  gain.connect(out)
  osc.start()
  osc.stop(t + duration + 0.02)
}

/* Shared glue compressor for gun layers — keeps full-auto bursts from
 * clipping harshly. Cached on the shared context; falls back to the raw
 * destination where DynamicsCompressor is unavailable. Sound only. */
const getGunBus = (ctx) => {
  try {
    if (!getContext._bus) {
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -18
      comp.knee.value = 20
      comp.ratio.value = 8
      comp.attack.value = 0.002
      comp.release.value = 0.12
      comp.connect(ctx.destination)
      getContext._bus = comp
    }
    return getContext._bus
  } catch {
    return ctx.destination
  }
}

const makeNoiseBuffer = (ctx, duration, decayExp) => {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const decay = Math.exp((-decayExp * i) / data.length)
    data[i] = (Math.random() * 2 - 1) * decay
  }
  return buffer
}

/**
 * Layered procedural gunshot: supersonic crack + powder body + bolt click +
 * short room slap + chest thump. Same signature, same early-returns, same
 * playful volume clamp — only the sound changed, not the firing behavior.
 * A small random detune keeps hold-fire bursts from sounding machine-like.
 */
export const playGunshot = (intensity = 1) => {
  try {
    if (muted || !isAudioSupported()) return false
    const ctx = getContext()
    if (!ctx) return false

    const volume = Math.min(1, Math.max(0.2, intensity))
    const t = ctx.currentTime
    const detune = 1 + (Math.random() * 0.08 - 0.04)
    const bus = getGunBus(ctx)

    // Crack — the supersonic snap up front (short, bright)
    const crackDur = 0.12
    const crackSrc = ctx.createBufferSource()
    crackSrc.buffer = makeNoiseBuffer(ctx, crackDur, 9)
    const crackFilter = ctx.createBiquadFilter()
    crackFilter.type = 'highpass'
    crackFilter.frequency.value = 1500 * detune
    const crackGain = ctx.createGain()
    crackGain.gain.setValueAtTime(0.55 * volume, t)
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + crackDur)
    crackSrc.connect(crackFilter)
    crackFilter.connect(crackGain)
    crackGain.connect(bus)
    crackSrc.start(t)

    // Body — the powder bloom underneath (longer, darker)
    const bodyDur = 0.3
    const bodySrc = ctx.createBufferSource()
    bodySrc.buffer = makeNoiseBuffer(ctx, bodyDur, 5)
    const bodyFilter = ctx.createBiquadFilter()
    bodyFilter.type = 'lowpass'
    bodyFilter.frequency.value = 420 * detune
    const bodyGain = ctx.createGain()
    bodyGain.gain.setValueAtTime(0.5 * volume, t)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + bodyDur)
    bodySrc.connect(bodyFilter)
    bodyFilter.connect(bodyGain)
    bodyGain.connect(bus)
    bodySrc.start(t)

    // Bolt click — faint mechanical clack just after ignition
    const mechDur = 0.06
    const mechSrc = ctx.createBufferSource()
    mechSrc.buffer = makeNoiseBuffer(ctx, mechDur, 12)
    const mechFilter = ctx.createBiquadFilter()
    mechFilter.type = 'bandpass'
    mechFilter.frequency.value = 2600 * detune
    mechFilter.Q.value = 1.1
    const mechGain = ctx.createGain()
    const mechAt = t + 0.02
    mechGain.gain.setValueAtTime(0.16 * volume, mechAt)
    mechGain.gain.exponentialRampToValueAtTime(0.001, mechAt + mechDur)
    mechSrc.connect(mechFilter)
    mechFilter.connect(mechGain)
    mechGain.connect(bus)
    mechSrc.start(mechAt)

    // Room slap — one cheap echo off the walls so shots sit in a space
    try {
      const delay = ctx.createDelay(0.5)
      delay.delayTime.value = 0.09
      const feedback = ctx.createGain()
      feedback.gain.value = 0.32
      const wet = ctx.createGain()
      wet.gain.value = 0.16 * volume
      crackGain.connect(delay)
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(wet)
      wet.connect(bus)
    } catch {
      // delay unavailable — dry layers above already carry the shot
    }

    playThumpLayer(ctx, volume * 0.9, bus, detune)
    return true
  } catch {
    return false
  }
}
