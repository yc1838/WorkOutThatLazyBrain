/**
 * 数学金字塔游戏 - 数学计算工具函数
 * 
 * 这个文件包含所有与数学计算相关的函数
 * 包括等式生成、计算、验证等功能
 */

import { Card, Operator } from '../types/game';

// ===== 等式计算相关函数 =====

/**
 * 根据三张卡片生成等式字符串
 * 
 * 根据游戏规则将玩家选择的三张卡片组合成等式：
 * - 第1张卡片：只取数字（忽略运算符）
 * - 第2张卡片：取运算符 + 数字
 * - 第3张卡片：取运算符 + 数字
 * 
 * 例如：
 * - 卡片1: label="J", operator="+", number=7
 * - 卡片2: label="A", operator="-", number=10  
 * - 卡片3: label="B", operator="×", number=2
 * 生成等式：`7 - 10 × 2`
 * 
 * @param cards - 玩家选择的三张卡片（按选择顺序：[第1张, 第2张, 第3张]）
 * @returns {string} 生成的等式字符串，如 "7 - 10 × 2"
 */
export function generateEquation(cards: [Card, Card, Card]): string {
  const [firstCard, secondCard, thirdCard] = cards;
  
  // 第1张卡片：只取数字，忽略运算符
  const firstNumber = firstCard.number;
  
  // 第2张卡片：取运算符和数字
  const secondOperator = secondCard.operator;
  const secondNumber = secondCard.number;
  
  // 第3张卡片：取运算符和数字
  const thirdOperator = thirdCard.operator;
  const thirdNumber = thirdCard.number;
  
  // 组合成等式字符串，格式：数字 运算符 数字 运算符 数字
  return `${firstNumber} ${secondOperator} ${secondNumber} ${thirdOperator} ${thirdNumber}`;
}

/**
 * 根据三张卡片计算等式结果
 * 
 * 根据游戏规则从三张卡片计算最终结果：
 * 1. 第1张卡片：只取数字（忽略运算符）
 * 2. 第2张卡片：取运算符 + 数字
 * 3. 第3张卡片：取运算符 + 数字
 * 4. 按数学优先级计算：乘除(×÷)优先于加减(+-)
 * 
 * 例如：
 * - 卡片1: operator="+", number=7  (只取7)
 * - 卡片2: operator="-", number=10 (取"-10")
 * - 卡片3: operator="×", number=2  (取"×2")
 * - 计算: 7 - 10 × 2 = 7 - (10×2) = 7 - 20 = -13
 * 
 * @param cards - 三张卡片（按游戏规则顺序：[基础数字卡, 运算卡1, 运算卡2]）
 * @returns {number} 计算结果
 */
export function calculateFromCards(cards: [Card, Card, Card]): number {
  const [firstCard, secondCard, thirdCard] = cards;
  
  // 第1张卡片：只取数字，忽略运算符
  const firstNumber = firstCard.number;
  
  // 第2张卡片：取运算符和数字
  const secondOperator = secondCard.operator;
  const secondNumber = secondCard.number;
  
  // 第3张卡片：取运算符和数字
  const thirdOperator = thirdCard.operator;
  const thirdNumber = thirdCard.number;
  
  // 根据运算优先级计算结果
  // 乘除法(×÷)优先于加减法(+-)，同级运算从左到右
  
  // 判断运算符优先级
  const isSecondHighPriority = secondOperator === '×' || secondOperator === '÷';
  const isThirdHighPriority = thirdOperator === '×' || thirdOperator === '÷';
  
  // 如果第3个运算符是高优先级，而第2个是低优先级
  // 例如：5 + 10 × 2 = 5 + (10 × 2) = 5 + 20 = 25
  if (!isSecondHighPriority && isThirdHighPriority) {
    const rightResult = performOperation(secondNumber, thirdOperator, thirdNumber);
    return performOperation(firstNumber, secondOperator, rightResult);
  }
  
  // 其他所有情况都从左到右计算：
  // 1. 两个都是高优先级：20 ÷ 4 ÷ 1 = (20 ÷ 4) ÷ 1 = 5 ÷ 1 = 5
  // 2. 两个都是低优先级：10 + 5 - 3 = (10 + 5) - 3 = 15 - 3 = 12 
  // 3. 第2个是高优先级，第3个是低优先级：8 × 3 + 4 = (8 × 3) + 4 = 24 + 4 = 28
  const leftResult = performOperation(firstNumber, secondOperator, secondNumber);
  return performOperation(leftResult, thirdOperator, thirdNumber);
}

