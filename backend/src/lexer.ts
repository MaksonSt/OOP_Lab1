import { Token } from './types';

export class Lexer {
  private input: string;
  private pos: number = 0;

  constructor(input: string) {
    this.input = input.trim();
  }

  private peek(): string | null {
    return this.pos < this.input.length ? this.input[this.pos] : null;
  }

  private next(): string | null {
    return this.input[this.pos++] || null;
  }

  private skipWhitespace(): void {
    while (this.peek() && /\s/.test(this.peek()!)) {
      this.next();
    }
  }

  private readNumber(): string {
    let num = '';
    while (this.peek() && /\d/.test(this.peek()!)) {
      num += this.next();
    }
    return num;
  }

  private readIdent(): string {
    let ident = '';
    while (this.peek() && /[a-zA-Z0-9]/.test(this.peek()!)) {
      ident += this.next();
    }
    return ident;
  }

  private readOperator(): string {
    let op = this.next()!;
    const nextCh = this.peek();

    if ((op === '<' || op === '>' || op === '=') && nextCh === '=') {
      op += this.next();
    } else if (op === '<' && nextCh === '>') {
      op += this.next();
    }
    
    return op;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      const ch = this.peek();

      if (ch === null) break;

      if (/\d/.test(ch)) {
        tokens.push({ type: 'NUMBER', value: this.readNumber() });
      } else if (/[a-zA-Z]/.test(ch)) {
        const ident = this.readIdent();
        tokens.push({ type: 'IDENT', value: ident });
      } else if (ch === '(') {
        this.next();
        tokens.push({ type: 'LPAREN', value: '(' });
      } else if (ch === ')') {
        this.next();
        tokens.push({ type: 'RPAREN', value: ')' });
      } else if (ch === ',') {
        this.next();
        tokens.push({ type: 'COMMA', value: ',' });
      } else if (['+', '-', '*', '/', '=', '<', '>'].includes(ch)) {
        tokens.push({ type: 'OP', value: this.readOperator() });
      } else {
        throw new Error(`Невідомий символ: ${ch} на позиції ${this.pos}`);
      }
    }

    tokens.push({ type: 'EOF', value: '' });
    return tokens;
  }
}