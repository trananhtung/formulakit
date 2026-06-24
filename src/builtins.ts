import { FunctionMap, Variables } from "./types.js";

export const BUILTIN_VARS: Variables = {
  PI:  Math.PI,
  E:   Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT2: Math.SQRT2,
  Infinity: Infinity,
  NaN: NaN,
};

export const BUILTIN_FUNCTIONS: FunctionMap = {
  abs:   (x) => Math.abs(x),
  ceil:  (x) => Math.ceil(x),
  floor: (x) => Math.floor(x),
  round: (x) => Math.round(x),
  trunc: (x) => Math.trunc(x),
  sign:  (x) => Math.sign(x),

  sqrt:  (x) => Math.sqrt(x),
  cbrt:  (x) => Math.cbrt(x),
  pow:   (x, y) => Math.pow(x, y),
  exp:   (x) => Math.exp(x),
  log:   (x) => Math.log(x),
  log2:  (x) => Math.log2(x),
  log10: (x) => Math.log10(x),

  sin:   (x) => Math.sin(x),
  cos:   (x) => Math.cos(x),
  tan:   (x) => Math.tan(x),
  asin:  (x) => Math.asin(x),
  acos:  (x) => Math.acos(x),
  atan:  (x) => Math.atan(x),
  atan2: (y, x) => Math.atan2(y, x),
  sinh:  (x) => Math.sinh(x),
  cosh:  (x) => Math.cosh(x),
  tanh:  (x) => Math.tanh(x),

  min:   (...args) => Math.min(...args),
  max:   (...args) => Math.max(...args),
  clamp: (x, lo, hi) => Math.min(Math.max(x, lo), hi),

  hypot: (...args) => Math.hypot(...args),

  random: () => Math.random(),

  isNaN:    (x) => (isNaN(x) ? 1 : 0),
  isFinite: (x) => (isFinite(x) ? 1 : 0),
};
