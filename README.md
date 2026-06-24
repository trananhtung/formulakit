# formulakit

> Zero-dependency safe arithmetic expression evaluator for TypeScript. Parse and evaluate math formulas with variables, custom functions, and ternary logic — no `eval()`. Port of Python `simpleeval` / Go `expr` / C# `DynamicExpresso`.

[![npm](https://img.shields.io/npm/v/formulakit)](https://www.npmjs.com/package/formulakit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Install

```bash
npm install formulakit
```

## Quick start

```typescript
import { evaluate, compile } from "formulakit";

// one-shot evaluation
evaluate("2 + 3 * 4");              // 14
evaluate("sqrt(a^2 + b^2)", { a: 3, b: 4 });   // 5

// compile once, evaluate many times (faster)
const bmi = compile("weight / (height * height)");
bmi.evaluate({ weight: 70, height: 1.75 });     // 22.86
bmi.evaluate({ weight: 90, height: 1.80 });     // 27.78

// ternary / conditional
evaluate("qty >= 100 ? price * 0.8 : price", { qty: 150, price: 10 });  // 8
```

## Why formulakit?

| Package | Downloads/week | Status | TypeScript |
|---|---|---|---|
| `expr-eval` | ~200k | **Abandoned March 2021** | ❌ |
| `mathjs` | ~1.2M | Active | ✅ | Has 3 deps, 180KB |
| **`formulakit`** | — | **Active** | ✅ native |

`expr-eval` is the de-facto choice for safe expression evaluation but has been abandoned for 3+ years and has no TypeScript types. `mathjs` is excellent but ships 180KB of linear algebra, units, and symbolic math — overkill if you just need `"2 * x + 1"`. `formulakit` fills the gap: 0 dependencies, native TypeScript, ESM+CJS.

## Features

- **Safe** — pure AST evaluator, never calls `eval()` or `Function()`
- **Variables** — pass any `Record<string, number>` as context
- **Custom functions** — extend with your own named functions
- **Ternary operator** — `condition ? a : b`
- **Comparison & logical operators** — `==`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`, `!`
- **Right-associative `^`** — `2^3^2` = `2^9` = 512 (standard math)
- **Short-circuit** — `&&` and `||` skip the right side when not needed
- **compile()** — parse once, evaluate many times
- **variables()** — introspect which variables a formula uses

## API

### `evaluate(expr, vars?, opts?)`

```typescript
evaluate("x^2 + y^2", { x: 3, y: 4 })   // 25
evaluate("sin(PI/6)")                      // 0.5
```

### `tryEvaluate(expr, vars?, opts?)`

Returns `null` instead of throwing on parse/evaluation errors.

```typescript
tryEvaluate("1 + 2")           // 3
tryEvaluate("unknown_var")     // null
tryEvaluate("2 @ 3")           // null  (bad syntax)
```

### `compile(expr): CompiledFormula`

Pre-parse an expression for repeated use:

```typescript
const f = compile("a * b + c");
f.evaluate({ a: 1, b: 2, c: 3 })   // 5
f.evaluate({ a: 10, b: 20, c: 30 }) // 230

f.variables()  // ["a", "b", "c"]  — sorted list of identifiers
f.source       // "a * b + c"
```

### `parse(expr): ASTNode` / `evalAST(ast, opts?)`

Low-level access to the parse tree:

```typescript
import { parse, evalAST } from "formulakit";
const ast = parse("x + y");
evalAST(ast, { vars: { x: 10, y: 20 } });  // 30
```

## Operators

| Operator | Description | Example |
|---|---|---|
| `+` `-` | Addition / subtraction | `2 + 3`, `5 - 1` |
| `*` `/` | Multiplication / division | `3 * 4`, `10 / 2` |
| `%` | Modulo | `7 % 3` → 1 |
| `^` | Power (right-associative) | `2^3^2` = `2^9` = 512 |
| `==` `!=` | Equality (returns 0 or 1) | `x == y` |
| `<` `<=` `>` `>=` | Comparison | `a < b` |
| `&&` | Logical AND (short-circuit) | `x > 0 && x < 10` |
| `\|\|` | Logical OR (short-circuit) | `x < 0 \|\| x > 100` |
| `!` | Logical NOT | `!0` → 1 |
| `? :` | Ternary | `x > 0 ? x : -x` |
| `(` `)` | Grouping | `(a + b) * c` |

## Built-in constants

`PI`, `E`, `LN2`, `LN10`, `LOG2E`, `LOG10E`, `SQRT2`, `Infinity`, `NaN`

## Built-in functions

| Function | Description |
|---|---|
| `abs(x)` | Absolute value |
| `ceil(x)` / `floor(x)` / `round(x)` / `trunc(x)` | Rounding |
| `sign(x)` | Sign (-1 / 0 / 1) |
| `sqrt(x)` / `cbrt(x)` | Square/cube root |
| `pow(x, y)` | Power (same as `x^y`) |
| `exp(x)` | e^x |
| `log(x)` / `log2(x)` / `log10(x)` | Logarithms |
| `sin(x)` / `cos(x)` / `tan(x)` | Trig (radians) |
| `asin(x)` / `acos(x)` / `atan(x)` / `atan2(y,x)` | Inverse trig |
| `sinh(x)` / `cosh(x)` / `tanh(x)` | Hyperbolic |
| `min(...)` / `max(...)` | Min/max of N args |
| `clamp(x, lo, hi)` | Clamp to [lo, hi] |
| `hypot(x, y, ...)` | Hypotenuse |
| `isNaN(x)` / `isFinite(x)` | Tests (returns 0 or 1) |

## Options

```typescript
evaluate(expr, vars, {
  functions: { double: (x) => x * 2 },  // custom functions
  maxDepth:  200,                         // max AST recursion (default 200)
});
```

## Examples

### BMI calculator

```typescript
const bmi = compile("weight / height^2");
bmi.evaluate({ weight: 70, height: 1.75 });  // 22.86
```

### Compound interest

```typescript
evaluate("P * (1 + r/n) ^ (n * t)", { P: 1000, r: 0.05, n: 12, t: 10 });
// 1647.01
```

### Spreadsheet-style formula

```typescript
const formula = compile("IF > threshold ? value * multiplier : value");
// ... or with ternary:
compile("value > threshold ? value * multiplier : value")
  .evaluate({ value: 200, threshold: 100, multiplier: 1.5 });  // 300
```

### Dynamic pricing

```typescript
const price = compile("qty >= 100 ? base * 0.8 : qty >= 50 ? base * 0.9 : base");
price.evaluate({ qty: 150, base: 10 });  // 8
price.evaluate({ qty: 75, base: 10 });   // 9
price.evaluate({ qty: 10, base: 10 });   // 10
```

### Custom functions

```typescript
import { evaluate } from "formulakit";

evaluate("toCelsius(98.6)", {}, {
  functions: {
    toCelsius: (f) => (f - 32) * 5/9,
  },
});  // 37
```

## License

MIT © [trananhtung](https://github.com/trananhtung)
