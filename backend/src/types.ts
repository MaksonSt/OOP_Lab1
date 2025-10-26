export interface Token {
  type: 'NUMBER' | 'IDENT' | 'OP' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'EOF';
  value: string;
}

export interface ASTNode {
  type: string;
  [key: string]: any;
}

export interface Cell {
  address: string;
  expression: string;
  value: any;
  error: string | null;
}

export interface SpreadsheetData {
  rows: number;
  cols: number;
  cells: { [key: string]: Cell };
}