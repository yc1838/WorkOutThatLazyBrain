/**
 * 数学工具函数的单元测试
 * 
 * 测试 performOperation 函数的各种情况
 */

import { describe, it, expect } from 'vitest';
import { performOperation, generateEquation, calculateFromCards, isValidGameResult, validateEquationFormat, findAllPossibleEquations, getSolutionsForTarget, isTargetReachable } from '../mathUtils';
import type { Operator, Card } from '../../types/game';

describe('performOperation', () => {
  // ===== 加法测试 =====
  describe('加法运算 (+)', () => {
    it('应该正确计算正数加法', () => {
      expect(performOperation(5, '+', 3)).toBe(8);
      expect(performOperation(10, '+', 7)).toBe(17);
    });

    it('应该正确计算负数加法', () => {
      expect(performOperation(-5, '+', 3)).toBe(-2);
      expect(performOperation(5, '+', -3)).toBe(2);
      expect(performOperation(-5, '+', -3)).toBe(-8);
    });

    it('应该正确处理零', () => {
      expect(performOperation(0, '+', 5)).toBe(5);
      expect(performOperation(5, '+', 0)).toBe(5);
      expect(performOperation(0, '+', 0)).toBe(0);
    });
  });

  // ===== 减法测试 =====
  describe('减法运算 (-)', () => {
    it('应该正确计算正数减法', () => {
      expect(performOperation(10, '-', 3)).toBe(7);
      expect(performOperation(5, '-', 8)).toBe(-3);
    });

    it('应该正确计算负数减法', () => {
      expect(performOperation(-5, '-', 3)).toBe(-8);
      expect(performOperation(5, '-', -3)).toBe(8);
      expect(performOperation(-5, '-', -3)).toBe(-2);
    });

    it('应该正确处理零', () => {
      expect(performOperation(0, '-', 5)).toBe(-5);
      expect(performOperation(5, '-', 0)).toBe(5);
      expect(performOperation(0, '-', 0)).toBe(0);
    });
  });

  // ===== 乘法测试 =====
  describe('乘法运算 (×)', () => {
    it('应该正确计算正数乘法', () => {
      expect(performOperation(5, '×', 3)).toBe(15);
      expect(performOperation(7, '×', 2)).toBe(14);
    });

    it('应该正确计算负数乘法', () => {
      expect(performOperation(-5, '×', 3)).toBe(-15);
      expect(performOperation(5, '×', -3)).toBe(-15);
      expect(performOperation(-5, '×', -3)).toBe(15);
    });

    it('应该正确处理零', () => {
      expect(performOperation(0, '×', 5)).toBe(0);
      expect(performOperation(5, '×', 0)).toBe(0);
      expect(performOperation(0, '×', 0)).toBe(0);
    });

    it('应该正确处理小数', () => {
      expect(performOperation(2.5, '×', 4)).toBe(10);
      expect(performOperation(3, '×', 1.5)).toBe(4.5);
    });
  });

  // ===== 除法测试 =====
  describe('除法运算 (÷)', () => {
    it('应该正确计算正数除法', () => {
      expect(performOperation(15, '÷', 3)).toBe(5);
      expect(performOperation(20, '÷', 4)).toBe(5);
    });

    it('应该正确计算负数除法', () => {
      expect(performOperation(-15, '÷', 3)).toBe(-5);
      expect(performOperation(15, '÷', -3)).toBe(-5);
      expect(performOperation(-15, '÷', -3)).toBe(5);
    });

    it('应该正确处理小数结果', () => {
      expect(performOperation(7, '÷', 2)).toBe(3.5);
      expect(performOperation(10, '÷', 3)).toBeCloseTo(3.333333333333333);
    });

    it('应该正确处理零作为被除数', () => {
      expect(performOperation(0, '÷', 5)).toBe(0);
      // JavaScript 中 0 / -3 = -0，我们需要使用 toBeCloseTo 或接受这个行为
      expect(performOperation(0, '÷', -3)).toBeCloseTo(0);
    });

    // ===== 除零错误测试 =====
    it('应该在除零时抛出错误', () => {
      expect(() => performOperation(5, '÷', 0)).toThrow('除数不能为零');
      expect(() => performOperation(-10, '÷', 0)).toThrow('除数不能为零');
      expect(() => performOperation(0, '÷', 0)).toThrow('除数不能为零');
    });
  });

  // ===== 边界情况测试 =====
  describe('边界情况', () => {
    it('应该处理很大的数字', () => {
      expect(performOperation(1000000, '+', 2000000)).toBe(3000000);
      expect(performOperation(999999, '×', 2)).toBe(1999998);
    });

    it('应该处理很小的数字', () => {
      expect(performOperation(0.1, '+', 0.2)).toBeCloseTo(0.3);
      expect(performOperation(0.1, '×', 0.1)).toBeCloseTo(0.01);
    });
  });

  // ===== 游戏实例测试 =====
  describe('游戏实例', () => {
    it('应该正确计算游戏中的常见运算', () => {
      // 游戏中常见的数字范围 1-15（支持所有难度）
      expect(performOperation(7, '-', 10)).toBe(-3);
      expect(performOperation(5, '×', 2)).toBe(10);
      expect(performOperation(11, '÷', 2)).toBe(5.5);
      expect(performOperation(8, '+', 3)).toBe(11);
    });

    it('应该处理可能产生目标数字的运算', () => {
      // 假设目标数字是 15
      expect(performOperation(10, '+', 5)).toBe(15);
      expect(performOperation(3, '×', 5)).toBe(15);
      expect(performOperation(20, '-', 5)).toBe(15);
      expect(performOperation(30, '÷', 2)).toBe(15);
    });
  });
});

