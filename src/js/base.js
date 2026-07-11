export function createBase(x, y) {
  return { x, y, destroyed: false };
}

export function destroyBase(base) {
  return { ...base, destroyed: true };
}

export function isBaseDestroyed(base) {
  return base.destroyed === true;
}
