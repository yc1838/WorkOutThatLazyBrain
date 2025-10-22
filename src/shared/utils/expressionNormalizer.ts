/**
 * 数学表达式标准化工具
 *
 * 使用 Math.js 库来正确处理数学表达式的等价性
 * 替代手动的 whack-a-mole 方法
 */

import { parse, simplify, format } from 'mathjs';
import type { Card } from '../types/game';

/**
 * 将三张卡片转换为数学表达式字符串
 */
export function cardsToExpression(cards: [Card, Card, Card]): string {
  const [card1, card2, card3] = cards;

  // 第1张卡片：只取数字
  const num1 = card1.number;

  // 第2张卡片：取运算符和数字
  const op1 = card2.operator;
  const num2 = card2.number;

  // 第3张卡片：取运算符和数字
  const op2 = card3.operator;
  const num3 = card3.number;

  // 转换运算符为 Math.js 格式
  const mathOp1 = op1 === '×' ? '*' : op1 === '÷' ? '/' : op1;
  const mathOp2 = op2 === '×' ? '*' : op2 === '÷' ? '/' : op2;

  return `${num1} ${mathOp1} ${num2} ${mathOp2} ${num3}`;
}

/**
 * 标准化数学表达式
 *
 * 使用 AST 方法来标准化表达式，正确处理数学等价性
 */
export function normalizeExpression(expression: string): string {
  try {
    // 解析表达式为 AST
    const parsed = parse(expression);

    // 使用 AST 标准化
    const normalized = normalizeAST(parsed);

    return normalized;
  } catch (error) {
    console.warn('Failed to normalize expression:', expression, error);
    return expression;
  }
}

/**
 * AST 标准化函数
 * 递归处理 AST 节点，应用数学等价性规则
 */
function normalizeAST(node: any): string {
  if (!node) return '';

  switch (node.type) {
    case 'ConstantNode':
      return node.value.toString();

    case 'SymbolNode':
      return node.name;

    case 'OperatorNode':
      return normalizeOperatorNode(node);

    case 'FunctionNode':
      // 处理函数节点（如果需要）
      const args = node.args.map((arg: any) => normalizeAST(arg));
      return `${node.fn}(${args.join(', ')})`;

    default:
      // 对于其他类型，尝试转换为字符串
      try {
        return format(node);
      } catch {
        return node.toString();
      }
  }
}

/**
 * 展平交换律运算符的所有操作数
 * 例如：((1 * 2) * 11) -> [1, 2, 11]
 */
function flattenCommutativeOperands(node: any, targetOp: string): any[] {
  if (!node || node.type !== 'OperatorNode' || node.op !== targetOp) {
    return [node];
  }

  const operands: any[] = [];

  for (const arg of node.args) {
    if (arg.type === 'OperatorNode' && arg.op === targetOp) {
      // 递归展平相同运算符的嵌套结构
      operands.push(...flattenCommutativeOperands(arg, targetOp));
    } else {
      operands.push(arg);
    }
  }

  return operands;
}

/**
 * 标准化操作符节点
 * 处理交换律、结合律等数学等价性
 */
function normalizeOperatorNode(node: any): string {
  const op = node.op;
  const args = node.args;

  // 对于交换律运算符（+ 和 *），展平并排序所有操作数
  if (op === '+' || op === '*') {
    const allOperands = flattenCommutativeOperands(node, op);
    const normalizedOperands = allOperands.map((operand) => normalizeAST(operand));
    normalizedOperands.sort(); // 排序以确保一致性

    if (normalizedOperands.length === 1) {
      return normalizedOperands[0];
    } else if (normalizedOperands.length === 2) {
      return `(${normalizedOperands[0]} ${op} ${normalizedOperands[1]})`;
    } else {
      return `(${normalizedOperands.join(` ${op} `)})`;
    }
  }

  // 处理非交换律运算符（- 和 /）
  if (args.length === 2) {
    const left = normalizeAST(args[0]);
    const right = normalizeAST(args[1]);
    return `(${left} ${op} ${right})`;
  }

  // 处理多元运算符（非交换律）
  if (args.length > 2) {
    const normalizedArgs = args.map((arg: any) => normalizeAST(arg));
    return `(${normalizedArgs.join(` ${op} `)})`;
  }

  // 单元运算符
  if (args.length === 1) {
    const operand = normalizeAST(args[0]);
    return `(${op}${operand})`;
  }

  return node.toString();
}

/**
 * 展平并标准化加法/减法表达式
 * 处理 a + b - c 和 a - c + b 这样的等价表达式
 */
