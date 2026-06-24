export type Value = number;

export type Variables = Record<string, Value>;

export type FunctionMap = Record<string, (...args: Value[]) => Value>;

export interface EvalOptions {
  vars?: Variables;
  functions?: FunctionMap;
  maxDepth?: number;
}

export class FormulaError extends Error {
  constructor(
    message: string,
    public readonly position?: number
  ) {
    super(message);
    this.name = "FormulaError";
  }
}

// ── AST node types ────────────────────────────────────────────────────────────

export type NodeKind =
  | "number"
  | "identifier"
  | "binary"
  | "unary"
  | "call"
  | "conditional";

export interface NumberNode {
  kind: "number";
  value: number;
}

export interface IdentifierNode {
  kind: "identifier";
  name: string;
}

export interface BinaryNode {
  kind: "binary";
  op: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryNode {
  kind: "unary";
  op: string;
  operand: ASTNode;
}

export interface CallNode {
  kind: "call";
  name: string;
  args: ASTNode[];
}

export interface ConditionalNode {
  kind: "conditional";
  condition: ASTNode;
  consequent: ASTNode;
  alternate: ASTNode;
}

export type ASTNode =
  | NumberNode
  | IdentifierNode
  | BinaryNode
  | UnaryNode
  | CallNode
  | ConditionalNode;
