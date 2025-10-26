import { Cell, SpreadsheetData } from './types';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';

export class Spreadsheet {
  private rows: number;
  private cols: number;
  private cells: Map<string, Cell>;
  private evaluator: Evaluator;

  constructor(rows: number = 10, cols: number = 10) {
    this.rows = rows;
    this.cols = cols;
    this.cells = new Map();
    this.evaluator = new Evaluator();
    this.initializeCells();
  }

  private initializeCells(): void {
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

  private indexToAddress(row: number, col: number): string {
    const colChar = String.fromCharCode(65 + col);
    return `${colChar}${row}`;
  }

  setCell(address: string, expression: string): void {
    const addr = address.toUpperCase();
    if (!this.cells.has(addr)) {
      throw new Error(`Комірка ${addr} не існує`);
    }

    const cell = this.cells.get(addr)!;
    cell.expression = expression;
    cell.error = null;

    this.recalculate();
  }

  private recalculate(): void {
    const cellValues: { [key: string]: number } = {};

    for (const [addr, cell] of this.cells) {
      if (!cell.expression) {
        cell.value = 0;
        cellValues[addr] = 0;
        continue;
      }

      try {
        const lexer = new Lexer(cell.expression);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();

        this.evaluator.setCellValues(cellValues);
        const value = this.evaluator.evaluate(ast, addr);
        cell.value = value;
        cell.error = null;
        cellValues[addr] = value;
      } catch (e: any) {
        cell.error = e.message;
        cell.value = 0;
        cellValues[addr] = 0;
      }
    }
  }

  getCell(address: string): Cell {
    const addr = address.toUpperCase();
    const cell = this.cells.get(addr);
    if (!cell) throw new Error(`Комірка ${addr} не існує`);
    return cell;
  }

  getAllCells(): Cell[] {
    return Array.from(this.cells.values());
  }

  getCells2D(): Cell[][] {
    const result: Cell[][] = [];
    for (let r = 1; r <= this.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.cols; c++) {
        const addr = this.indexToAddress(r, c);
        row.push(this.cells.get(addr)!);
      }
      result.push(row);
    }
    return result;
  }

  addRow(): void {
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

  addColumn(): void {
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

  removeRow(): void {
    if (this.rows <= 1) return;
    const r = this.rows;
    for (let c = 0; c < this.cols; c++) {
      const addr = this.indexToAddress(r, c);
      this.cells.delete(addr);
    }
    this.rows--;
  }

  removeColumn(): void {
    if (this.cols <= 1) return;
    const c = this.cols - 1;
    for (let r = 1; r <= this.rows; r++) {
      const addr = this.indexToAddress(r, c);
      this.cells.delete(addr);
    }
    this.cols--;
  }

  toJSON(): SpreadsheetData {
    const cellsObj: { [key: string]: Cell } = {};
    for (const [addr, cell] of this.cells) {
      cellsObj[addr] = cell;
    }
    return { rows: this.rows, cols: this.cols, cells: cellsObj };
  }

  fromJSON(data: SpreadsheetData): void {
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