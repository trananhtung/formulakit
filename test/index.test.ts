import { evaluate, tryEvaluate, compile, parse, evalAST, FormulaError } from "../src/index.js";

// ── 1. basic arithmetic ──────────────────────────────────────────────────────

describe("arithmetic", () => {
  test("addition", () => expect(evaluate("1 + 2")).toBe(3));
  test("subtraction", () => expect(evaluate("5 - 3")).toBe(2));
  test("multiplication", () => expect(evaluate("3 * 4")).toBe(12));
  test("division", () => expect(evaluate("10 / 4")).toBe(2.5));
  test("modulo", () => expect(evaluate("10 % 3")).toBe(1));
  test("power ^", () => expect(evaluate("2 ^ 10")).toBe(1024));
  test("power nested", () => expect(evaluate("2 ^ 3 ^ 2")).toBe(512));  // right-assoc: 2^(3^2)=2^9=512
  test("unary minus", () => expect(evaluate("-5")).toBe(-5));
  test("unary minus complex", () => expect(evaluate("-(3 + 2)")).toBe(-5));
  test("unary plus", () => expect(evaluate("+7")).toBe(7));
});

// ── 2. operator precedence ───────────────────────────────────────────────────

describe("precedence", () => {
  test("mul before add", () => expect(evaluate("2 + 3 * 4")).toBe(14));
  test("parentheses override", () => expect(evaluate("(2 + 3) * 4")).toBe(20));
  test("nested parens", () => expect(evaluate("((2 + 3) * (4 - 1))")).toBe(15));
  test("mixed", () => expect(evaluate("2 + 3 * 4 - 1")).toBe(13));
  test("power over mul", () => expect(evaluate("2 * 3 ^ 2")).toBe(18));
});

// ── 3. floats ────────────────────────────────────────────────────────────────

describe("floats", () => {
  test("float literal", () => expect(evaluate("3.14")).toBeCloseTo(3.14));
  test("float ops", () => expect(evaluate("0.1 + 0.2")).toBeCloseTo(0.3));
  test("scientific notation", () => expect(evaluate("1e3")).toBe(1000));
  test("negative exp", () => expect(evaluate("1e-3")).toBeCloseTo(0.001));
  test("1.5e2", () => expect(evaluate("1.5e2")).toBe(150));
});

// ── 4. variables ─────────────────────────────────────────────────────────────

describe("variables", () => {
  test("simple var", () => expect(evaluate("x + 1", { x: 5 })).toBe(6));
  test("multiple vars", () => expect(evaluate("a * b - c", { a: 3, b: 4, c: 2 })).toBe(10));
  test("built-in PI", () => expect(evaluate("PI")).toBeCloseTo(Math.PI));
  test("built-in E", () => expect(evaluate("E")).toBeCloseTo(Math.E));
  test("var in expression", () => expect(evaluate("2 * PI * r", { r: 5 })).toBeCloseTo(2 * Math.PI * 5));
  test("undefined variable throws", () => {
    expect(() => evaluate("x")).toThrow(FormulaError);
  });
});

// ── 5. built-in functions ────────────────────────────────────────────────────

describe("built-in functions", () => {
  test("abs", () => expect(evaluate("abs(-5)")).toBe(5));
  test("ceil", () => expect(evaluate("ceil(2.1)")).toBe(3));
  test("floor", () => expect(evaluate("floor(2.9)")).toBe(2));
  test("round", () => expect(evaluate("round(2.5)")).toBe(3));
  test("sqrt", () => expect(evaluate("sqrt(9)")).toBe(3));
  test("pow", () => expect(evaluate("pow(2, 8)")).toBe(256));
  test("log", () => expect(evaluate("log(E)")).toBeCloseTo(1));
  test("log10", () => expect(evaluate("log10(100)")).toBeCloseTo(2));
  test("log2", () => expect(evaluate("log2(8)")).toBeCloseTo(3));
  test("sin", () => expect(evaluate("sin(0)")).toBe(0));
  test("cos", () => expect(evaluate("cos(0)")).toBe(1));
  test("tan", () => expect(evaluate("tan(0)")).toBe(0));
  test("min", () => expect(evaluate("min(3, 1, 4, 1, 5)")).toBe(1));
  test("max", () => expect(evaluate("max(3, 1, 4, 1, 5)")).toBe(5));
  test("clamp", () => expect(evaluate("clamp(15, 0, 10)")).toBe(10));
  test("clamp low", () => expect(evaluate("clamp(-5, 0, 10)")).toBe(0));
  test("hypot", () => expect(evaluate("hypot(3, 4)")).toBe(5));
  test("atan2", () => expect(evaluate("atan2(1, 1)")).toBeCloseTo(Math.PI / 4));
  test("exp", () => expect(evaluate("exp(1)")).toBeCloseTo(Math.E));
  test("sign", () => expect(evaluate("sign(-7)")).toBe(-1));
  test("trunc", () => expect(evaluate("trunc(-2.9)")).toBe(-2));
  test("cbrt", () => expect(evaluate("cbrt(27)")).toBeCloseTo(3));
});

