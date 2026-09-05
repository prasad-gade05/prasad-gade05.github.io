import { describe, expect, it } from 'vitest'
import { isAudioSupported, isMuted, playGunshot, playSmashSound, setMuted } from './smashSound'

describe('smashSound', () => {
  it('reports unsupported and no-ops without WebAudio', () => {
    expect(isAudioSupported()).toBe(false)
    expect(playSmashSound('glass', 1)).toBe(false)
    expect(playSmashSound('wood', 0.5)).toBe(false)
    expect(playGunshot(1)).toBe(false)
  })

  it('mutes every player until unmuted', () => {
    expect(isMuted()).toBe(false)
    setMuted(true)
    expect(isMuted()).toBe(true)
    expect(playSmashSound('glass', 1)).toBe(false)
    expect(playGunshot(1)).toBe(false)
    setMuted(false)
    expect(isMuted()).toBe(false)
  })

  it('coerces the mute flag to boolean', () => {
    setMuted(1)
    expect(isMuted()).toBe(true)
    setMuted(0)
    expect(isMuted()).toBe(false)
  })
})
