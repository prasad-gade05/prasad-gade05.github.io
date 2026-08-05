import { MAX_ROTATION, handleCardTilt, resetCardTilt } from "./cardTilt";

const PERSPECTIVE = 900;
const DEGREES_PER_PX = 3.6;
const HOLD_SCALE = 1.05;
const LIFT_PX = 24;
const DRAG_THRESHOLD = 4;
const VELOCITY_SMOOTHING = 0.5;
const STALE_MOVE_MS = 200;
const MAX_RELEASE_VELOCITY = 320;
const VELOCITY_DECAY = 0.92;
const MIN_SPIN_VELOCITY = 0.8;
const EASE_IN_ANGLE = 90;
const EASE_RATE = 0.18;
const SETTLE_ANGLE = 0.4;

const returnRate = (rotation) => Math.min(24, Math.max(6, Math.abs(rotation) / 150));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const states = new WeakMap();

const getState = (card) => {
  let state = states.get(card);
  if (!state) {
    state = {
      rotX: 0,
      rotY: 0,
      velX: 0,
      velY: 0,
      lastX: 0,
      lastY: 0,
      lastMoveAt: 0,
      dist: 0,
      dragging: false,
      mode: "idle",
      raf: 0,
    };
    states.set(card, state);
  }
  return state;
};

const applyTransform = (card, state) => {
  const lifted = state.mode === "hold";
  const scale = lifted ? HOLD_SCALE : 1;
  const lift = lifted ? LIFT_PX : 0;
  card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${state.rotX}deg) rotateY(${state.rotY}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(${lift}px)`;
};

const settle = (card, state) => {
  state.rotX = 0;
  state.rotY = 0;
  state.velX = 0;
  state.velY = 0;
  state.mode = "idle";
  state.raf = 0;
  card.style.transform = "";
  card.classList.remove("is-flipping");
};

const frame = (card, state) => {
  if (state.mode === "spin") {
    state.velX *= VELOCITY_DECAY;
    state.velY *= VELOCITY_DECAY;
    state.rotX += state.velX;
    state.rotY += state.velY;
    if (Math.abs(state.velX) + Math.abs(state.velY) < MIN_SPIN_VELOCITY) {
      state.mode = "return";
    }
  } else if (state.mode === "return") {
    if (Math.abs(state.rotX) <= EASE_IN_ANGLE && Math.abs(state.rotY) <= EASE_IN_ANGLE) {
      state.rotX += -state.rotX * EASE_RATE;
      state.rotY += -state.rotY * EASE_RATE;
      if (Math.abs(state.rotX) < SETTLE_ANGLE && Math.abs(state.rotY) < SETTLE_ANGLE) {
        settle(card, state);
        return;
      }
    } else {
      state.rotX -= Math.sign(state.rotX) * returnRate(state.rotX);
      state.rotY -= Math.sign(state.rotY) * returnRate(state.rotY);
    }
  } else {
    return;
  }
  applyTransform(card, state);
  state.raf = requestAnimationFrame(() => frame(card, state));
};

const release = (card, state, pointerId) => {
  state.dragging = false;
  if (typeof card.releasePointerCapture === "function") {
    try {
      card.releasePointerCapture(pointerId);
    } catch {
      // pointer is no longer active
    }
  }
  if (performance.now() - state.lastMoveAt > STALE_MOVE_MS) {
    state.velX = 0;
    state.velY = 0;
  }
  if (state.dist <= DRAG_THRESHOLD) {
    if (state.rotX === 0 && state.rotY === 0) {
      settle(card, state);
      return;
    }
    state.mode = "spin";
    state.velX = 0;
    state.velY = 0;
    card.classList.remove("is-flipping");
    state.raf = requestAnimationFrame(() => frame(card, state));
    return;
  }
  swallowNextClick(card);
  state.velX = clamp(state.velX, -MAX_RELEASE_VELOCITY, MAX_RELEASE_VELOCITY);
  state.velY = clamp(state.velY, -MAX_RELEASE_VELOCITY, MAX_RELEASE_VELOCITY);
  state.mode = "spin";
  state.raf = requestAnimationFrame(() => frame(card, state));
};

const swallowNextClick = (card) => {
  const swallow = (event) => {
    if (event.target.closest?.(".project-card") === card) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  document.addEventListener("click", swallow, { capture: true, once: true });
};

export const startCardFlip = (event) => {
  if (event.button !== undefined && event.button !== 0) return;
  const card = event.currentTarget;
  const state = getState(card);
  if (state.raf) cancelAnimationFrame(state.raf);
  const previousMode = state.mode;
  state.dragging = true;
  state.mode = "hold";
  state.dist = 0;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  if (previousMode === "idle") {
    const rect = card.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      state.rotX = ((centerY - y) / centerY) * MAX_ROTATION;
      state.rotY = ((x - centerX) / centerX) * MAX_ROTATION;
    }
  }
  event.preventDefault();
  card.classList.add("is-flipping");
  if (typeof card.setPointerCapture === "function") {
    try {
      card.setPointerCapture(event.pointerId);
    } catch {
      // pointer is already captured
    }
  }
  applyTransform(card, state);
};

export const moveCardFlip = (event) => {
  const card = event.currentTarget;
  const state = getState(card);
  if (!state.dragging) {
    if (state.mode !== "idle") return;
    handleCardTilt(event);
    return;
  }
  const dx = event.clientX - state.lastX;
  const dy = event.clientY - state.lastY;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  state.lastMoveAt = performance.now();
  state.dist += Math.abs(dx) + Math.abs(dy);
  if (state.dist > DRAG_THRESHOLD) {
    const stepX = dy * DEGREES_PER_PX;
    const stepY = dx * DEGREES_PER_PX;
    state.velX = state.velX * VELOCITY_SMOOTHING + stepX * (1 - VELOCITY_SMOOTHING);
    state.velY = state.velY * VELOCITY_SMOOTHING + stepY * (1 - VELOCITY_SMOOTHING);
    state.rotX += stepX;
    state.rotY += stepY;
  }
  applyTransform(card, state);
};

export const endCardFlip = (event) => {
  const card = event.currentTarget;
  const state = getState(card);
  if (!state.dragging) return;
  release(card, state, event.pointerId);
};

export const cancelCardFlip = endCardFlip;

export const leaveCardFlip = (event) => {
  const card = event.currentTarget;
  const state = getState(card);
  if (state.dragging || state.mode !== "idle") return;
  resetCardTilt(event);
};
