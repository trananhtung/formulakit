import { tokenize, Token, TT } from "./lexer.js";
import {
  ASTNode, NumberNode, IdentifierNode, BinaryNode,
  UnaryNode, CallNode, ConditionalNode, FormulaError,
} from "./types.js";

// Pratt parser (top-down operator precedence)

const BP: Partial<Record<TT, number>> = {
  [TT.Or]:      10,
  [TT.And]:     20,
  [TT.Eq]:      30, [TT.NEq]: 30,
  [TT.Lt]:      40, [TT.Lte]: 40, [TT.Gt]: 40, [TT.Gte]: 40,
  [TT.Plus]:    50, [TT.Minus]: 50,
  [TT.Star]:    60, [TT.Slash]: 60, [TT.Percent]: 60,
  [TT.Caret]:   70,  // right-assoc → parse at BP-1
};

class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(src: string) {
    this.tokens = tokenize(src);
  }

  private peek(): Token { return this.tokens[this.pos]; }
  private consume(): Token { return this.tokens[this.pos++]; }
  private expect(type: TT): Token {
    const t = this.consume();
    if (t.type !== type) throw new FormulaError(`Expected '${type}' but got '${t.raw}'`, t.pos);
    return t;
  }

  parse(): ASTNode {
    const node = this.expr(0);
    if (this.peek().type !== TT.EOF) {
      const t = this.peek();
      throw new FormulaError(`Unexpected token '${t.raw}'`, t.pos);
    }
    return node;
  }

  private expr(minBP: number): ASTNode {
    let left = this.prefix();

    while (true) {
      const t = this.peek();

      // ternary ?  :
      if (t.type === TT.Question && minBP < 5) {
        this.consume();
        const consequent = this.expr(0);
        this.expect(TT.Colon);
        const alternate = this.expr(0);
        left = { kind: "conditional", condition: left, consequent, alternate } as ConditionalNode;
        continue;
      }

      const bp = BP[t.type as TT];
      if (bp === undefined || bp <= minBP) break;

      this.consume();
      const rightBP = t.type === TT.Caret ? bp - 1 : bp; // ^ is right-assoc
      const right = this.expr(rightBP);
      left = { kind: "binary", op: t.type, left, right } as BinaryNode;
    }

    return left;
  }

  private prefix(): ASTNode {
    const t = this.peek();

    if (t.type === TT.Number) {
      this.consume();
      return { kind: "number", value: parseFloat(t.raw) } as NumberNode;
    }

    if (t.type === TT.Ident) {
      this.consume();
      // function call?
      if (this.peek().type === TT.LParen) {
        this.consume(); // (
        const args: ASTNode[] = [];
        if (this.peek().type !== TT.RParen) {
          args.push(this.expr(0));
          while (this.peek().type === TT.Comma) {
            this.consume();
            args.push(this.expr(0));
          }
        }
        this.expect(TT.RParen);
        return { kind: "call", name: t.raw, args } as CallNode;
      }
      return { kind: "identifier", name: t.raw } as IdentifierNode;
    }

    if (t.type === TT.Minus) {
      this.consume();
      return { kind: "unary", op: "-", operand: this.expr(65) } as UnaryNode;
    }

    if (t.type === TT.Not) {
      this.consume();
      return { kind: "unary", op: "!", operand: this.expr(65) } as UnaryNode;
    }

    if (t.type === TT.Plus) {
      this.consume();
      return this.expr(65); // unary +
    }

    if (t.type === TT.LParen) {
      this.consume();
      const inner = this.expr(0);
      this.expect(TT.RParen);
      return inner;
    }

    throw new FormulaError(`Unexpected token '${t.raw}'`, t.pos);
  }
}

export function parse(src: string): ASTNode {
  return new Parser(src).parse();
}
