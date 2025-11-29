"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evaluator = void 0;
class Evaluator {
    constructor() {
        this.cellValues = new Map();
        this.computing = new Set();
    }
    setCellValues(values) {
        this.cellValues.clear();
        Object.entries(values).forEach(([key, val]) => {
            this.cellValues.set(key.toUpperCase(), val);
        });
    }
    evaluate(node, cellRef) {
        if (cellRef && this.computing.has(cellRef)) {
            throw new Error(`Циклічна залежність: ${cellRef}`);
        }
        if (cellRef) {
            this.computing.add(cellRef);
        }
        try {
            const result = this.evaluateNode(node);
            return result;
        }
        finally {
            if (cellRef) {
                this.computing.delete(cellRef);
            }
        }
    }
    evaluateNode(node) {
        if (node.type === 'Number') {
            return node.value;
        }
        if (node.type === 'CellRef') {
            const ref = node.ref.toUpperCase();
            if (!this.cellValues.has(ref)) {
                throw new Error(`Невідома комірка: ${node.ref}`);
            }
            return this.cellValues.get(ref);
        }
        if (node.type === 'BinOp') {
            const left = this.evaluateNode(node.left);
            const right = this.evaluateNode(node.right);
            switch (node.op) {
                case '+':
                    return left + right;
                case '-':
                    return left - right;
                case '*':
                    return left * right;
                case '/':
                    if (right === 0)
                        throw new Error('Ділення на нуль');
                    return Math.floor(left / right);
                case 'mod':
                    if (right === 0)
                        throw new Error('Ділення на нуль (mod)');
                    return left % right;
                case 'div':
                    if (right === 0)
                        throw new Error('Ділення на нуль (div)');
                    return Math.floor(left / right);
                case '=':
                    return left === right ? 1 : 0;
                case '<':
                    return left < right ? 1 : 0;
                case '>':
                    return left > right ? 1 : 0;
                case '<=':
                    return left <= right ? 1 : 0;
                case '>=':
                    return left >= right ? 1 : 0;
                case '<>':
                    return left !== right ? 1 : 0;
                default:
                    throw new Error(`Невідома операція: ${node.op}`);
            }
        }
        if (node.type === 'UnaryOp') {
            const expr = this.evaluateNode(node.expr);
            if (node.op === '+')
                return expr;
            if (node.op === '-')
                return -expr;
            if (node.op === 'not')
                return expr === 0 ? 1 : 0;
            throw new Error(`Невідома унарна операція: ${node.op}`);
        }
        throw new Error(`Невідомий тип вузла: ${node.type}`);
    }
}
exports.Evaluator = Evaluator;
//# sourceMappingURL=evaluator.js.map