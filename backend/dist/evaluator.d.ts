import { ASTNode } from './types';
export declare class Evaluator {
    private cellValues;
    private computing;
    setCellValues(values: {
        [key: string]: number;
    }): void;
    evaluate(node: ASTNode, cellRef?: string): number;
    private evaluateNode;
}
//# sourceMappingURL=evaluator.d.ts.map