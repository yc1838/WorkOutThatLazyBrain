/**
 * 解法去重功能测试
 * 
 * 测试数学等价性检测和解法去重逻辑
 * 确保相同数学意义的等式不会被重复计分
 */

import { describe, it, expect } from 'vitest';
import { calculateFromCards } from '../mathUtils';
import type { Card } from '../../types/game';

// 模拟 createNormalizedSolutionKey 函数（从 App.tsx 复制）
const createNormalizedSolutionKey = (cardObjects: [Card, Card, Card], result: number): string => {
  const [card1, card2, card3] = cardObjects;
  
  // 提取数字和运算符
  const num1 = card1.number;
  const op1 = card2.operator;
  const num2 = card2.number;
  const op2 = card3.operator;
  const num3 = card3.number;
  
  // 根据运算符优先级和交换律创建标准化表示
  let normalizedForm: string;
  
  // 处理纯乘法或纯加法（完全可交换）
  if ((op1 === '×' && op2 === '×') || (op1 === '+' && op2 === '+')) {
    const numbers = [num1, num2, num3].sort((a, b) => a - b);
    normalizedForm = `${numbers[0]}${op1}${numbers[1]}${op2}${numbers[2]}`;
  }
  // 处理加法和乘法混合（考虑交换律和运算优先级）
  else if ((op1 === '+' && op2 === '×') || (op1 === '×' && op2 === '+')) {
    // 由于加法的交换律，a + b×c = b×c + a
    // 所以我们将乘法部分和加法部分分别标准化
    let multPart: string;
    let addPart: number;
    
    if (op1 === '+' && op2 === '×') {
      // a + b × c 形式
      const sortedMult = [num2, num3].sort((a, b) => a - b);
      multPart = `${sortedMult[0]}×${sortedMult[1]}`;
      addPart = num1;
    } else {
      // a × b + c 形式
      const sortedMult = [num1, num2].sort((a, b) => a - b);
      multPart = `${sortedMult[0]}×${sortedMult[1]}`;
      addPart = num3;
    }
    
    // 标准化为 "较小数+较大数×较大数" 的形式
    normalizedForm = `${addPart}+${multPart}`;
  }
  // 处理乘法和减法混合（乘法可交换，但减法不可交换）
  else if ((op1 === '×' && op2 === '-') || (op1 === '×' && op2 === '+')) {
    // a × b - c 形式：乘法部分可以交换，但减法不能
    // 6 × 9 - 7 和 9 × 6 - 7 应该被认为是相同的
    const sortedMult = [num1, num2].sort((a, b) => a - b);
    normalizedForm = `${sortedMult[0]}×${sortedMult[1]}${op2}${num3}`;
  }
  // 处理除法和减法/加法混合（除法可交换，但减法不可交换）
  else if ((op1 === '÷' && op2 === '-') || (op1 === '÷' && op2 === '+')) {
    // a ÷ b - c 形式：除法部分可以交换（在某些情况下），但减法不能
    // 但除法通常不满足交换律，所以保持原序
    normalizedForm = `${num1}${op1}${num2}${op2}${num3}`;
  }
  // 处理减法和乘法混合（考虑运算优先级）
  else if (op1 === '-' && op2 === '×') {
    // a - b × c 形式：乘法部分可以交换
    // 7 - 6 × 9 和 7 - 9 × 6 应该被认为是相同的
    const sortedMult = [num2, num3].sort((a, b) => a - b);
    normalizedForm = `${num1}-${sortedMult[0]}×${sortedMult[1]}`;
  }
  // 处理减法和除法混合（考虑运算优先级）
  else if (op1 === '-' && op2 === '÷') {
    // a - b ÷ c 形式：除法不满足交换律，保持原序
    normalizedForm = `${num1}${op1}${num2}${op2}${num3}`;
  }
  // 处理加法和除法混合（考虑运算优先级）
  else if (op1 === '+' && op2 === '÷') {
    // a + b ÷ c 形式：除法不满足交换律，但可以重新排列为 b÷c + a
    normalizedForm = `${num2}÷${num3}+${num1}`;
  }
  // 处理加法和减法混合（同级运算，可以重新排列）
  else if ((op1 === '+' && op2 === '-') || (op1 === '-' && op2 === '+')) {
    // 对于 a + b - c 和 a - c + b 这样的表达式
    // 我们需要将它们标准化为相同的形式
    // 数学上：a + b - c = a - c + b（因为加法和减法可以重新排列）
    
    // 将所有项分为正项和负项
    let positiveTerms: number[] = [num1]; // 第一个数字总是正的
    let negativeTerms: number[] = [];
    
    if (op1 === '+') {
      positiveTerms.push(num2);
    } else {
      negativeTerms.push(num2);
    }
    
    if (op2 === '+') {
      positiveTerms.push(num3);
    } else {
      negativeTerms.push(num3);
    }
    
    // 对正项和负项分别排序
    positiveTerms.sort((a, b) => a - b);
    negativeTerms.sort((a, b) => a - b);
    
    // 构建标准化形式：所有正项相加，然后减去所有负项
    let normalized = positiveTerms.join('+');
    if (negativeTerms.length > 0) {
      normalized += '-' + negativeTerms.join('-');
    }
    
    normalizedForm = normalized;
  }
  else {
    // 对于其他情况（包含减法或除法且不满足上述模式），保持原始顺序
    // 因为减法和除法通常不满足交换律
    normalizedForm = `${num1}${op1}${num2}${op2}${num3}`;
  }
  
  // 组合结果和标准化形式作为唯一键
  return `${result}:${normalizedForm}`;
};