// ── 6. custom functions ──────────────────────────────────────────────────────

describe("custom functions", () => {
  test("add custom fn", () => {
    const result = evaluate("double(x)", { x: 5 }, {
      functions: { double: (x) => x * 2 },
    });
    expect(result).toBe(10);
  });

  test("custom overrides builtin name", () => {
    const result = evaluate("abs(x)", { x: -7 }, {
      functions: { abs: (x) => x * 100 },
    });
    expect(result).toBe(-700);
  });
});

// ── 7. comparison operators ──────────────────────────────────────────────────

describe("comparison operators", () => {
  test("==", () => expect(evaluate("3 == 3")).toBe(1));
  test("== false", () => expect(evaluate("3 == 4")).toBe(0));
  test("!=", () => expect(evaluate("3 != 4")).toBe(1));
  test("!= false", () => expect(evaluate("3 != 3")).toBe(0));
  test("<", () => expect(evaluate("2 < 3")).toBe(1));
  test("< false", () => expect(evaluate("3 < 2")).toBe(0));
  test("<=", () => expect(evaluate("3 <= 3")).toBe(1));
  test(">", () => expect(evaluate("3 > 2")).toBe(1));
  test(">=", () => expect(evaluate("3 >= 3")).toBe(1));
});

// ── 8. logical operators ─────────────────────────────────────────────────────

describe("logical operators", () => {
  test("&&", () => expect(evaluate("1 && 1")).toBe(1));
  test("&& false", () => expect(evaluate("1 && 0")).toBe(0));
  test("|| true", () => expect(evaluate("0 || 1")).toBe(1));
  test("|| false", () => expect(evaluate("0 || 0")).toBe(0));
  test("! true", () => expect(evaluate("!0")).toBe(1));
  test("! false", () => expect(evaluate("!1")).toBe(0));
  test("short-circuit &&", () => {
    // if left is 0, right should not run (no error)
    expect(evaluate("0 && x", { x: 0 })).toBe(0);
    // left is truthy — right evaluated
    expect(evaluate("1 && 2")).toBe(2);
  });
  test("short-circuit ||", () => {
    expect(evaluate("1 || x", {})).toBe(1);
  });
});

// ── 9. ternary ───────────────────────────────────────────────────────────────

describe("ternary operator", () => {
  test("true branch", () => expect(evaluate("1 ? 42 : 0")).toBe(42));
  test("false branch", () => expect(evaluate("0 ? 99 : -1")).toBe(-1));
  test("nested ternary", () => {
    expect(evaluate("x > 0 ? 1 : x < 0 ? -1 : 0", { x: -5 })).toBe(-1);
    expect(evaluate("x > 0 ? 1 : x < 0 ? -1 : 0", { x: 0 })).toBe(0);
    expect(evaluate("x > 0 ? 1 : x < 0 ? -1 : 0", { x: 3 })).toBe(1);
  });
  test("ternary with vars", () => {
    expect(evaluate("a > b ? a : b", { a: 3, b: 7 })).toBe(7);
  });
});

// ── 10. compile / CompiledFormula ────────────────────────────────────────────

describe("compile()", () => {
  test("reuse compiled formula", () => {
    const f = compile("x ^ 2 + y ^ 2");
    expect(f.evaluate({ x: 3, y: 4 })).toBe(25);
    expect(f.evaluate({ x: 5, y: 12 })).toBe(169);
  });

  test("variables() lists referenced vars", () => {
    const f = compile("a + b * c + PI");
    // PI is a builtin const, should still appear if referenced as identifier
    const vars = f.variables();
    expect(vars).toContain("a");
    expect(vars).toContain("b");
    expect(vars).toContain("c");
    expect(vars).toContain("PI");
  });

  test("source preserved", () => {
    const expr = "2 * PI * r";
    const f = compile(expr);
    expect(f.source).toBe(expr);
  });
});