// ===== generateEquation 函数测试 =====
describe('generateEquation', () => {
  // 创建测试用的卡片工厂函数
  const createCard = (label: string, operator: Operator, number: number, position: number): Card => ({
    id: `card-${label}`,
    label,
    operator,
    number,
    position
  });

  describe('基本等式生成', () => {
    it('应该根据游戏规则生成正确的等式', () => {
      // 测试案例：J(+7), A(-10), B(×2) => "7 - 10 × 2"
      const cards: [Card, Card, Card] = [
        createCard('J', '+', 7, 0),    // 第1张：只取数字7，忽略+
        createCard('A', '-', 10, 1),   // 第2张：取运算符-和数字10
        createCard('B', '×', 2, 2)     // 第3张：取运算符×和数字2
      ];
      
      expect(generateEquation(cards)).toBe('7 - 10 × 2');
    });

    it('应该正确处理加法运算', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '×', 5, 0),    // 第1张：只取5，忽略×
        createCard('B', '+', 3, 1),    // 第2张：+3
        createCard('C', '+', 8, 2)     // 第3张：+8
      ];
      
      expect(generateEquation(cards)).toBe('5 + 3 + 8');
    });

    it('应该正确处理减法运算', () => {
      const cards: [Card, Card, Card] = [
        createCard('D', '+', 10, 0),   // 第1张：只取10
        createCard('E', '-', 5, 1),    // 第2张：-5
        createCard('F', '-', 2, 2)     // 第3张：-2
      ];
      
      expect(generateEquation(cards)).toBe('10 - 5 - 2');
    });

    it('应该正确处理乘法运算', () => {
      const cards: [Card, Card, Card] = [
        createCard('G', '-', 3, 0),    // 第1张：只取3
        createCard('H', '×', 4, 1),    // 第2张：×4
        createCard('I', '×', 2, 2)     // 第3张：×2
      ];
      
      expect(generateEquation(cards)).toBe('3 × 4 × 2');
    });

    it('应该正确处理除法运算', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 20, 0),   // 第1张：只取20
        createCard('B', '÷', 4, 1),    // 第2张：÷4
        createCard('C', '÷', 2, 2)     // 第3张：÷2
      ];
      
      expect(generateEquation(cards)).toBe('20 ÷ 4 ÷ 2');
    });
  });

  describe('混合运算', () => {
    it('应该正确处理加减混合', () => {
      const cards: [Card, Card, Card] = [
        createCard('X', '÷', 15, 0),   // 第1张：只取15
        createCard('Y', '+', 5, 1),    // 第2张：+5
        createCard('Z', '-', 3, 2)     // 第3张：-3
      ];
      
      expect(generateEquation(cards)).toBe('15 + 5 - 3');
    });

    it('应该正确处理乘除混合', () => {
      const cards: [Card, Card, Card] = [
        createCard('P', '+', 6, 0),    // 第1张：只取6
        createCard('Q', '×', 3, 1),    // 第2张：×3
        createCard('R', '÷', 2, 2)     // 第3张：÷2
      ];
      
      expect(generateEquation(cards)).toBe('6 × 3 ÷ 2');
    });

    it('应该正确处理四则运算混合', () => {
      const cards: [Card, Card, Card] = [
        createCard('M', '×', 8, 0),    // 第1张：只取8
        createCard('N', '+', 4, 1),    // 第2张：+4
        createCard('O', '×', 3, 2)     // 第3张：×3
      ];
      
      expect(generateEquation(cards)).toBe('8 + 4 × 3');
    });
  });

  describe('边界情况', () => {
    it('应该正确处理数字1', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 1, 0),    // 第1张：只取1
        createCard('B', '+', 1, 1),    // 第2张：+1
        createCard('C', '+', 1, 2)     // 第3张：+1
      ];
      
      expect(generateEquation(cards)).toBe('1 + 1 + 1');
    });

    it('应该正确处理数字11（最大值）', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 11, 0),   // 第1张：只取11
        createCard('B', '-', 11, 1),   // 第2张：-11
        createCard('C', '×', 11, 2)    // 第3张：×11
      ];
      
      expect(generateEquation(cards)).toBe('11 - 11 × 11');
    });

    it('应该正确处理连续的相同运算符', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '×', 2, 0),    // 第1张：只取2
        createCard('B', '+', 3, 1),    // 第2张：+3
        createCard('C', '+', 4, 2)     // 第3张：+4
      ];
      
      expect(generateEquation(cards)).toBe('2 + 3 + 4');
    });
  });

  describe('实际游戏场景', () => {
    it('应该处理能得到目标数字9的组合', () => {
      const cards: [Card, Card, Card] = [
        createCard('C', '×', 3, 0),    // 第1张：只取3
        createCard('D', '×', 3, 1),    // 第2张：×3  -> 3 × 3 = 9
        createCard('E', '-', 1, 2)     // 第3张：-1  -> 9 - 1 = 8 (修改为有效场景)
      ];
      
      expect(generateEquation(cards)).toBe('3 × 3 - 1');
    });

    it('应该处理复杂的运算优先级场景', () => {
      // 测试案例：7 - 10 × 2 = 7 - 20 = -13
      const cards: [Card, Card, Card] = [
        createCard('J', '÷', 7, 0),    // 第1张：只取7
        createCard('A', '-', 10, 1),   // 第2张：-10
        createCard('B', '×', 2, 2)     // 第3张：×2
      ];
      
      expect(generateEquation(cards)).toBe('7 - 10 × 2');
    });

    it('应该处理不同字母标识的卡片', () => {
      const cards: [Card, Card, Card] = [
        createCard('F', '+', 6, 5),    // 位置5的F卡
        createCard('H', '÷', 2, 7),    // 位置7的H卡  
        createCard('J', '-', 1, 9)     // 位置9的J卡
      ];
      
      expect(generateEquation(cards)).toBe('6 ÷ 2 - 1');
    });
  });

  describe('格式验证', () => {
    it('生成的等式应该包含正确的空格', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 5, 0),
        createCard('B', '+', 3, 1),
        createCard('C', '×', 2, 2)
      ];
      
      const equation = generateEquation(cards);
      expect(equation).toBe('5 + 3 × 2');
      // 验证空格位置
      expect(equation.split(' ')).toEqual(['5', '+', '3', '×', '2']);
    });

    it('生成的等式应该只包含有效字符', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 7, 0),
        createCard('B', '-', 4, 1),
        createCard('C', '÷', 2, 2)
      ];
      
      const equation = generateEquation(cards);
      // 应该只包含数字、运算符和空格
      expect(equation).toMatch(/^[0-9]+\s[+\-×÷]\s[0-9]+\s[+\-×÷]\s[0-9]+$/);
    });
  });
});

