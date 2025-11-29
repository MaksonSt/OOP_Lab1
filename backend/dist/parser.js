"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    constructor(tokens) {
        this.pos = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.pos] || { type: 'EOF', value: '' };
    }
    next() {
        return this.tokens[this.pos++];
    }
    expect(type) {
        const token = this.peek();
        if (token.type !== type) {
            throw new Error(`Очікувався ${type}, отримано ${token.type}`);
        }
        return this.next();
    }
    parse() {
        const expr = this.parseExpression();
        this.expect('EOF');
        return expr;
    }
    parseExpression() {
        return this.parseComparison();
    }
    parseComparison() {
        let left = this.parseAddSub();
        while (this.peek().type === 'OP' && ['=', '<', '>', '<=', '>=', '<>'].includes(this.peek().value)) {
            const op = this.next();
            const right = this.parseAddSub();
            left = { type: 'BinOp', op: op.value, left, right };
        }
        return left;
    }
    parseAddSub() {
        let left = this.parseMulDiv();
        while (this.peek().type === 'OP' && ['+', '-'].includes(this.peek().value)) {
            const op = this.next();
            const right = this.parseMulDiv();
            left = { type: 'BinOp', op: op.value, left, right };
        }
        return left;
    }
    parseMulDiv() {
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
    parseUnary() {
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
    parsePrimary() {
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
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map