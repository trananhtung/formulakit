import { FormulaError } from "./types.js";

export const enum TT {
  Number     = "Number",
  Ident      = "Ident",
  Plus       = "+",
  Minus      = "-",
  Star       = "*",
  Slash      = "/",
  Percent    = "%",
  Caret      = "^",
  LParen     = "(",
  RParen     = ")",
  Comma      = ",",
  Question   = "?",
  Colon      = ":",
  Eq         = "==",
  NEq        = "!=",
  Lt         = "<",
  Lte        = "<=",
  Gt         = ">",
  Gte        = ">=",
  And        = "&&",
  Or         = "||",
  Not        = "!",
  EOF        = "EOF",
}

export interface Token {
  type: TT;
  raw: string;
  pos: number;
}

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    // skip whitespace
    if (/\s/.test(src[i])) { i++; continue; }

    const pos = i;
    const ch = src[i];

    // numbers (int or float, optional exponent)
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let raw = "";
      while (i < src.length && /[0-9.]/.test(src[i])) raw += src[i++];
      if (src[i] === "e" || src[i] === "E") {
        raw += src[i++];
        if (src[i] === "+" || src[i] === "-") raw += src[i++];
        while (i < src.length && /[0-9]/.test(src[i])) raw += src[i++];
      }
      tokens.push({ type: TT.Number, raw, pos });
      continue;
    }

    // identifiers and keywords (only PI/E)
    if (/[a-zA-Z_]/.test(ch)) {
      let raw = "";
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) raw += src[i++];
      tokens.push({ type: TT.Ident, raw, pos });
      continue;
    }

    // two-char operators
    const two = src.slice(i, i + 2);
    if (two === "==" || two === "!=" || two === "<=" || two === ">=" || two === "&&" || two === "||") {
      tokens.push({ type: two as TT, raw: two, pos });
      i += 2;
      continue;
    }

    // one-char operators
    const singles: Record<string, TT> = {
      "+": TT.Plus, "-": TT.Minus, "*": TT.Star, "/": TT.Slash,
      "%": TT.Percent, "^": TT.Caret,
      "(": TT.LParen, ")": TT.RParen, ",": TT.Comma,
      "?": TT.Question, ":": TT.Colon,
      "<": TT.Lt, ">": TT.Gt, "!": TT.Not,
    };
    if (ch in singles) {
      tokens.push({ type: singles[ch], raw: ch, pos });
      i++;
      continue;
    }

    throw new FormulaError(`Unexpected character '${ch}'`, pos);
  }

  tokens.push({ type: TT.EOF, raw: "", pos: i });
  return tokens;
}