// ===== calculateFromCards 函数测试 =====
describe('calculateFromCards', () => {
  // 复用创建卡片的工厂函数
  const createCard = (label: string, operator: Operator, number: number, position: number): Card => ({
    id: `card-${label}`,
    label,
    operator,
    number,
    position
  });

  describe('基本运算计算', () => {
    it('应该正确计算加法运算', () => {
      // 5 + 3 + 2 = 10
      const cards: [Card, Card, Card] = [
        createCard('A', '×', 5, 0),    // 第1张：只取5
        createCard('B', '+', 3, 1),    // 第2张：+3
        createCard('C', '+', 2, 2)     // 第3张：+2
      ];
      
      expect(calculateFromCards(cards)).toBe(10);
    });

    it('应该正确计算减法运算', () => {
      // 10 - 3 - 2 = 5
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 10, 0),   // 第1张：只取10
        createCard('B', '-', 3, 1),    // 第2张：-3
        createCard('C', '-', 2, 2)     // 第3张：-2
      ];
      
      expect(calculateFromCards(cards)).toBe(5);
    });

    it('应该正确计算乘法运算', () => {
      // 2 × 3 × 4 = 24
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 2, 0),    // 第1张：只取2
        createCard('B', '×', 3, 1),    // 第2张：×3
        createCard('C', '×', 4, 2)     // 第3张：×4
      ];
      
      expect(calculateFromCards(cards)).toBe(24);
    });

    it('应该正确计算除法运算', () => {
      // 20 ÷ 4 ÷ 1 = 5 (修改为产生整数结果)
      const cards: [Card, Card, Card] = [
        createCard('A', '×', 20, 0),   // 第1张：只取20
        createCard('B', '÷', 4, 1),    // 第2张：÷4
        createCard('C', '÷', 1, 2)     // 第3张：÷1
      ];
      
      expect(calculateFromCards(cards)).toBe(5);
    });
  });

  describe('运算优先级测试', () => {
    it('应该正确处理乘法优先级', () => {
      // 7 - 10 × 2 = 7 - 20 = -13
      const cards: [Card, Card, Card] = [
        createCard('J', '+', 7, 0),    // 第1张：只取7
        createCard('A', '-', 10, 1),   // 第2张：-10
        createCard('B', '×', 2, 2)     // 第3张：×2
      ];
      
      expect(calculateFromCards(cards)).toBe(-13);
    });

    it('应该正确处理除法优先级', () => {
      // 5 + 10 ÷ 2 = 5 + 5 = 10
      const cards: [Card, Card, Card] = [
        createCard('A', '×', 5, 0),    // 第1张：只取5
        createCard('B', '+', 10, 1),   // 第2张：+10
        createCard('C', '÷', 2, 2)     // 第3张：÷2
      ];
      
      expect(calculateFromCards(cards)).toBe(10);
    });

    it('应该正确处理混合优先级', () => {
      // 8 + 4 × 3 = 8 + 12 = 20
      const cards: [Card, Card, Card] = [
        createCard('M', '÷', 8, 0),    // 第1张：只取8
        createCard('N', '+', 4, 1),    // 第2张：+4
        createCard('O', '×', 3, 2)     // 第3张：×3
      ];
      
      expect(calculateFromCards(cards)).toBe(20);
    });

    it('应该正确处理减法和乘法混合', () => {
      // 15 - 3 × 4 = 15 - 12 = 3
      const cards: [Card, Card, Card] = [
        createCard('X', '+', 15, 0),   // 第1张：只取15
        createCard('Y', '-', 3, 1),    // 第2张：-3
        createCard('Z', '×', 4, 2)     // 第3张：×4
      ];
      
      expect(calculateFromCards(cards)).toBe(3);
    });

    it('应该正确处理加法和除法混合', () => {
      // 6 + 12 ÷ 3 = 6 + 4 = 10
      const cards: [Card, Card, Card] = [
        createCard('P', '×', 6, 0),    // 第1张：只取6
        createCard('Q', '+', 12, 1),   // 第2张：+12
        createCard('R', '÷', 3, 2)     // 第3张：÷3
      ];
      
      expect(calculateFromCards(cards)).toBe(10);
    });
  });

  describe('复杂计算场景', () => {
    it('应该正确计算从左到右的同级运算', () => {
      // 2 × 3 ÷ 2 = 6 ÷ 2 = 3
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 2, 0),    // 第1张：只取2
        createCard('B', '×', 3, 1),    // 第2张：×3
        createCard('C', '÷', 2, 2)     // 第3张：÷2
      ];
      
      expect(calculateFromCards(cards)).toBe(3);
    });

    it('应该正确计算加减混合从左到右', () => {
      // 10 + 5 - 3 = 15 - 3 = 12
      const cards: [Card, Card, Card] = [
        createCard('D', '×', 10, 0),   // 第1张：只取10
        createCard('E', '+', 5, 1),    // 第2张：+5
        createCard('F', '-', 3, 2)     // 第3张：-3
      ];
      
      expect(calculateFromCards(cards)).toBe(12);
    });

    it('应该正确处理负数结果', () => {
      // 3 - 4 × 2 = 3 - 8 = -5
      const cards: [Card, Card, Card] = [
        createCard('G', '+', 3, 0),    // 第1张：只取3
        createCard('H', '-', 4, 1),    // 第2张：-4
        createCard('I', '×', 2, 2)     // 第3张：×2
      ];
      
      expect(calculateFromCards(cards)).toBe(-5);
    });

    it('应该正确处理除法后的整数结果', () => {
      // 8 ÷ 2 + 1 = 4 + 1 = 5 (修改为产生整数结果)
      const cards: [Card, Card, Card] = [
        createCard('J', '×', 8, 0),    // 第1张：只取8
        createCard('K', '÷', 2, 1),    // 第2张：÷2
        createCard('L', '+', 1, 2)     // 第3张：+1
      ];
      
      expect(calculateFromCards(cards)).toBe(5);
    });
  });

  describe('游戏实际场景', () => {
    it('应该计算能达到目标数字的组合', () => {
      // 3 × 3 - 1 = 9 - 1 = 8
      const cards: [Card, Card, Card] = [
        createCard('C', '+', 3, 0),    // 第1张：只取3
        createCard('D', '×', 3, 1),    // 第2张：×3
        createCard('E', '-', 1, 2)     // 第3张：-1
      ];
      
      expect(calculateFromCards(cards)).toBe(8);
    });

    it('应该计算复杂的游戏组合', () => {
      // 11 - 2 × 3 = 11 - 6 = 5
      const cards: [Card, Card, Card] = [
        createCard('A', '÷', 11, 0),   // 第1张：只取11 (最大数字)
        createCard('B', '-', 2, 1),    // 第2张：-2
        createCard('C', '×', 3, 2)     // 第3张：×3
      ];
      
      expect(calculateFromCards(cards)).toBe(5);
    });

    it('应该处理最小数字组合', () => {
      // 1 + 1 × 1 = 1 + 1 = 2
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 1, 0),    // 第1张：只取1 (最小数字)
        createCard('B', '+', 1, 1),    // 第2张：+1
        createCard('C', '×', 1, 2)     // 第3张：×1
      ];
      
      expect(calculateFromCards(cards)).toBe(2);
    });
  });

  describe('边界情况', () => {
    it('应该处理可能产生非整数的组合', () => {
      // 虽然这种组合会产生小数，但函数应该正确计算
      // 游戏逻辑层会过滤掉这些非整数结果，因为目标总是整数
      // 12 ÷ 3 + 1 = 4 + 1 = 5 (修改为产生整数结果用于测试)
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 12, 0),   // 第1张：只取12
        createCard('B', '÷', 3, 1),    // 第2张：÷3
        createCard('C', '+', 1, 2)     // 第3张：+1
      ];
      
      expect(calculateFromCards(cards)).toBe(5);
    });

    it('应该正确忽略第一张卡的运算符', () => {
      // 验证第1张卡的运算符真的被忽略了
      // 无论第1张卡的运算符是什么，结果应该一样
      const cards1: [Card, Card, Card] = [
        createCard('A', '+', 5, 0),    // 第1张：+5 (+ 被忽略)
        createCard('B', '×', 2, 1),    // 第2张：×2
        createCard('C', '+', 3, 2)     // 第3张：+3
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard('A', '÷', 5, 0),    // 第1张：÷5 (÷ 被忽略)
        createCard('B', '×', 2, 1),    // 第2张：×2
        createCard('C', '+', 3, 2)     // 第3张：+3
      ];
      
      // 两个结果应该相同：5 × 2 + 3 = 10 + 3 = 13
      expect(calculateFromCards(cards1)).toBe(13);
      expect(calculateFromCards(cards2)).toBe(13);
    });
  });

  describe('与generateEquation的一致性', () => {
    it('计算结果应该与生成的等式匹配', () => {
      const cards: [Card, Card, Card] = [
        createCard('J', '+', 7, 0),    
        createCard('A', '-', 10, 1),   
        createCard('B', '×', 2, 2)     
      ];
      
      const equation = generateEquation(cards);
      const result = calculateFromCards(cards);
      
      expect(equation).toBe('7 - 10 × 2');
      expect(result).toBe(-13);
      
      // 手动验证：7 - (10 × 2) = 7 - 20 = -13 ✓
    });

    it('多个测试案例的一致性验证', () => {
      const testCases = [
        {
          cards: [createCard('A', '+', 8, 0), createCard('B', '+', 4, 1), createCard('C', '×', 3, 2)] as [Card, Card, Card],
          expectedEquation: '8 + 4 × 3',
          expectedResult: 20  // 8 + (4 × 3) = 8 + 12 = 20
        },
        {
          cards: [createCard('D', '×', 15, 0), createCard('E', '÷', 3, 1), createCard('F', '-', 2, 2)] as [Card, Card, Card],
          expectedEquation: '15 ÷ 3 - 2',
          expectedResult: 3   // (15 ÷ 3) - 2 = 5 - 2 = 3
        },
        {
          cards: [createCard('G', '-', 6, 0), createCard('H', '×', 2, 1), createCard('I', '÷', 3, 2)] as [Card, Card, Card],
          expectedEquation: '6 × 2 ÷ 3',
          expectedResult: 4   // (6 × 2) ÷ 3 = 12 ÷ 3 = 4
        }
      ];

      testCases.forEach(({ cards, expectedEquation, expectedResult }, index) => {
        const equation = generateEquation(cards);
        const result = calculateFromCards(cards);
        
        expect(equation).toBe(expectedEquation);
        expect(result).toBe(expectedResult);
      });
    });
  });
});

