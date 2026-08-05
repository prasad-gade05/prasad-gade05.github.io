export const MAX_ROTATION = 25;
const PERSPECTIVE = 600;
const SCALE = 1.03;

export const handleCardTilt = (event) => {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateY = ((x - centerX) / centerX) * MAX_ROTATION;
  const rotateX = ((centerY - y) / centerY) * MAX_ROTATION;

  card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${SCALE}, ${SCALE}, ${SCALE})`;
};

export const resetCardTilt = (event) => {
  event.currentTarget.style.transform = "";
};
