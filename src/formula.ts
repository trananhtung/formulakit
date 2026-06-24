import { parse } from "./parser.js";
import { evalAST } from "./evaluator.js";
import { ASTNode, EvalOptions, Value } from "./types.js";

/**
 * Parse an expression string into an AST (reuse for repeated evaluations).
 */
export function compile(expr: string): CompiledFormula {
  const ast = parse(expr);
  return new CompiledFormula(ast, expr);
}

/**
 * Parse and evaluate an expression in one step.
 */
export function evaluate(expr: string, vars?: Record<string, Value>, opts?: Omit<EvalOptions, "vars">): Value {
  const ast = parse(expr);
  return evalAST(ast, { ...opts, vars });
}

/**
 * Parse and evaluate, returning null instead of throwing on parse/eval errors.
 */
export function tryEvaluate(expr: string, vars?: Record<string, Value>, opts?: Omit<EvalOptions, "vars">): Value | null {
  try { return evaluate(expr, vars, opts); }
  catch { return null; }
}

export class CompiledFormula {
  readonly source: string;
  private readonly _ast: ASTNode;

  constructor(ast: ASTNode, source: string) {
    this._ast = ast;
    this.source = source;
  }

  evaluate(vars?: Record<string, Value>, opts?: Omit<EvalOptions, "vars">): Value {
    return evalAST(this._ast, { ...opts, vars });
  }

  /** Return all variable names referenced in this formula. */
  variables(): string[] {
    const names = new Set<string>();
    collectVars(this._ast, names);
    return [...names].sort();
  }
}

function collectVars(node: ASTNode, out: Set<string>): void {
  switch (node.kind) {
    case "number": break;
    case "identifier": out.add(node.name); break;
    case "unary": collectVars(node.operand, out); break;
    case "binary": collectVars(node.left, out); collectVars(node.right, out); break;
    case "call": node.args.forEach((a) => collectVars(a, out)); break;
    case "conditional":
      collectVars(node.condition, out);
      collectVars(node.consequent, out);
      collectVars(node.alternate, out);
      break;
  }
}