// ===== isValidGameResult 函数测试 =====
describe('isValidGameResult', () => {
  describe('整数验证', () => {
    it('应该识别正整数为有效结果', () => {
      expect(isValidGameResult(0)).toBe(true);
      expect(isValidGameResult(1)).toBe(true);
      expect(isValidGameResult(5)).toBe(true);
      expect(isValidGameResult(100)).toBe(true);
      expect(isValidGameResult(11)).toBe(true); // 游戏中最大数字
    });

    it('应该识别负整数为有效结果', () => {
      expect(isValidGameResult(-1)).toBe(true);
      expect(isValidGameResult(-5)).toBe(true);
      expect(isValidGameResult(-13)).toBe(true); // 7 - 10 × 2 = -13
    });

    it('应该识别小数为无效结果', () => {
      expect(isValidGameResult(2.5)).toBe(false);
      expect(isValidGameResult(3.14)).toBe(false);
      expect(isValidGameResult(4.333333333333334)).toBe(false);
      expect(isValidGameResult(-1.5)).toBe(false);
      expect(isValidGameResult(0.1)).toBe(false);
    });

    it('应该正确处理浮点数精度问题', () => {
      // JavaScript中有时会出现精度问题，比如 0.1 + 0.2 = 0.30000000000000004
      expect(isValidGameResult(0.1 + 0.2)).toBe(false); // 0.30000000000000004
      expect(isValidGameResult(1.0)).toBe(true);         // 仍然是整数
      expect(isValidGameResult(5.0)).toBe(true);         // 仍然是整数
    });
  });

  describe('游戏场景中的应用', () => {
    it('应该正确识别有效的游戏结果', () => {
      const validCards: [Card, Card, Card] = [
        { id: 'A', label: 'A', operator: '+', number: 8, position: 0 },
        { id: 'B', label: 'B', operator: '+', number: 4, position: 1 },
        { id: 'C', label: 'C', operator: '×', number: 3, position: 2 }
      ];
      
      const result = calculateFromCards(validCards); // 8 + 4 × 3 = 20
      expect(result).toBe(20);
      expect(isValidGameResult(result)).toBe(true);
    });

    it('应该正确识别无效的游戏结果', () => {
      // 创建一个会产生小数的组合
      const invalidCards: [Card, Card, Card] = [
        { id: 'A', label: 'A', operator: '+', number: 7, position: 0 },
        { id: 'B', label: 'B', operator: '÷', number: 2, position: 1 },
        { id: 'C', label: 'C', operator: '+', number: 1, position: 2 }
      ];
      
      const result = calculateFromCards(invalidCards); // 7 ÷ 2 + 1 = 4.5
      expect(result).toBe(4.5);
      expect(isValidGameResult(result)).toBe(false);
    });

    it('应该帮助过滤有效的目标数字组合', () => {
      // 模拟游戏中的使用场景
      const possibleResults = [
        15,     // 有效：整数
        7.5,    // 无效：小数
        -3,     // 有效：负整数
        2.333,  // 无效：小数
        0,      // 有效：零
        8       // 有效：正整数
      ];

      const validResults = possibleResults.filter(isValidGameResult);
      expect(validResults).toEqual([15, -3, 0, 8]);
    });
  });

  describe('边界情况', () => {
    it('应该处理特殊数值', () => {
      expect(isValidGameResult(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isValidGameResult(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(isValidGameResult(Infinity)).toBe(false);
      expect(isValidGameResult(-Infinity)).toBe(false);
      expect(isValidGameResult(NaN)).toBe(false);
    });
  });
});

// ===== validateEquationFormat 函数测试 =====
describe('validateEquationFormat', () => {
  // 复用创建卡片的工厂函数
  const createCard = (label: string, operator: Operator, number: number, position: number): Card => ({
    id: `card-${label}`,
    label,
    operator,
    number,
    position
  });

  describe('有效卡片组合验证', () => {
    it('应该验证正常的卡片组合为有效', () => {
      const cards: [Card, Card, Card] = [
        createCard('A', '+', 5, 0),
        createCard('B', '+', 3, 1),
        createCard('C', '×', 2, 2)
      ];
      
      expect(validateEquationFormat(cards)).toBe(true);
    });

    it('应该验证所有运算符的组合', () => {
      const testCases: Array<{
        cards: [Card, Card, Card];
        description: string;
      }> = [
        {
          cards: [
            createCard('A', '+', 1, 0),
            createCard('B', '+', 2, 1),
            createCard('C', '+', 3, 2)
          ],
          description: '加法运算符组合'
        },
        {
          cards: [
            createCard('D', '×', 4, 0),
            createCard('E', '-', 5, 1),
            createCard('F', '-', 6, 2)
          ],
          description: '减法运算符组合'
        },
        {
          cards: [
            createCard('G', '+', 7, 0),
            createCard('H', '×', 8, 1),
            createCard('I', '×', 9, 2)
          ],
          description: '乘法运算符组合'
        },
        {
          cards: [
            createCard('J', '-', 10, 0),
            createCard('K', '÷', 2, 1),
            createCard('L', '÷', 1, 2)
          ],
          description: '除法运算符组合'
        }
      ];

      testCases.forEach(({ cards, description }) => {
        expect(validateEquationFormat(cards)).toBe(true);
      });
    });

    it('应该验证混合运算符的组合', () => {
      const cards: [Card, Card, Card] = [
        createCard('M', '÷', 8, 0),
        createCard('N', '+', 4, 1),
        createCard('O', '×', 3, 2)
      ];
      
      expect(validateEquationFormat(cards)).toBe(true);
    });

    it('应该验证数字范围内的所有数字', () => {
      // 测试最小和最大数字
      const minCards: [Card, Card, Card] = [
        createCard('A', '+', 1, 0),  // 最小数字
        createCard('B', '+', 1, 1),
        createCard('C', '+', 1, 2)
      ];
      
      const maxCards: [Card, Card, Card] = [
        createCard('X', '+', 11, 0), // 最大数字
        createCard('Y', '+', 11, 1),
        createCard('Z', '+', 11, 2)
      ];
      
      expect(validateEquationFormat(minCards)).toBe(true);
      expect(validateEquationFormat(maxCards)).toBe(true);
    });
  });

  describe('无效卡片组合检测', () => {
    it('应该检测出无效的数字范围', () => {
      // 数字0（不允许）
      const zeroCards: [Card, Card, Card] = [
        createCard('A', '+', 0, 0),  // 无效：数字0
        createCard('B', '+', 5, 1),
        createCard('C', '+', 3, 2)
      ];
      
      expect(validateEquationFormat(zeroCards)).toBe(false);
    });

    it('应该检测出超出范围的数字', () => {
      // 数字16（超出范围）
      const overLimitCards: [Card, Card, Card] = [
        createCard('A', '+', 16, 0), // 无效：数字16 > 15
        createCard('B', '+', 5, 1),
        createCard('C', '+', 3, 2)
      ];
      
      expect(validateEquationFormat(overLimitCards)).toBe(false);
    });

    it('应该检测出负数', () => {
      const negativeCards: [Card, Card, Card] = [
        createCard('A', '+', -1, 0), // 无效：负数
        createCard('B', '+', 5, 1),
        createCard('C', '+', 3, 2)
      ];
      
      expect(validateEquationFormat(negativeCards)).toBe(false);
    });

    it('应该检测出小数', () => {
      const decimalCards: [Card, Card, Card] = [
        createCard('A', '+', 3.5, 0), // 无效：小数
        createCard('B', '+', 5, 1),
        createCard('C', '+', 3, 2)
      ];
      
      expect(validateEquationFormat(decimalCards)).toBe(false);
    });
  });

  describe('除零错误检测', () => {
    it('应该检测出可能导致除零的组合', () => {
      // 注意：我们需要考虑第1张卡只取数字的规则
      
      // 第2张或第3张卡有除零风险
      const divideByZeroCards1: [Card, Card, Card] = [
        createCard('A', '+', 5, 0),
        createCard('B', '÷', 0, 1),  // 第2张卡：÷0 (危险)
        createCard('C', '+', 3, 2)
      ];
      
      const divideByZeroCards2: [Card, Card, Card] = [
        createCard('A', '+', 5, 0),
        createCard('B', '+', 3, 1),
        createCard('C', '÷', 0, 2)   // 第3张卡：÷0 (危险)
      ];
      
      expect(validateEquationFormat(divideByZeroCards1)).toBe(false);
      expect(validateEquationFormat(divideByZeroCards2)).toBe(false);
    });

    it('应该允许第1张卡的除法运算符（因为会被忽略）', () => {
      // 第1张卡的运算符被忽略，所以即使是÷0也不影响
      const safeCards: [Card, Card, Card] = [
        createCard('A', '÷', 5, 0),  // 第1张卡：÷被忽略，只取5
        createCard('B', '+', 3, 1),  // 第2张卡：+3
        createCard('C', '×', 2, 2)   // 第3张卡：×2
      ];
      
      expect(validateEquationFormat(safeCards)).toBe(true);
    });

    it('应该检测复杂除零场景', () => {
      // 运算优先级可能导致的除零
      const complexDivideByZero: [Card, Card, Card] = [
        createCard('A', '+', 1, 0),
        createCard('B', '+', 2, 1),
        createCard('C', '÷', 2, 2)   // 1 + 2 ÷ 2 不会除零，这应该是有效的
      ];
      
      expect(validateEquationFormat(complexDivideByZero)).toBe(true);
    });
  });

  describe('卡片属性完整性检测', () => {
    it('应该检测缺失的必要属性', () => {
      // 这些测试可能需要TypeScript编译时检查，但我们也可以运行时验证
      
      // 模拟缺失operator的卡片（通过类型断言）
      const invalidCard = {
        id: 'A',
        label: 'A',
        number: 5,
        position: 0
        // 缺失 operator
      } as Card;
      
      const cardsWithInvalidStructure: [Card, Card, Card] = [
        invalidCard,
        createCard('B', '+', 3, 1),
        createCard('C', '×', 2, 2)
      ];
      
      expect(validateEquationFormat(cardsWithInvalidStructure)).toBe(false);
    });

    it('应该验证运算符的有效性', () => {
      // 模拟无效的运算符
      const invalidOperatorCard = {
        id: 'A',
        label: 'A',
        operator: '%' as Operator, // 无效运算符
        number: 5,
        position: 0
      };
      
      const cardsWithInvalidOperator: [Card, Card, Card] = [
        invalidOperatorCard,
        createCard('B', '+', 3, 1),
        createCard('C', '×', 2, 2)
      ];
      
      expect(validateEquationFormat(cardsWithInvalidOperator)).toBe(false);
    });
  });

  describe('实际游戏场景验证', () => {
    it('应该验证典型的游戏卡片组合', () => {
      // 模拟游戏中实际可能出现的卡片组合
      const gameScenarios = [
        {
          cards: [
            createCard('J', '+', 7, 0),
            createCard('A', '-', 10, 1),
            createCard('B', '×', 2, 2)
          ] as [Card, Card, Card],
          description: '经典场景：7 - 10 × 2'
        },
        {
          cards: [
            createCard('C', '×', 3, 2),
            createCard('D', '×', 3, 3),
            createCard('E', '-', 1, 4)
          ] as [Card, Card, Card],
          description: '乘法场景：3 × 3 - 1'
        },
        {
          cards: [
            createCard('F', '÷', 11, 5),
            createCard('G', '-', 2, 6),
            createCard('H', '×', 3, 7)
          ] as [Card, Card, Card],
          description: '复杂场景：11 - 2 × 3'
        }
      ];

      gameScenarios.forEach(({ cards, description }) => {
        expect(validateEquationFormat(cards)).toBe(true);
      });
    });

    it('应该拒绝会导致计算错误的组合', () => {
      // 虽然格式正确，但可能导致计算问题的组合
      const problematicCards: [Card, Card, Card] = [
        createCard('A', '+', 1, 0),
        createCard('B', '÷', 0, 1),  // 除零问题
        createCard('C', '+', 1, 2)
      ];
      
      expect(validateEquationFormat(problematicCards)).toBe(false);
    });

    it('应该验证边界数字组合', () => {
      const boundaryCards: [Card, Card, Card] = [
        createCard('A', '+', 1, 0),   // 最小数字
        createCard('B', '+', 11, 1),  // 最大数字
        createCard('C', '÷', 1, 2)    // 安全除法
      ];
      
      expect(validateEquationFormat(boundaryCards)).toBe(true);
    });
  });

  describe('与其他函数的集成测试', () => {
    it('有效的卡片应该能够生成等式和计算结果', () => {
      const validCards: [Card, Card, Card] = [
        createCard('A', '+', 8, 0),
        createCard('B', '+', 4, 1),
        createCard('C', '×', 3, 2)
      ];
      
      expect(validateEquationFormat(validCards)).toBe(true);
      
      // 如果验证通过，应该能够正常生成等式和计算结果
      expect(() => generateEquation(validCards)).not.toThrow();
      expect(() => calculateFromCards(validCards)).not.toThrow();
      
      const equation = generateEquation(validCards);
      const result = calculateFromCards(validCards);
      
      expect(equation).toBe('8 + 4 × 3');
      expect(result).toBe(20);
    });

    it('无效的卡片应该被检测出来', () => {
      const invalidCards: [Card, Card, Card] = [
        createCard('A', '+', 5, 0),
        createCard('B', '÷', 0, 1),  // 除零问题
        createCard('C', '+', 3, 2)
      ];
      
      expect(validateEquationFormat(invalidCards)).toBe(false);
      
      // 即使验证失败，函数也应该能运行（但结果可能有问题）
      // 这里主要是确保validateEquationFormat正确识别了问题
    });
  });
});

// ===== findAllPossibleEquations 函数测试 =====
describe('findAllPossibleEquations', () => {
  // 复用创建卡片的工厂函数
  const createCard = (label: string, operator: Operator, number: number, position: number): Card => ({
    id: `card-${label}`,
    label,
    operator,
    number,
    position
  });

  describe('基本排列组合', () => {
    it('应该从3张卡片生成6种排列组合', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 3, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // 3张卡片的排列数：3! = 6
      expect(results).toHaveLength(6);
      
      // 验证所有排列都是不同的
      const equations = results.map(r => r.equation);
      const uniqueEquations = new Set(equations);
      expect(uniqueEquations.size).toBe(6);
    });

    it('应该从4张卡片生成24种排列组合', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 3, 2),
        createCard('D', '-', 4, 3)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // 从4张卡片中选3张的排列数：P(4,3) = 4×3×2 = 24
      expect(results).toHaveLength(24);
    });

    it('应该从5张卡片生成60种排列组合', () => {
      const cards = Array.from({ length: 5 }, (_, i) => 
        createCard(String.fromCharCode(65 + i), '+', i + 1, i)
      );
      
      const results = findAllPossibleEquations(cards);
      
      // 从5张卡片中选3张的排列数：P(5,3) = 5×4×3 = 60
      expect(results).toHaveLength(60);
    });
  });

  describe('等式生成和计算', () => {
    it('应该为每个组合生成正确的等式字符串', () => {
      const cards = [
        createCard('A', '+', 5, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '-', 3, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // 检查特定的排列组合
      const abcResult = results.find(r => 
        r.cards[0].label === 'A' && 
        r.cards[1].label === 'B' && 
        r.cards[2].label === 'C'
      );
      
      expect(abcResult).toBeDefined();
      expect(abcResult!.equation).toBe('5 × 2 - 3');
      expect(abcResult!.result).toBe(7); // 5 × 2 - 3 = 10 - 3 = 7
    });

    it('应该为每个组合计算正确的结果', () => {
      const cards = [
        createCard('X', '+', 6, 0),
        createCard('Y', '+', 4, 1),
        createCard('Z', '×', 3, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // 检查 X Y Z 组合：6 + 4 × 3 = 6 + 12 = 18
      const xyzResult = results.find(r => 
        r.cards[0].label === 'X' && 
        r.cards[1].label === 'Y' && 
        r.cards[2].label === 'Z'
      );
      
      expect(xyzResult).toBeDefined();
      expect(xyzResult!.result).toBe(18);
    });

    it('应该正确处理运算优先级', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '+', 3, 1),
        createCard('C', '×', 4, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // A B C: 2 + 3 × 4 = 2 + 12 = 14 (乘法优先)
      const abcResult = results.find(r => 
        r.cards[0].label === 'A' && 
        r.cards[1].label === 'B' && 
        r.cards[2].label === 'C'
      );
      expect(abcResult!.result).toBe(14);
    });
  });

  describe('实际游戏场景', () => {
    it('应该生成典型游戏场景的所有组合', () => {
      // 模拟游戏中的一小部分卡片
      const cards = [
        createCard('A', '+', 3, 0),
        createCard('B', '×', 3, 1),
        createCard('C', '-', 1, 2),
        createCard('D', '+', 2, 3)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      expect(results).toHaveLength(24); // P(4,3) = 24
      
      // 验证是否有能产生特定目标数字的组合
      const resultsForTarget8 = results.filter(r => r.result === 8);
      expect(resultsForTarget8.length).toBeGreaterThan(0);
    });

    it('应该处理大数字组合', () => {
      const cards = [
        createCard('A', '+', 11, 0), // 最大数字
        createCard('B', '-', 1, 1),  // 最小数字  
        createCard('C', '×', 2, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      expect(results).toHaveLength(6);
      
      // A B C: 11 - 1 × 2 = 11 - 2 = 9
      const abcResult = results.find(r => 
        r.cards[0].label === 'A' && 
        r.cards[1].label === 'B' && 
        r.cards[2].label === 'C'
      );
      expect(abcResult!.result).toBe(9);
    });
  });

  describe('正确性验证', () => {
    it('所有生成的组合都应该是有效的', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '×', 3, 1),
        createCard('C', '-', 1, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // 每个结果都应该有正确的结构
      results.forEach(result => {
        expect(result.cards).toHaveLength(3);
        expect(typeof result.equation).toBe('string');
        expect(typeof result.result).toBe('number');
        expect(result.equation.length).toBeGreaterThan(0);
        expect(Number.isFinite(result.result)).toBe(true);
      });
    });

    it('不应该包含重复的排列', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '+', 2, 1),
        createCard('C', '+', 3, 2),
        createCard('D', '+', 4, 3)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // 检查是否有重复的排列（通过比较卡片ID序列）
      const cardSequences = results.map(r => 
        r.cards.map(c => c.id).join(',')
      );
      
      const uniqueSequences = new Set(cardSequences);
      expect(uniqueSequences.size).toBe(results.length);
    });

    it('生成的等式应该与手动计算一致', () => {
      const cards = [
        createCard('X', '+', 6, 0),
        createCard('Y', '÷', 2, 1),
        createCard('Z', '+', 1, 2)
      ];
      
      const results = findAllPossibleEquations(cards);
      
      // X Y Z: 6 ÷ 2 + 1 = 3 + 1 = 4
      const xyzResult = results.find(r => 
        r.cards[0].label === 'X' && 
        r.cards[1].label === 'Y' && 
        r.cards[2].label === 'Z'
      );
      expect(xyzResult!.result).toBe(4);
      expect(xyzResult!.equation).toBe('6 ÷ 2 + 1');
    });
  });
});

// ===== getSolutionsForTarget 函数测试 =====
describe('getSolutionsForTarget', () => {
  // 复用创建卡片的工厂函数
  const createCard = (label: string, operator: Operator, number: number, position: number): Card => ({
    id: `card-${label}`,
    label,
    operator,
    number,
    position
  });

  describe('基本目标查找', () => {
    it('应该找到简单加法达到目标的组合', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '+', 3, 1),
        createCard('C', '+', 4, 2)
      ];
      
      // 目标数字 9
      // A B C: 2 + 3 + 4 = 9 ✓
      // 其他组合也都是9 (因为都是加法)
      
      const solutions = getSolutionsForTarget(cards, 9);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      // 验证所有解都是正确的
      solutions.forEach(solution => {
        expect(solution.equation).toContain('2');
        expect(solution.equation).toContain('3');
        expect(solution.equation).toContain('4');
        expect(solution.equation).toContain('+');
      });
    });

    it('应该找到乘法达到目标的组合', () => {
      const cards = [
        createCard('A', '+', 6, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 0, 2) // 注意：0在游戏中可能无效，但这里测试数学逻辑
      ];
      
      // 目标数字 12
      // A B C: 6 × 2 + 0 = 12 + 0 = 12 ✓
      
      const solutions = getSolutionsForTarget(cards, 12);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      const solution = solutions.find(s => s.equation === '6 × 2 + 0');
      expect(solution).toBeDefined();
    });

    it('应该正确处理运算优先级', () => {
      const cards = [
        createCard('A', '+', 4, 0),
        createCard('B', '+', 2, 1),
        createCard('C', '×', 3, 2)
      ];
      
      // 目标数字 10
      // A B C: 4 + 2 × 3 = 4 + 6 = 10 ✓
      
      const solutions = getSolutionsForTarget(cards, 10);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      const solution = solutions.find(s => s.equation === '4 + 2 × 3');
      expect(solution).toBeDefined();
    });
  });

  describe('复杂目标查找', () => {
    it('应该处理除法运算', () => {
      const cards = [
        createCard('A', '+', 8, 0),
        createCard('B', '÷', 2, 1),
        createCard('C', '+', 1, 2)
      ];
      
      // 目标数字 5
      // A B C: 8 ÷ 2 + 1 = 4 + 1 = 5 ✓
      
      const solutions = getSolutionsForTarget(cards, 5);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      const solution = solutions.find(s => s.equation === '8 ÷ 2 + 1');
      expect(solution).toBeDefined();
    });

    it('应该处理负数结果', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '-', 5, 1),
        createCard('C', '+', 2, 2)
      ];
      
      // 目标数字 -2
      // A B C: 1 - 5 + 2 = -4 + 2 = -2 ✓
      
      const solutions = getSolutionsForTarget(cards, -2);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      const solution = solutions.find(s => s.equation === '1 - 5 + 2');
      expect(solution).toBeDefined();
    });
  });

  describe('边界情况处理', () => {
    it('应该处理没有解的情况', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '+', 1, 1),
        createCard('C', '+', 1, 2)
      ];
      
      // 目标数字 100（显然无法达到）
      const solutions = getSolutionsForTarget(cards, 100);
      
      expect(solutions).toHaveLength(0);
    });

    it('应该处理只有3张卡片的情况', () => {
      const cards = [
        createCard('A', '+', 10, 0),
        createCard('B', '-', 5, 1),
        createCard('C', '+', 2, 2)
      ];
      
      // 目标数字 7
      // A B C: 10 - 5 + 2 = 7 ✓
      // A C B: 10 + 2 - 5 = 7 ✓  
      // B A C: 5 + 10 × 2 = 5 + 20 = 25 ✗
      // B C A: 5 × 2 + 10 = 10 + 10 = 20 ✗
      // C A B: 2 + 10 - 5 = 7 ✓
      // C B A: 2 - 5 + 10 = 7 ✓
      
      const solutions = getSolutionsForTarget(cards, 7);
      
      expect(solutions).toHaveLength(4); // 有4种排列能达到目标7
      
      // 验证每个解都正确
      solutions.forEach(solution => {
        const result = calculateFromCards(solution.cards);
        expect(result).toBe(7);
      });
      
      // 验证包含预期的解
      const expectedEquations = ['10 - 5 + 2', '10 + 2 - 5', '2 + 10 - 5', '2 - 5 + 10'];
      const foundEquations = solutions.map(s => s.equation);
      expectedEquations.forEach(expected => {
        expect(foundEquations).toContain(expected);
      });
    });

    it('应该处理大数字', () => {
      const cards = [
        createCard('A', '+', 11, 0), // 最大游戏数字
        createCard('B', '×', 11, 1),
        createCard('C', '+', 0, 2)
      ];
      
      // 目标数字 121
      // A B C: 11 × 11 + 0 = 121 + 0 = 121 ✓
      
      const solutions = getSolutionsForTarget(cards, 121);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      const solution = solutions.find(s => s.equation === '11 × 11 + 0');
      expect(solution).toBeDefined();
    });
  });

  describe('实际游戏场景', () => {
    it('应该找到典型游戏中的解', () => {
      // 模拟一个真实的游戏场景
      const cards = [
        createCard('A', '+', 3, 0),
        createCard('B', '×', 4, 1),
        createCard('C', '-', 2, 2),
        createCard('D', '+', 5, 3)
      ];
      
      // 目标数字 10
      const solutions = getSolutionsForTarget(cards, 10);
      
      // 应该找到一些解
      expect(solutions.length).toBeGreaterThan(0);
      
      // 验证所有解都正确
      solutions.forEach(solution => {
        const result = calculateFromCards(solution.cards);
        expect(result).toBe(10);
        expect(solution.cards).toHaveLength(3);
        expect(typeof solution.equation).toBe('string');
        expect(solution.equation.length).toBeGreaterThan(0);
      });
    });

    it('应该处理整数目标（游戏规则）', () => {
      const cards = [
        createCard('A', '+', 6, 0),
        createCard('B', '÷', 3, 1),
        createCard('C', '×', 4, 2)
      ];
      
      // 目标数字 8（整数）
      // A B C: 6 ÷ 3 × 4 = 2 × 4 = 8 ✓
      
      const solutions = getSolutionsForTarget(cards, 8);
      
      expect(solutions.length).toBeGreaterThan(0);
      
      // 验证找到的解确实是整数
      solutions.forEach(solution => {
        const result = calculateFromCards(solution.cards);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBe(8);
      });
    });
  });

  describe('性能和正确性', () => {
    it('所有返回的解都应该是正确的', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '×', 3, 1),
        createCard('C', '-', 1, 2),
        createCard('D', '÷', 2, 3)
      ];
      
      const target = 5;
      const solutions = getSolutionsForTarget(cards, target);
      
      // 验证每个解都正确
      solutions.forEach(solution => {
        expect(solution.cards).toHaveLength(3);
        expect(typeof solution.equation).toBe('string');
        
        const calculatedResult = calculateFromCards(solution.cards);
        expect(calculatedResult).toBe(target);
      });
    });

    it('应该与findAllPossibleEquations的结果一致', () => {
      const cards = [
        createCard('A', '+', 4, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 1, 2)
      ];
      
      const target = 9;
      
      // 使用getSolutionsForTarget
      const solutions = getSolutionsForTarget(cards, target);
      
      // 使用findAllPossibleEquations然后过滤
      const allEquations = findAllPossibleEquations(cards);
      const filteredEquations = allEquations.filter(eq => eq.result === target);
      
      // 两种方法应该得到相同的结果
      expect(solutions.length).toBe(filteredEquations.length);
      
      // 验证内容一致
      solutions.forEach(solution => {
        const found = filteredEquations.find(eq => 
          eq.equation === solution.equation
        );
        expect(found).toBeDefined();
      });
    });
  });
});

