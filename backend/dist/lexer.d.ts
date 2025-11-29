import { Token } from './types';
export declare class Lexer {
    private input;
    private pos;
    constructor(input: string);
    private peek;
    private next;
    private skipWhitespace;
    private readNumber;
    private readIdent;
    private readOperator;
    tokenize(): Token[];
}
//# sourceMappingURL=lexer.d.ts.map