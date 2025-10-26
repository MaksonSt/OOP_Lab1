import { Token, ASTNode } from './types';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: '' };
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: string): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(`Очікувався ${type}, отримано ${token.type}`);
    }
    return this.next();
  }

  parse(): ASTNode {
    const expr = this.parseExpression();
    this.expect('EOF');
    return expr;
  }

  private parseExpression(): ASTNode {
    return this.parseComparison();
  }

  private parseComparison(): ASTNode {
    let left = this.parseAddSub();

    while (this.peek().type === 'OP' && ['=', '<', '>', '<=', '>=', '<>'].includes(this.peek().value)) {
      const op = this.next();
      const right = this.parseAddSub();
      left = { type: 'BinOp', op: op.value, left, right };
    }

    return left;
  }

  private parseAddSub(): ASTNode {
    let left = this.parseMulDiv();

    while (this.peek().type === 'OP' && ['+', '-'].includes(this.peek().value)) {
      const op = this.next();
      const right = this.parseMulDiv();
      left = { type: 'BinOp', op: op.value, left, right };
    }

    return left;
  }

  private parseMulDiv(): ASTNode {
    let left = this.parseUnary();

    while (this.peek().type === 'OP' && ['*', '/'].includes(this.peek().value)) {
      const op = this.next();
      const right = this.parseUnary();
      left = { type: 'BinOp', op: op.value, left, right };
    }

    // Обробка mod та div
    while (this.peek().type === 'IDENT' && ['mod', 'div'].includes(this.peek().value.toLowerCase())) {
      const op = this.next();
      const right = this.parseUnary();
      left = { type: 'BinOp', op: op.value.toLowerCase(), left, right };
    }

    return left;
  }

  private parseUnary(): ASTNode {
    const token = this.peek();

    if (token.type === 'OP' && ['+', '-'].includes(token.value)) {
      const op = this.next();
      const expr = this.parseUnary();
      return { type: 'UnaryOp', op: op.value, expr };
    }

    // Обробка not
    if (token.type === 'IDENT' && token.value.toLowerCase() === 'not') {
      this.next();
      const expr = this.parseUnary();
      return { type: 'UnaryOp', op: 'not', expr };
    }

    if (token.type === 'IDENT') {
      const ident = this.next();
      return { type: 'CellRef', ref: ident.value };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      const num = this.next();
      return { type: 'Number', value: parseInt(num.value, 10) };
    }

    if (token.type === 'LPAREN') {
      this.next();
      const expr = this.parseExpression();
      this.expect('RPAREN');
      return expr;
    }

    throw new Error(`Невідомий токен: ${token.type} ${token.value}`);
  }
}