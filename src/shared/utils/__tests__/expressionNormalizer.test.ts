/**
 * 表达式标准化工具测试
 * 
 * 测试使用 Math.js 的数学表达式等价性检测
 */

import { describe, it, expect } from 'vitest';
import {
  cardsToExpression,
  normalizeExpression,
  evaluateExpression,
  generateNormalizedSolutionKey,
  areExpressionsEquivalent,
  deduplicateSolutions
} from '../expressionNormalizer';
import type { Card } from '../../types/game';

// 辅助函数：创建卡片对象
const createCard = (number: number, operator: string, label: string): Card => ({
  id: `card-${label}`,
  label,
  operator: operator as any,
  number,
  position: 0
});

describe('表达式标准化工具测试', () => {
  describe('cardsToExpression', () => {
    it('应该正确转换卡片为数学表达式', () => {
      const cards: [Card, Card, Card] = [
        createCard(6, '+', 'A'),
        createCard(9, '×', 'B'),
        createCard(7, '-', 'C')
      ];
      
      const expression = cardsToExpression(cards);
      expect(expression).toBe('6 * 9 - 7');
    });
    
    it('应该正确处理除法符号', () => {
      const cards: [Card, Card, Card] = [
        createCard(12, '+', 'A'),
        createCard(3, '÷', 'B'),
        createCard(2, '+', 'C')
      ];
      
      const expression = cardsToExpression(cards);
      expect(expression).toBe('12 / 3 + 2');
    });
  });

  describe('evaluateExpression', () => {
    it('应该正确计算表达式的值', () => {
      expect(evaluateExpression('6 * 9 - 7')).toBe(47);
      expect(evaluateExpression('5 + 4 - 8')).toBe(1);
      expect(evaluateExpression('12 / 3 + 2')).toBe(6);
    });
  });

  describe('areExpressionsEquivalent', () => {
    it('应该识别乘法交换律等价表达式', () => {
      expect(areExpressionsEquivalent('6 * 9 - 7', '9 * 6 - 7')).toBe(true);
      expect(areExpressionsEquivalent('2 * 3', '3 * 2')).toBe(true);
      // Multi-operand expressions should also work now
      expect(areExpressionsEquivalent('1 * 2 * 11', '1 * 11 * 2')).toBe(true);
      expect(areExpressionsEquivalent('2 * 3 * 5', '5 * 2 * 3')).toBe(true);
    });
    
    it('应该识别加法交换律等价表达式', () => {
      expect(areExpressionsEquivalent('3 + 7 + 2', '7 + 3 + 2')).toBe(true);
      expect(areExpressionsEquivalent('1 + 2 + 3', '3 + 1 + 2')).toBe(true);
      expect(areExpressionsEquivalent('2 + 3 + 5', '5 + 2 + 3')).toBe(true);
    });
    
    it('应该识别加法减法混合等价表达式', () => {
      expect(areExpressionsEquivalent('5 + 4 - 8', '5 - 8 + 4')).toBe(true);
      expect(areExpressionsEquivalent('10 + 3 - 7', '10 - 7 + 3')).toBe(true);
    });
    
    it('应该识别复杂的数学等价表达式', () => {
      expect(areExpressionsEquivalent('2 + 3 * 4', '3 * 4 + 2')).toBe(true);
      expect(areExpressionsEquivalent('10 - 2 * 3', '10 - 3 * 2')).toBe(true);
    });
    
    it('不应该将不等价的表达式识别为相同', () => {
      expect(areExpressionsEquivalent('6 * 9 - 7', '6 - 9 * 7')).toBe(false);
      expect(areExpressionsEquivalent('8 - 3', '3 - 8')).toBe(false);
      expect(areExpressionsEquivalent('12 / 3', '3 / 12')).toBe(false);
    });
  });

  describe('generateNormalizedSolutionKey', () => {
    it('应该为等价表达式生成相同的键', () => {
      const cards1: [Card, Card, Card] = [
        createCard(6, '+', 'A'),
        createCard(9, '×', 'B'),
        createCard(7, '-', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(9, '+', 'D'),
        createCard(6, '×', 'E'),
        createCard(7, '-', 'F')
      ];
      
      const key1 = generateNormalizedSolutionKey(cards1);
      const key2 = generateNormalizedSolutionKey(cards2);
      
      expect(key1).toBe(key2);
    });
    
    it('应该为加法减法混合等价表达式生成相同的键', () => {
      const cards1: [Card, Card, Card] = [
        createCard(5, '+', 'A'),
        createCard(4, '+', 'B'),
        createCard(8, '-', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(5, '+', 'D'),
        createCard(8, '-', 'E'),
        createCard(4, '+', 'F')
      ];
      
      const key1 = generateNormalizedSolutionKey(cards1);
      const key2 = generateNormalizedSolutionKey(cards2);
      
      expect(key1).toBe(key2);
    });
  });

  describe('deduplicateSolutions', () => {
    it('应该正确去重包含等价解法的数组', () => {
      const solutions = [
        // 组1: 6*9-7 的等价解法
        { 
          cards: [createCard(6, '+', 'A'), createCard(9, '×', 'B'), createCard(7, '-', 'C')] as [Card, Card, Card],
          equation: '6 × 9 - 7'
        },
        { 
          cards: [createCard(9, '+', 'D'), createCard(6, '×', 'E'), createCard(7, '-', 'F')] as [Card, Card, Card],
          equation: '9 × 6 - 7'
        },
        
        // 组2: 5+4-8 的等价解法
        { 
          cards: [createCard(5, '+', 'G'), createCard(4, '+', 'H'), createCard(8, '-', 'I')] as [Card, Card, Card],
          equation: '5 + 4 - 8'
        },
        { 
          cards: [createCard(5, '+', 'J'), createCard(8, '-', 'K'), createCard(4, '+', 'L')] as [Card, Card, Card],
          equation: '5 - 8 + 4'
        },
        
        // 组3: 2*3*5 的等价解法
        { 
          cards: [createCard(2, '+', 'M'), createCard(3, '×', 'N'), createCard(5, '×', 'O')] as [Card, Card, Card],
          equation: '2 × 3 × 5'
        },
        { 
          cards: [createCard(5, '+', 'P'), createCard(2, '×', 'Q'), createCard(3, '×', 'R')] as [Card, Card, Card],
          equation: '5 × 2 × 3'
        },
        
        // 组4: 不同的解法（不应该被去重）
        { 
          cards: [createCard(10, '+', 'S'), createCard(5, '-', 'T'), createCard(2, '+', 'U')] as [Card, Card, Card],
          equation: '10 - 5 + 2'
        },
      ];
      
      const uniqueSolutions = deduplicateSolutions(solutions);
      
      // With our improved AST approach that handles multi-operand expressions,
      // we should get better deduplication
      expect(uniqueSolutions.length).toBe(4);
      expect(solutions.length).toBe(7);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理包含小数的表达式', () => {
      // Note: We don't consider 5/2 and 2.5 as equivalent expressions
      // They have the same value but different mathematical forms
      expect(areExpressionsEquivalent('5 / 2', '2.5')).toBe(false);
      expect(evaluateExpression('7 / 2')).toBe(3.5);
    });
    
    it('应该处理复杂的运算优先级', () => {
      expect(areExpressionsEquivalent('2 + 3 * 4 - 1', '2 - 1 + 3 * 4')).toBe(true);
      expect(areExpressionsEquivalent('10 / 2 + 3', '3 + 10 / 2')).toBe(true);
    });
    
    it('应该处理错误的表达式', () => {
      expect(() => evaluateExpression('invalid')).toThrow();
      expect(areExpressionsEquivalent('invalid1', 'invalid2')).toBe(false);
    });
  });
});
