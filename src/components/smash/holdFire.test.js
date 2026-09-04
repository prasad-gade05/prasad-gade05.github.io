import { describe, expect, it } from 'vitest'
import { HOLD_REPEAT_DELAY_MS, shouldHoldRepeat } from './holdFire'

describe('shouldHoldRepeat', () => {
  it('repeats the gun once the hold passes the delay', () => {
    expect(shouldHoldRepeat(0, HOLD_REPEAT_DELAY_MS, 'gun')).toBe(true)
    expect(shouldHoldRepeat(100, 100 + HOLD_REPEAT_DELAY_MS + 50, 'gun')).toBe(true)
  })

  it('stays single-shot before the delay elapses', () => {
    expect(shouldHoldRepeat(100, 100 + HOLD_REPEAT_DELAY_MS - 1, 'gun')).toBe(false)
    expect(shouldHoldRepeat(100, 100, 'gun')).toBe(false)
  })

  it('never repeats balls or a released pointer', () => {
    expect(shouldHoldRepeat(0, 10_000, 'ball')).toBe(false)
    expect(shouldHoldRepeat(null, 10_000, 'gun')).toBe(false)
    expect(shouldHoldRepeat(undefined, 10_000, 'gun')).toBe(false)
  })
})
