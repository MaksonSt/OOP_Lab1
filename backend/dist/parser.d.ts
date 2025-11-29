import { Token, ASTNode } from './types';
export declare class Parser {
    private tokens;
    private pos;
    constructor(tokens: Token[]);
    private peek;
    private next;
    private expect;
    parse(): ASTNode;
    private parseExpression;
    private parseComparison;
    private parseAddSub;
    private parseMulDiv;
    private parseUnary;
    private parsePrimary;
}
//# sourceMappingURL=parser.d.ts.map