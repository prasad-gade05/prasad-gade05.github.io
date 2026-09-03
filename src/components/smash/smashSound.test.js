import { describe, expect, it } from 'vitest'
import { isAudioSupported, playGunshot, playSmashSound } from './smashSound'

describe('smashSound', () => {
  it('reports unsupported and no-ops without WebAudio', () => {
    expect(isAudioSupported()).toBe(false)
    expect(playSmashSound('glass', 1)).toBe(false)
    expect(playSmashSound('wood', 0.5)).toBe(false)
    expect(playGunshot(1)).toBe(false)
  })
})
