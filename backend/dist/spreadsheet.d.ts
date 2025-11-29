import { Cell, SpreadsheetData } from './types';
export declare class Spreadsheet {
    private rows;
    private cols;
    private cells;
    private evaluator;
    private readonly MIN_ROWS;
    private readonly MIN_COLS;
    constructor(rows?: number, cols?: number);
    private initializeCells;
    private indexToAddress;
    private findCellDependencies;
    private detectCycles;
    setCell(address: string, expression: string): void;
    private detectAllCycles;
    private recalculate;
    private topologicalSort;
    getCell(address: string): Cell;
    getAllCells(): Cell[];
    getCells2D(): Cell[][];
    addRow(): void;
    addColumn(): void;
    removeRow(): void;
    removeColumn(): void;
    toJSON(): SpreadsheetData;
    fromJSON(data: SpreadsheetData): void;
    getInfo(): {
        rows: number;
        cols: number;
        operations: string[];
    };
}
//# sourceMappingURL=spreadsheet.d.ts.map