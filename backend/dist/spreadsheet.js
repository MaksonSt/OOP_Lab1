"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spreadsheet = void 0;
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const evaluator_1 = require("./evaluator");
class Spreadsheet {
    constructor(rows = 5, cols = 5) {
        this.MIN_ROWS = 3;
        this.MIN_COLS = 3;
        this.rows = rows;
        this.cols = cols;
        this.cells = new Map();
        this.evaluator = new evaluator_1.Evaluator();
        this.initializeCells();
    }
    initializeCells() {
        for (let r = 1; r <= this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const addr = this.indexToAddress(r, c);
                this.cells.set(addr, {
                    address: addr,
                    expression: '',
                    value: 0,
                    error: null,
                });
            }
        }
    }
    indexToAddress(row, col) {
        const colChar = String.fromCharCode(65 + col);
        return `${colChar}${row}`;
    }
    findCellDependencies(expression) {
        const dependencies = new Set();
        // Простий regex для знаходження посилань на комірки (A1, B2, etc.)
        const cellRefPattern = /\b([A-Z]+\d+)\b/gi;
        const matches = expression.matchAll(cellRefPattern);
        for (const match of matches) {
            const ref = match[1].toUpperCase();
            // Перевіряємо чи це не ключове слово (mod, div, not)
            if (!['MOD', 'DIV', 'NOT'].includes(ref)) {
                dependencies.add(ref);
            }
        }
        return dependencies;
    }
    detectCycles(startAddress) {
        const visited = new Set();
        const recStack = new Set();
        const dfs = (addr) => {
            if (recStack.has(addr)) {
                throw new Error(`Циклічна залежність виявлена: ${addr}`);
            }
            if (visited.has(addr)) {
                return;
            }
            visited.add(addr);
            recStack.add(addr);
            const cell = this.cells.get(addr);
            if (cell && cell.expression) {
                const dependencies = this.findCellDependencies(cell.expression);
                for (const dep of dependencies) {
                    dfs(dep);
                }
            }
            recStack.delete(addr);
        };
        dfs(startAddress);
    }
    // Заміни старий метод setCell на цей:
    setCell(address, expression) {
        const addr = address.toUpperCase();
        if (!this.cells.has(addr)) {
            throw new Error(`Комірка ${addr} не існує`);
        }
        if (expression) {
            const dependencies = this.findCellDependencies(expression);
            for (const dep of dependencies) {
                if (!this.cells.has(dep)) {
                    throw new Error(`Комірка ${dep} не існує`);
                }
            }
        }
        const cell = this.cells.get(addr);
        cell.expression = expression;
        try {
            this.detectAllCycles();
            cell.error = null;
            this.recalculate();
        }
        catch (e) {
            // Зберігаємо помилку в комірці, не відкочуємо зміни
            cell.error = e.message;
            cell.value = 0;
        }
    }
    // Додай цей новий метод:
    detectAllCycles() {
        const visited = new Set();
        const recStack = new Set();
        const dfs = (addr) => {
            if (recStack.has(addr)) {
                throw new Error(`Циклічна залежність виявлена: ${addr}`);
            }
            if (visited.has(addr)) {
                return;
            }
            visited.add(addr);
            recStack.add(addr);
            const cell = this.cells.get(addr);
            if (cell && cell.expression) {
                const dependencies = this.findCellDependencies(cell.expression);
                for (const dep of dependencies) {
                    dfs(dep);
                }
            }
            recStack.delete(addr);
        };
        for (const [addr, cell] of this.cells) {
            if (cell.expression && !visited.has(addr)) {
                dfs(addr);
            }
        }
    }
    // Заміни метод recalculate:
    recalculate() {
        const cellValues = {};
        const cellsToCalculate = [];
        for (const [addr, cell] of this.cells) {
            if (!cell.expression) {
                cell.value = 0;
                cellValues[addr] = 0;
            }
            else {
                cellsToCalculate.push(addr);
            }
        }
        const sorted = this.topologicalSort(cellsToCalculate);
        for (const addr of sorted) {
            const cell = this.cells.get(addr);
            try {
                const lexer = new lexer_1.Lexer(cell.expression);
                const tokens = lexer.tokenize();
                const parser = new parser_1.Parser(tokens);
                const ast = parser.parse();
                this.evaluator.setCellValues(cellValues);
                const value = this.evaluator.evaluate(ast, addr);
                cell.value = value;
                cell.error = null;
                cellValues[addr] = value;
            }
            catch (e) {
                cell.error = e.message;
                cell.value = 0;
                cellValues[addr] = 0;
            }
        }
    }
    // Додай новий метод топологічного сортування:
    topologicalSort(addresses) {
        const graph = new Map();
        const inDegree = new Map();
        for (const addr of addresses) {
            graph.set(addr, new Set());
            inDegree.set(addr, 0);
        }
        for (const addr of addresses) {
            const cell = this.cells.get(addr);
            const dependencies = this.findCellDependencies(cell.expression);
            for (const dep of dependencies) {
                if (!graph.has(dep)) {
                    graph.set(dep, new Set());
                    inDegree.set(dep, 0);
                }
                graph.get(dep).add(addr);
                inDegree.set(addr, (inDegree.get(addr) || 0) + 1);
            }
        }
        const queue = [];
        const result = [];
        for (const [addr, degree] of inDegree) {
            if (degree === 0) {
                queue.push(addr);
            }
        }
        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current);
            const neighbors = graph.get(current);
            if (neighbors) {
                for (const neighbor of neighbors) {
                    const newDegree = inDegree.get(neighbor) - 1;
                    inDegree.set(neighbor, newDegree);
                    if (newDegree === 0) {
                        queue.push(neighbor);
                    }
                }
            }
        }
        if (result.length !== addresses.length) {
            throw new Error('Виявлено циклічні залежності під час обчислення');
        }
        return result;
    }
    getCell(address) {
        const addr = address.toUpperCase();
        const cell = this.cells.get(addr);
        if (!cell)
            throw new Error(`Комірка ${addr} не існує`);
        return cell;
    }
    getAllCells() {
        return Array.from(this.cells.values());
    }
    getCells2D() {
        const result = [];
        for (let r = 1; r <= this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                const addr = this.indexToAddress(r, c);
                row.push(this.cells.get(addr));
            }
            result.push(row);
        }
        return result;
    }
    addRow() {
        this.rows++;
        const r = this.rows;
        for (let c = 0; c < this.cols; c++) {
            const addr = this.indexToAddress(r, c);
            this.cells.set(addr, {
                address: addr,
                expression: '',
                value: 0,
                error: null,
            });
        }
    }
    addColumn() {
        const c = this.cols;
        this.cols++;
        for (let r = 1; r <= this.rows; r++) {
            const addr = this.indexToAddress(r, c);
            this.cells.set(addr, {
                address: addr,
                expression: '',
                value: 0,
                error: null,
            });
        }
    }
    removeRow() {
        if (this.rows <= this.MIN_ROWS) {
            throw new Error(`Неможливо видалити рядок. Мінімум ${this.MIN_ROWS} рядки повинні залишитись.`);
        }
        const r = this.rows;
        for (let c = 0; c < this.cols; c++) {
            const addr = this.indexToAddress(r, c);
            this.cells.delete(addr);
        }
        this.rows--;
    }
    removeColumn() {
        if (this.cols <= this.MIN_COLS) {
            throw new Error(`Неможливо видалити стовпець. Мінімум ${this.MIN_COLS} стовпці повинні залишитись.`);
        }
        const c = this.cols - 1;
        for (let r = 1; r <= this.rows; r++) {
            const addr = this.indexToAddress(r, c);
            this.cells.delete(addr);
        }
        this.cols--;
    }
    toJSON() {
        const cellsObj = {};
        for (const [addr, cell] of this.cells) {
            cellsObj[addr] = cell;
        }
        return { rows: this.rows, cols: this.cols, cells: cellsObj };
    }
    fromJSON(data) {
        this.rows = data.rows;
        this.cols = data.cols;
        this.cells.clear();
        Object.entries(data.cells).forEach(([addr, cell]) => {
            this.cells.set(addr, { ...cell });
        });
        this.recalculate();
    }
    getInfo() {
        return {
            rows: this.rows,
            cols: this.cols,
            operations: [
                'Арифметика: +, -, *, /',
                'Цілочисельні: mod, div',
                'Порівняння: =, <, >, <=, >=, <>',
                'Логічне: not'
            ],
        };
    }
}
exports.Spreadsheet = Spreadsheet;
//# sourceMappingURL=spreadsheet.js.map