export function normalizeAdditionSubtraction(node: any): string {
  // 收集所有的正项和负项
  const positiveTerms: string[] = [];
  const negativeTerms: string[] = [];

  function collectTerms(n: any, isNegative = false) {
    if (n.type === 'OperatorNode') {
      if (n.op === '+') {
        collectTerms(n.args[0], isNegative);
        collectTerms(n.args[1], isNegative);
      } else if (n.op === '-') {
        collectTerms(n.args[0], isNegative);
        collectTerms(n.args[1], !isNegative);
      } else {
        // 其他运算符，作为一个整体处理
        const term = normalizeAST(n);
        if (isNegative) {
          negativeTerms.push(term);
        } else {
          positiveTerms.push(term);
        }
      }
    } else {
      const term = normalizeAST(n);
      if (isNegative) {
        negativeTerms.push(term);
      } else {
        positiveTerms.push(term);
      }
    }
  }

  collectTerms(node);

  // 排序项以确保一致性
  positiveTerms.sort();
  negativeTerms.sort();

  // 构建标准化表达式
  let result = '';

  if (positiveTerms.length > 0) {
    result = positiveTerms.join(' + ');
  }

  if (negativeTerms.length > 0) {
    if (result) {
      result += ' - ' + negativeTerms.join(' - ');
    } else {
      result = '-' + negativeTerms.join(' - ');
    }
  }

  return result || '0';
}

/**
 * 计算表达式的值
 */
export function evaluateExpression(expression: string): number {
  try {
    const parsed = parse(expression);
    const result = parsed.evaluate();
    return typeof result === 'number' ? result : parseFloat(result.toString());
  } catch (error) {
    console.warn('Failed to evaluate expression:', expression, error);
    throw new Error(`Invalid expression: ${expression}`);
  }
}

/**
 * 生成标准化的解法键
 *
 * 使用 AST 来处理数学等价性，替代手动的 case-by-case 处理
 */
export function generateNormalizedSolutionKey(cards: [Card, Card, Card]): string {
  // 转换为数学表达式
  const expression = cardsToExpression(cards);

  // 计算结果
  const result = evaluateExpression(expression);

  // 解析为 AST 并进行特殊处理
  const parsed = parse(expression);

  // 对于加法/减法混合表达式，使用特殊的标准化
  let normalizedExpr: string;
  if (isAdditionSubtractionExpression(parsed)) {
    normalizedExpr = normalizeAdditionSubtraction(parsed);
  } else {
    normalizedExpr = normalizeExpression(expression);
  }

  // 组合结果和标准化表达式作为唯一键
  return `${result}:${normalizedExpr}`;
}

/**
 * 检查表达式是否主要包含加法和减法
 */
export function isAdditionSubtractionExpression(node: any): boolean {
  if (!node || node.type !== 'OperatorNode') return false;

  const op = node.op;
  if (op === '+' || op === '-') return true;

  // 检查子节点
  if (node.args) {
    return node.args.some((arg: any) => isAdditionSubtractionExpression(arg));
  }

  return false;
}

/**
 * 检查两个表达式是否数学等价
 *
 * 使用相同的标准化逻辑来比较表达式
 */
export function areExpressionsEquivalent(expr1: string, expr2: string): boolean {
  try {
    const parsed1 = parse(expr1);
    const parsed2 = parse(expr2);

    // 使用相同的标准化逻辑
    let normalized1: string, normalized2: string;

    if (isAdditionSubtractionExpression(parsed1)) {
      normalized1 = normalizeAdditionSubtraction(parsed1);
    } else {
      normalized1 = normalizeExpression(expr1);
    }

    if (isAdditionSubtractionExpression(parsed2)) {
      normalized2 = normalizeAdditionSubtraction(parsed2);
    } else {
      normalized2 = normalizeExpression(expr2);
    }

    return normalized1 === normalized2;
  } catch (error) {
    console.warn('Failed to compare expressions:', expr1, expr2, error);
    return false;
  }
}

/**
 * 对解法数组进行去重
 *
 * 使用 Math.js 的标准化功能来识别数学等价的解法
 */
export function deduplicateSolutions<T extends { cards: [Card, Card, Card] }>(solutions: T[]): T[] {
  const seenKeys = new Set<string>();
  const uniqueSolutions: T[] = [];

  for (const solution of solutions) {
    const key = generateNormalizedSolutionKey(solution.cards);

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueSolutions.push(solution);
    }
  }

  return uniqueSolutions;
}