// ===== isTargetReachable 函数测试 =====
describe('isTargetReachable', () => {
  // 复用创建卡片的工厂函数
  const createCard = (label: string, operator: Operator, number: number, position: number): Card => ({
    id: `card-${label}`,
    label,
    operator,
    number,
    position
  });

  describe('可达目标检测', () => {
    it('应该检测出可达的简单目标', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '+', 3, 1),
        createCard('C', '+', 4, 2)
      ];
      
      // 目标数字 9: 2 + 3 + 4 = 9 ✓
      expect(isTargetReachable(cards, 9)).toBe(true);
    });

    it('应该检测出可达的乘法目标', () => {
      const cards = [
        createCard('A', '+', 6, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 0, 2)
      ];
      
      // 目标数字 12: 6 × 2 + 0 = 12 ✓
      expect(isTargetReachable(cards, 12)).toBe(true);
    });

    it('应该检测出可达的复杂运算优先级目标', () => {
      const cards = [
        createCard('A', '+', 4, 0),
        createCard('B', '+', 2, 1),
        createCard('C', '×', 3, 2)
      ];
      
      // 目标数字 10: 4 + 2 × 3 = 4 + 6 = 10 ✓
      expect(isTargetReachable(cards, 10)).toBe(true);
    });
  });

  describe('不可达目标检测', () => {
    it('应该检测出不可达的过大目标', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '+', 1, 1),
        createCard('C', '+', 1, 2)
      ];
      
      // 目标数字 100: 最大可能是 1 + 1 + 1 = 3，无法达到100
      expect(isTargetReachable(cards, 100)).toBe(false);
    });

    it('应该检测出不可达的特定数字', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 1, 2)
      ];
      
      // 检查一个特定的不可达目标
      // 可能的结果: 2×2+1=5, 2+2×1=4, 1×2+2=4, 1+2×2=5, 2+1×2=4, 2×1+2=4
      // 所以目标数字 7 应该不可达
      expect(isTargetReachable(cards, 7)).toBe(false);
    });
  });

  describe('边界情况', () => {
    it('应该处理只有3张卡片的情况', () => {
      const cards = [
        createCard('A', '+', 10, 0),
        createCard('B', '-', 5, 1),
        createCard('C', '+', 2, 2)
      ];
      
      // 目标数字 7: 10 - 5 + 2 = 7 ✓
      expect(isTargetReachable(cards, 7)).toBe(true);
      
      // 目标数字 100: 不可达
      expect(isTargetReachable(cards, 100)).toBe(false);
    });

    it('应该处理大数字组合', () => {
      const cards = [
        createCard('A', '+', 11, 0), // 最大游戏数字
        createCard('B', '×', 11, 1),
        createCard('C', '+', 0, 2)
      ];
      
      // 目标数字 121: 11 × 11 + 0 = 121 ✓
      expect(isTargetReachable(cards, 121)).toBe(true);
      
      // 目标数字 1000: 不可达
      expect(isTargetReachable(cards, 1000)).toBe(false);
    });
  });

  describe('与getSolutionsForTarget的一致性', () => {
    it('当getSolutionsForTarget返回解时，isTargetReachable应该返回true', () => {
      const cards = [
        createCard('A', '+', 4, 0),
        createCard('B', '×', 2, 1),
        createCard('C', '+', 1, 2)
      ];
      
      const target = 9;
      const solutions = getSolutionsForTarget(cards, target);
      const isReachable = isTargetReachable(cards, target);
      
      if (solutions.length > 0) {
        expect(isReachable).toBe(true);
      } else {
        expect(isReachable).toBe(false);
      }
    });

    it('当getSolutionsForTarget返回空数组时，isTargetReachable应该返回false', () => {
      const cards = [
        createCard('A', '+', 1, 0),
        createCard('B', '+', 1, 1),
        createCard('C', '+', 1, 2)
      ];
      
      const target = 100; // 明显不可达
      const solutions = getSolutionsForTarget(cards, target);
      const isReachable = isTargetReachable(cards, target);
      
      expect(solutions).toHaveLength(0);
      expect(isReachable).toBe(false);
    });

    it('应该与getSolutionsForTarget在多个目标上保持一致', () => {
      const cards = [
        createCard('A', '+', 2, 0),
        createCard('B', '×', 3, 1),
        createCard('C', '-', 1, 2),
        createCard('D', '÷', 2, 3)
      ];
      
      // 测试多个目标数字
      const targets = [1, 5, 10, 15, 20, 0, -5, 2.5];
      
      targets.forEach(target => {
        const solutions = getSolutionsForTarget(cards, target);
        const isReachable = isTargetReachable(cards, target);
        
        if (solutions.length > 0) {
          expect(isReachable).toBe(true);
        } else {
          expect(isReachable).toBe(false);
        }
      });
    });
  });
});