// ── 11. tryEvaluate ───────────────────────────────────────────────────────────

describe("tryEvaluate()", () => {
  test("returns null on error", () => expect(tryEvaluate("x + 1")).toBeNull());
  test("returns value on success", () => expect(tryEvaluate("2 + 2")).toBe(4));
  test("returns null on unknown fn", () => expect(tryEvaluate("foo()")).toBeNull());
});

// ── 12. parse + evalAST ──────────────────────────────────────────────────────

describe("parse / evalAST", () => {
  test("round-trip", () => {
    const ast = parse("3 + 4 * 5");
    expect(evalAST(ast)).toBe(23);
  });

  test("evalAST with vars", () => {
    const ast = parse("x * y");
    expect(evalAST(ast, { vars: { x: 6, y: 7 } })).toBe(42);
  });
});

// ── 13. errors ───────────────────────────────────────────────────────────────

describe("FormulaError", () => {
  test("unexpected character", () => {
    expect(() => evaluate("2 @ 3")).toThrow(FormulaError);
  });

  test("division by zero", () => {
    expect(() => evaluate("1 / 0")).toThrow(FormulaError);
  });

  test("modulo by zero", () => {
    expect(() => evaluate("5 % 0")).toThrow(FormulaError);
  });

  test("unbalanced parens", () => {
    expect(() => evaluate("(1 + 2")).toThrow(FormulaError);
  });

  test("extra token", () => {
    expect(() => evaluate("1 + 2 3")).toThrow(FormulaError);
  });

  test("empty expression", () => {
    expect(() => evaluate("")).toThrow(FormulaError);
  });

  test("unknown function", () => {
    expect(() => evaluate("foo(1)")).toThrow(FormulaError);
  });

  test("is instance of Error", () => {
    expect(() => evaluate("x")).toThrow(Error);
  });
});

// ── 14. real-world examples ──────────────────────────────────────────────────

describe("real-world examples", () => {
  test("BMI formula", () => {
    const bmi = evaluate("weight / (height * height)", { weight: 70, height: 1.75 });
    expect(bmi).toBeCloseTo(22.86, 1);
  });

  test("compound interest", () => {
    // A = P * (1 + r/n)^(n*t)
    const A = evaluate("P * (1 + r/n) ^ (n * t)", { P: 1000, r: 0.05, n: 12, t: 10 });
    expect(A).toBeCloseTo(1647.0, 0);
  });

  test("Pythagorean theorem", () => {
    expect(evaluate("sqrt(a^2 + b^2)", { a: 3, b: 4 })).toBe(5);
  });

  test("discriminant", () => {
    // Δ = b²-4ac
    const delta = evaluate("b^2 - 4*a*c", { a: 1, b: -5, c: 6 });
    expect(delta).toBe(1);
  });

  test("temperature conversion", () => {
    const f = compile("(C * 9/5) + 32");
    expect(f.evaluate({ C: 100 })).toBe(212);
    expect(f.evaluate({ C: 0 })).toBe(32);
    expect(f.evaluate({ C: -40 })).toBe(-40);
  });

  test("conditional pricing", () => {
    const price = compile("qty >= 100 ? base * 0.8 : qty >= 50 ? base * 0.9 : base");
    expect(price.evaluate({ qty: 150, base: 10 })).toBe(8);
    expect(price.evaluate({ qty: 75, base: 10 })).toBe(9);
    expect(price.evaluate({ qty: 10, base: 10 })).toBe(10);
  });
});

// ── 15. edge cases ────────────────────────────────────────────────────────────

describe("edge cases", () => {
  test("very nested parens", () => {
    expect(evaluate("((((((1))))))")).toBe(1);
  });

  test("chained unary minus", () => {
    expect(evaluate("--1")).toBe(1);
  });

  test("zero", () => {
    expect(evaluate("0")).toBe(0);
  });

  test("large number", () => {
    expect(evaluate("1e15 + 1")).toBe(1e15 + 1);
  });

  test("NaN propagation", () => {
    expect(evaluate("sqrt(-1)")).toBeNaN();
  });

  test("Infinity propagation", () => {
    expect(evaluate("1e308 * 10")).toBe(Infinity);
  });
});