/**
 * 检查计算结果是否为整数
 * 
 * 由于游戏的目标数字总是整数，只有产生整数结果的卡片组合
 * 才可能是正确答案。此函数用于过滤掉产生小数的组合。
 * 
 * @param result - 计算结果
 * @returns {boolean} 如果结果是整数返回true，否则返回false
 */
export function isValidGameResult(result: number): boolean {
  return Number.isInteger(result);
}


/**
 * 验证卡片组合是否能形成有效等式
 * 
 * 检查三张卡片是否符合游戏规则：
 * - 所有卡片必须有效（包含数字和运算符）
 * - 数字必须在有效范围内（1-15，支持所有难度）
 * - 运算符必须是有效的（+, -, ×, ÷）
 * - 不会产生数学错误（如除零）
 * 
 * @param cards - 要验证的三张卡片（按游戏顺序）
 * @returns {boolean} 如果能形成有效等式返回true，否则返回false
 */
export function validateEquationFormat(cards: [Card, Card, Card]): boolean {
  // 检查每张卡片的基本有效性
  for (const card of cards) {
    // 检查卡片是否有必要的属性
    if (!card || typeof card !== 'object') {
      return false;
    }
    
    if (!card.id || !card.label || card.operator === undefined || card.number === undefined || card.position === undefined) {
      return false;
    }
    
    // 检查数字是否在有效范围内（1-15，支持所有难度）且为整数
    if (!Number.isInteger(card.number) || card.number < 1 || card.number > 15) {
      return false;
    }
    
    // 检查运算符是否有效
    const validOperators: Operator[] = ['+', '-', '×', '÷'];
    if (!validOperators.includes(card.operator)) {
      return false;
    }
  }
  
  // 检查可能的除零错误
  // 注意：第1张卡的运算符会被忽略，所以只检查第2、3张卡
  const [, secondCard, thirdCard] = cards;
  
  // 如果第2张或第3张卡的运算符是除法，且数字是0，会导致除零错误
  if ((secondCard.operator === '÷' && secondCard.number === 0) ||
      (thirdCard.operator === '÷' && thirdCard.number === 0)) {
    return false;
  }
  
  // 如果所有检查都通过，返回true
  return true;
}

/**
 * 执行单个数学运算
 * 
 * 根据运算符对两个数字进行计算
 * 这是`calculateFromCards`函数内部使用的基础工具函数
 * 
 * @param left - 左操作数
 * @param operator - 运算符（+, -, ×, ÷）
 * @param right - 右操作数
 * @returns {number} 运算结果
 * @throws {Error} 当除零时抛出异常
 */
export function performOperation(left: number, operator: Operator, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    
    case '-':
      return left - right;
    
    case '×':
      return left * right;
    
    case '÷':
      if (right === 0) {
        throw new Error('除数不能为零');
      }
      return left / right;
    
    default:
      // TypeScript 应该确保这里永远不会到达，但为了安全起见
      throw new Error(`不支持的运算符: ${operator}`);
  }
}

