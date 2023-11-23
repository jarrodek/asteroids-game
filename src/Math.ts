export function random(min: number, max: number, precision = 1): number {
  if (min === undefined || max === undefined) {
    throw new Error("random require both 'min' and 'max' arguments.");
  }
  const factor = 10**precision;
  const randomNumber = Math.random() * (max - min) + min;

  return precision === 1 ? Math.round(randomNumber) : Math.round(randomNumber * factor) / factor;
}

export function toDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

export function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Translates radians to degrees but the value is always 
 * a positive number in a range <0, 360>.
 */
export function toAbsDegrees(radians: number): number {
  return Math.abs(toDegrees(radians) % 360 );
}
