// Clamp a number into the range min..max.
// Version: 1.0.0
// Source: written for js-logic-library.
// License: Apache-2.0

/**
 * Limit a number to the inclusive range min..max.
 * @param {number} value - The input value.
 * @param {number} min - Lower bound (inclusive).
 * @param {number} max - Upper bound (inclusive); expected min <= max.
 * @returns {number} value limited to min..max.
 * @edge If value < min, returns min.
 * @edge If value > max, returns max.
 * @edge NaN in gives NaN out; arguments are not validated.
 * @example clamp(1.5, 0, 1) // => 1
 * @example clamp(0.25, 0, 1) // => 0.25
 */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
