/**
 * Hold-to-fire timing contract for the Smash Room gun.
 *
 * A tap fires once on press. Keeping the pointer down past
 * HOLD_REPEAT_DELAY_MS turns the gun automatic: the scene's frame loop
 * keeps firing (the gun's own cooldown still rate-limits the stream).
 * Balls stay click-only — lobbing on every frame would feel wild.
 */

export const HOLD_REPEAT_DELAY_MS = 260

export const shouldHoldRepeat = (heldSince, now, weapon) =>
  weapon === 'gun' && heldSince != null && now - heldSince >= HOLD_REPEAT_DELAY_MS
