// Clamp a number into the range min..max.
// Input: value, min, max (numbers, min <= max).
// Output: value limited to min..max; NaN in gives NaN out.
// Version: 1.0.0
// Source: written for js-logic-library.
// License: Apache-2.0

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
