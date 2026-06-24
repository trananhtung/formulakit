import { ASTNode, EvalOptions, FormulaError, Value } from "./types.js";
import { BUILTIN_VARS, BUILTIN_FUNCTIONS } from "./builtins.js";

function evalNode(node: ASTNode, opts: Required<EvalOptions>, depth: number): Value {
  if (depth > opts.maxDepth) throw new FormulaError("Maximum recursion depth exceeded");

  const d = depth + 1;

  switch (node.kind) {
    case "number":
      return node.value;

    case "identifier": {
      const name = node.name;
      if (name in opts.vars) return opts.vars[name];
      if (name in BUILTIN_VARS) return BUILTIN_VARS[name];
      throw new FormulaError(`Unknown variable '${name}'`);
    }

    case "unary": {
      const v = evalNode(node.operand, opts, d);
      if (node.op === "-") return -v;
      if (node.op === "!") return v === 0 ? 1 : 0;
      throw new FormulaError(`Unknown unary operator '${node.op}'`);
    }

    case "binary": {
      const l = evalNode(node.left, opts, d);
      // short-circuit for && / ||
      if (node.op === "&&") return (l !== 0 ? evalNode(node.right, opts, d) : 0);
      if (node.op === "||") return (l !== 0 ? l : evalNode(node.right, opts, d));

      const r = evalNode(node.right, opts, d);
      switch (node.op) {
        case "+": return l + r;
        case "-": return l - r;
        case "*": return l * r;
        case "/":
          if (r === 0) throw new FormulaError("Division by zero");
          return l / r;
        case "%":
          if (r === 0) throw new FormulaError("Modulo by zero");
          return l % r;
        case "^": return Math.pow(l, r);
        case "==": return l === r ? 1 : 0;
        case "!=": return l !== r ? 1 : 0;
        case "<":  return l < r ? 1 : 0;
        case "<=": return l <= r ? 1 : 0;
        case ">":  return l > r ? 1 : 0;
        case ">=": return l >= r ? 1 : 0;
        default:
          throw new FormulaError(`Unknown operator '${node.op}'`);
      }
    }

    case "call": {
      const fn = opts.functions[node.name] ?? BUILTIN_FUNCTIONS[node.name];
      if (!fn) throw new FormulaError(`Unknown function '${node.name}'`);
      const args = node.args.map((a) => evalNode(a, opts, d));
      return fn(...args);
    }

    case "conditional": {
      const cond = evalNode(node.condition, opts, d);
      return cond !== 0
        ? evalNode(node.consequent, opts, d)
        : evalNode(node.alternate, opts, d);
    }
  }
}

export function evalAST(node: ASTNode, opts: EvalOptions = {}): Value {
  const resolved: Required<EvalOptions> = {
    vars: opts.vars ?? {},
    functions: opts.functions ?? {},
    maxDepth: opts.maxDepth ?? 200,
  };
  return evalNode(node, resolved, 0);
}