// 辅助函数：创建卡片对象
const createCard = (number: number, operator: string, label: string): Card => ({
  id: `card-${label}`,
  label,
  operator: operator as any,
  number,
  position: 0
});

describe('解法去重功能测试', () => {
  describe('纯乘法交换律', () => {
    it('应该将 6×9×1 和 9×6×1 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(6, '+', 'A'),
        createCard(9, '×', 'B'),
        createCard(1, '×', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(9, '+', 'D'),
        createCard(6, '×', 'E'),
        createCard(1, '×', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(result2); // 结果应该相同
      expect(key1).toBe(key2); // 标准化键应该相同
    });
    
    it('应该将所有乘法排列识别为相同解法', () => {
      const arrangements = [
        [2, 3, 5], [2, 5, 3], [3, 2, 5], [3, 5, 2], [5, 2, 3], [5, 3, 2]
      ];
      
      const keys = arrangements.map(([a, b, c]) => {
        const cards: [Card, Card, Card] = [
          createCard(a, '+', 'A'),
          createCard(b, '×', 'B'),
          createCard(c, '×', 'C')
        ];
        const result = calculateFromCards(cards);
        return createNormalizedSolutionKey(cards, result);
      });
      
      // 所有键应该相同
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(1);
    });
  });

  describe('纯加法交换律', () => {
    it('应该将 3+7+2 和 7+3+2 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(3, '+', 'A'),
        createCard(7, '+', 'B'),
        createCard(2, '+', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(7, '+', 'D'),
        createCard(3, '+', 'E'),
        createCard(2, '+', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(result2);
      expect(key1).toBe(key2);
    });
  });

  describe('乘法和减法混合 - 关键测试用例', () => {
    it('应该将 6×9-7 和 9×6-7 识别为相同解法', () => {
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
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(47); // 6×9-7 = 54-7 = 47
      expect(result2).toBe(47); // 9×6-7 = 54-7 = 47
      expect(key1).toBe(key2); // 应该生成相同的标准化键
    });
    
    it('应该将 3×4-2 和 4×3-2 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(3, '+', 'A'),
        createCard(4, '×', 'B'),
        createCard(2, '-', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(4, '+', 'D'),
        createCard(3, '×', 'E'),
        createCard(2, '-', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(10); // 3×4-2 = 12-2 = 10
      expect(result2).toBe(10); // 4×3-2 = 12-2 = 10
      expect(key1).toBe(key2);
    });
  });

  describe('乘法和加法混合', () => {
    it('应该将 2×3+5 和 3×2+5 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(2, '+', 'A'),
        createCard(3, '×', 'B'),
        createCard(5, '+', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(3, '+', 'D'),
        createCard(2, '×', 'E'),
        createCard(5, '+', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(11); // 2×3+5 = 6+5 = 11
      expect(result2).toBe(11); // 3×2+5 = 6+5 = 11
      expect(key1).toBe(key2);
    });
    
    it('应该将 5+2×3 和 5+3×2 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(5, '+', 'A'),
        createCard(2, '+', 'B'),
        createCard(3, '×', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(5, '+', 'D'),
        createCard(3, '+', 'E'),
        createCard(2, '×', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(11); // 5+2×3 = 5+6 = 11
      expect(result2).toBe(11); // 5+3×2 = 5+6 = 11
      expect(key1).toBe(key2);
    });
  });

  describe('减法和乘法混合', () => {
    it('应该将 10-2×3 和 10-3×2 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(10, '+', 'A'),
        createCard(2, '-', 'B'),
        createCard(3, '×', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(10, '+', 'D'),
        createCard(3, '-', 'E'),
        createCard(2, '×', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(4); // 10-2×3 = 10-6 = 4
      expect(result2).toBe(4); // 10-3×2 = 10-6 = 4
      expect(key1).toBe(key2);
    });
  });

  describe('不应该去重的情况', () => {
    it('不应该将 6×9-7 和 6-9×7 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(6, '+', 'A'),
        createCard(9, '×', 'B'),
        createCard(7, '-', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(6, '+', 'D'),
        createCard(9, '-', 'E'),
        createCard(7, '×', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(47); // 6×9-7 = 54-7 = 47
      expect(result2).toBe(-57); // 6-9×7 = 6-63 = -57
      expect(key1).not.toBe(key2); // 应该生成不同的键
    });
    
    it('不应该将 8-3 和 3-8 识别为相同解法（减法不满足交换律）', () => {
      const cards1: [Card, Card, Card] = [
        createCard(8, '+', 'A'),
        createCard(3, '-', 'B'),
        createCard(1, '+', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(3, '+', 'D'),
        createCard(8, '-', 'E'),
        createCard(1, '+', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(6); // 8-3+1 = 5+1 = 6
      expect(result2).toBe(-4); // 3-8+1 = -5+1 = -4
      expect(key1).not.toBe(key2);
    });
    
    it('不应该将 12÷3 和 3÷12 识别为相同解法（除法不满足交换律）', () => {
      const cards1: [Card, Card, Card] = [
        createCard(12, '+', 'A'),
        createCard(3, '÷', 'B'),
        createCard(1, '+', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(3, '+', 'D'),
        createCard(12, '÷', 'E'),
        createCard(1, '+', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(5); // 12÷3+1 = 4+1 = 5
      expect(result2).toBe(1.25); // 3÷12+1 = 0.25+1 = 1.25
      expect(key1).not.toBe(key2);
    });
  });

  describe('加法和减法混合', () => {
    it('应该将 5+4-8 和 5-8+4 识别为相同解法', () => {
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
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(1); // 5+4-8 = 9-8 = 1
      expect(result2).toBe(1); // 5-8+4 = -3+4 = 1
      expect(key1).toBe(key2); // 应该生成相同的标准化键
    });
    
    it('应该将 10+3-7 和 10-7+3 识别为相同解法', () => {
      const cards1: [Card, Card, Card] = [
        createCard(10, '+', 'A'),
        createCard(3, '+', 'B'),
        createCard(7, '-', 'C')
      ];
      
      const cards2: [Card, Card, Card] = [
        createCard(10, '+', 'D'),
        createCard(7, '-', 'E'),
        createCard(3, '+', 'F')
      ];
      
      const result1 = calculateFromCards(cards1);
      const result2 = calculateFromCards(cards2);
      
      const key1 = createNormalizedSolutionKey(cards1, result1);
      const key2 = createNormalizedSolutionKey(cards2, result2);
      
      expect(result1).toBe(6); // 10+3-7 = 13-7 = 6
      expect(result2).toBe(6); // 10-7+3 = 3+3 = 6
      expect(key1).toBe(key2);
    });
  });

  describe('综合去重测试', () => {
    it('应该正确去重包含多种等价解法的数组', () => {
      const solutions = [
        // 组1: 6×9-7 的等价解法
        { cards: [createCard(6, '+', 'A'), createCard(9, '×', 'B'), createCard(7, '-', 'C')] },
        { cards: [createCard(9, '+', 'D'), createCard(6, '×', 'E'), createCard(7, '-', 'F')] },
        
        // 组2: 2×3×5 的等价解法
        { cards: [createCard(2, '+', 'G'), createCard(3, '×', 'H'), createCard(5, '×', 'I')] },
        { cards: [createCard(3, '+', 'J'), createCard(2, '×', 'K'), createCard(5, '×', 'L')] },
        { cards: [createCard(5, '+', 'M'), createCard(2, '×', 'N'), createCard(3, '×', 'O')] },
        
        // 组3: 1+2+3 的等价解法
        { cards: [createCard(1, '+', 'P'), createCard(2, '+', 'Q'), createCard(3, '+', 'R')] },
        { cards: [createCard(2, '+', 'S'), createCard(1, '+', 'T'), createCard(3, '+', 'U')] },
        
        // 组4: 不同的解法（不应该被去重）
        { cards: [createCard(10, '+', 'V'), createCard(5, '-', 'W'), createCard(2, '+', 'X')] },
      ];
      
      const seenKeys = new Set<string>();
      const uniqueSolutions: typeof solutions = [];
      
      for (const solution of solutions) {
        const result = calculateFromCards(solution.cards);
        const normalizedKey = createNormalizedSolutionKey(solution.cards, result);
        
        if (!seenKeys.has(normalizedKey)) {
          seenKeys.add(normalizedKey);
          uniqueSolutions.push(solution);
        }
      }
      
      // 应该从8个解法去重到4个唯一解法
      expect(uniqueSolutions.length).toBe(4);
      expect(solutions.length).toBe(8);
    });
  });
});