/**
 * 找出所有可能的等式组合
 * 
 * 给定一组卡片，找出所有可能的3张卡片排列组合
 * 注意：顺序很重要！[A,B,C] 和 [B,A,C] 会产生不同的等式
 * 
 * 例如：10张卡片可以产生 10×9×8 = 720种排列组合
 * 
 * @param cards - 所有可用的卡片
 * @returns {Array<{cards: [Card, Card, Card], result: number, equation: string}>} 
 *          所有可能的排列组合及其计算结果
 */
export function findAllPossibleEquations(
  cards: Card[]
): Array<{
  cards: [Card, Card, Card];
  result: number;
  equation: string;
}> {
  const results: Array<{
    cards: [Card, Card, Card];
    result: number;
    equation: string;
  }> = [];
  
  // 需要从n张卡片中选择3张进行排列
  // 使用三重循环生成所有可能的排列组合（P(n,3)）
  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (j === i) continue; // 跳过相同的卡片
      
      for (let k = 0; k < cards.length; k++) {
        if (k === i || k === j) continue; // 跳过已选择的卡片
        
        const selectedCards: [Card, Card, Card] = [cards[i]!, cards[j]!, cards[k]!];
        
        try {
          // 生成等式字符串
          const equation = generateEquation(selectedCards);
          
          // 计算结果
          const result = calculateFromCards(selectedCards);
          
          // 添加到结果数组
          results.push({
            cards: selectedCards,
            result,
            equation
          });
        } catch (error) {
          // 如果计算过程中出现错误（比如除零），跳过这个组合
          // 但不影响其他组合的生成
          continue;
        }
      }
    }
  }
  
  return results;
}

/**
 * 检查目标数字是否可达
 * 
 * 验证给定的卡片组合中是否存在至少一种方法达到目标数字
 * 
 * @param cards - 所有可用的卡片
 * @param targetNumber - 目标数字
 * @returns {boolean} 如果目标可达返回true，否则返回false
 */
export function isTargetReachable(cards: Card[], targetNumber: number): boolean {
  // 简单而高效的实现：利用已有的getSolutionsForTarget函数
  // 如果能找到至少一个解，则目标可达；否则不可达
  const solutions = getSolutionsForTarget(cards, targetNumber);
  return solutions.length > 0;
}

/**
 * 获取达到目标的所有解法
 * 
 * 找出所有能达到目标数字的卡片排列组合
 * 返回按字母顺序排序的解法，便于玩家查看
 * 
 * @param cards - 所有可用的卡片
 * @param targetNumber - 目标数字
 * @returns {Array<{cards: [Card, Card, Card], equation: string}>} 
 *          所有能达到目标的排列组合，包含等式字符串
 */
export function getSolutionsForTarget(
  cards: Card[], 
  targetNumber: number
): Array<{
  cards: [Card, Card, Card];
  equation: string;
}> {
  const solutions: Array<{
    cards: [Card, Card, Card];
    equation: string;
  }> = [];
  
  // 使用Set来跟踪已经找到的唯一数学等式
  const uniqueEquations = new Set<string>();
  
  // 使用三重循环生成所有可能的排列组合（P(n,3)）
  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (j === i) continue; // 跳过相同的卡片
      
      for (let k = 0; k < cards.length; k++) {
        if (k === i || k === j) continue; // 跳过已选择的卡片
        
        const selectedCards: [Card, Card, Card] = [cards[i]!, cards[j]!, cards[k]!];
        
        try {
          // 计算这个组合的结果
          const result = calculateFromCards(selectedCards);
          
          // 如果结果等于目标数字，检查是否是唯一的数学等式
          if (result === targetNumber) {
            // 生成等式字符串
            const equation = generateEquation(selectedCards);
            
            // 只有当这个等式还没有被找到过时，才添加到解答数组
            if (!uniqueEquations.has(equation)) {
              uniqueEquations.add(equation);
              solutions.push({
                cards: selectedCards,
                equation
              });
            }
          }
        } catch (error) {
          // 如果计算过程中出现错误（比如除零），跳过这个组合
          continue;
        }
      }
    }
  }
  
  return solutions;
}
