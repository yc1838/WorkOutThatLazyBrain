/**
 * 数学金字塔游戏 - 游戏逻辑工具函数
 * 
 * 这个文件包含游戏的核心逻辑函数，比如卡片生成、等式验证等
 * 所有函数都是纯函数，便于测试和调试
 */

import { Card, Operator, GameDifficulty, DifficultyConfig } from '../types/game';
import { 
  findAllPossibleEquations, 
  getSolutionsForTarget, 
  isValidGameResult 
} from './mathUtils';

// ===== 难度配置相关函数 =====

/**
 * 获取默认难度配置映射
 */
export function getDefaultDifficultyConfigs(): Record<GameDifficulty, DifficultyConfig> {
  return {
    easy: {
      minNumber: 1,
      maxNumber: 10,        // 简单：1-10
      operatorWeights: {
        '+': 0.4,
        '-': 0.3,           // 减少减法，避免负数
        '×': 0.2,
        '÷': 0.1
      },
      targetRange: {
        min: 1,             // 只允许正数
        max: 50
      }
    },
    medium: {
      minNumber: 1,
      maxNumber: 12,        // 中等：1-12，包含稍大数字
      operatorWeights: {
        '+': 0.35,
        '-': 0.25,
        '×': 0.25,
        '÷': 0.15
      },
      targetRange: {
        min: 1,             // 只允许正数
        max: 100
      }
    },
    hard: {
      minNumber: 1,
      maxNumber: 15,        // 困难：1-15，包含13, 15等大数字
      operatorWeights: {
        '+': 0.3,
        '-': 0.2,
        '×': 0.3,
        '÷': 0.2
      },
      targetRange: {
        min: 1,             // 只允许正数
        max: 200
      }
    }
  };
}

/**
 * 获取指定难度的配置信息
 * 
 * 根据难度等级返回相应的游戏参数配置
 * 
 * @param difficulty - 游戏难度等级
 * @returns {DifficultyConfig} 对应难度的配置信息
 */
export function getDifficultyConfig(difficulty: GameDifficulty): DifficultyConfig {
  const configs = getDefaultDifficultyConfigs();
  return configs[difficulty];
}



// ===== 卡片生成相关函数 =====

/**
 * 生成游戏所需的10张卡片
 * 
 * 根据指定难度生成10张卡片，每张卡片包含：
 * - 一个字母标识（A到J）
 * - 一个随机的运算符（根据难度权重分配）
 * - 一个随机的数字（根据难度范围：easy=1-10, medium=1-12, hard=1-15）
 * - 在金字塔中的位置（0到9）
 * 
 * @param difficulty - 游戏难度等级，影响数字范围和运算符分布
 * @returns {Card[]} 包含10张卡片的数组，按金字塔位置排序
 */
export function generateCards(difficulty: GameDifficulty): Card[] {
  const cards: Card[] = [];
  
  for (let i = 0; i < 10; i++) {
    const label = generateCardLabel(i);
    const operator = generateRandomOperator(difficulty);
    const number = generateRandomNumber(difficulty);
    
    cards.push({
      id: `card-${label}`,
      label,
      operator,
      number,
      position: i
    });
  }
  
  return cards;
}

/**
 * 生成一个随机的运算符
 * 
 * 根据难度配置的权重随机选择运算符
 * 简单模式更倾向于+和-，困难模式所有运算符均衡分布
 * 
 * @param difficulty - 游戏难度等级，影响运算符的选择权重
 * @returns {Operator} 根据权重随机选择的运算符
 */
export function generateRandomOperator(difficulty: GameDifficulty): Operator {
  const config = getDifficultyConfig(difficulty);
  const weights = config.operatorWeights;
  
  // 创建加权数组
  const operators: Operator[] = [];
  const entries = Object.entries(weights) as [Operator, number][];
  
  entries.forEach(([operator, weight]) => {
    const count = Math.round(weight * 100); // 转换为整数权重
    for (let i = 0; i < count; i++) {
      operators.push(operator);
    }
  });
  
  // 随机选择
  const randomIndex = Math.floor(Math.random() * operators.length);
  return operators[randomIndex]!;
}

/**
 * 生成一个随机的数字
 * 
 * 根据难度等级生成指定范围内的随机整数
 * - easy: 1-10
 * - medium: 1-12  
 * - hard: 1-15
 * 
 * @param difficulty - 游戏难度等级，决定数字范围
 * @returns {number} 指定范围内的随机数字（不包含0）
 */
export function generateRandomNumber(difficulty: GameDifficulty): number {
  const config = getDifficultyConfig(difficulty);
  const min = config.minNumber;
  const max = config.maxNumber;
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 根据位置生成卡片标识字母
 * 
 * 将位置索引（0-9）转换为对应的字母标识（A-J）
 * 
 * @param position - 卡片在金字塔中的位置（0-9）
 * @returns {string} 对应的字母标识（A-J）
 */
export function generateCardLabel(position: number): string {
  return String.fromCharCode(65 + position); // A=65, B=66, ..., J=74
}

/**
 * 生成一个合适的目标数字
 * 
 * 根据生成的卡片内容和难度等级，计算出一个合理的目标数字
 * 确保至少有一种可能的解法（即至少有一组3张卡片能达到这个目标）
 * 不同难度有不同的目标数字范围
 * 
 * @param cards - 已生成的10张卡片
 * @param difficulty - 游戏难度等级，影响目标数字的范围
 * @returns {number} 合适的目标数字
 */
export function generateTargetNumber(cards: Card[], difficulty: GameDifficulty): number {
  const config = getDifficultyConfig(difficulty);
  
  // 1. 找出所有可能的结果
  const allEquations = findAllPossibleEquations(cards);
  const allResults = allEquations.map(eq => eq.result);
  
  // 2. 只选择正整数结果
  const positiveIntegerResults = allResults.filter(r => 
    isValidGameResult(r) && r > 0
  );
  
  if (positiveIntegerResults.length === 0) {
    throw new Error('无法找到有效的正整数结果');
  }
  
  // 3. 按结果分组，计算每个结果的解法数量
  const resultCounts = new Map<number, number>();
  positiveIntegerResults.forEach(result => {
    resultCounts.set(result, (resultCounts.get(result) || 0) + 1);
  });
  
  // 4. 选择在目标范围内的结果
  const validTargets = Array.from(resultCounts.entries())
    .filter(([result]) => {
      return result >= config.targetRange.min && result <= config.targetRange.max;
    })
    .map(([result]) => result);
  
  if (validTargets.length === 0) {
    // 如果没有在范围内的目标，选择任何正整数结果
    const fallbackTargets = Array.from(resultCounts.keys()).filter(result => result > 0);
    
    if (fallbackTargets.length === 0) {
      throw new Error('无法找到合适的正整数目标');
    }
    
    // 随机选择一个备选目标
    return fallbackTargets[Math.floor(Math.random() * fallbackTargets.length)]!;
  }
  
  // 5. 随机选择一个合适的目标
  return validTargets[Math.floor(Math.random() * validTargets.length)]!;
}

/**
 * 验证卡片组合是否有效
 * 
 * 检查生成的卡片是否满足游戏要求：
 * - 确保有足够的数字和运算符多样性
 * - 确保至少存在一种可能的解法
 * - 验证卡片符合当前难度的要求
 * 
 * @param cards - 要验证的卡片数组
 * @param difficulty - 游戏难度等级
 * @returns {boolean} 如果卡片组合有效返回true，否则返回false
 */
export function validateCardSet(cards: Card[], difficulty: GameDifficulty): boolean {
  const config = getDifficultyConfig(difficulty);
  
  // 1. 检查卡片数量
  if (cards.length !== 10) {
    return false;
  }
  
  // 2. 检查每张卡片的有效性
  for (const card of cards) {
    // 检查数字范围
    if (card.number < config.minNumber || card.number > config.maxNumber) {
      return false;
    }
    
    // 检查运算符有效性
    if (!['+', '-', '×', '÷'].includes(card.operator)) {
      return false;
    }
    
    // 检查除零风险（第2、3张卡可能被用作除数）
    if (card.operator === '÷' && card.number === 0) {
      return false;
    }
  }
  
  // 3. 检查是否至少有一个有效的正整数结果
  try {
    const allEquations = findAllPossibleEquations(cards);
    const positiveIntegerResults = allEquations
      .map(eq => eq.result)
      .filter(result => isValidGameResult(result) && result > 0);
    
    return positiveIntegerResults.length > 0;
  } catch (error) {
    // 如果计算过程中出现错误，认为卡片组合无效
    return false;
  }
}

/**
 * 重新生成卡片直到获得有效组合
 * 
 * 如果第一次生成的卡片组合无效（比如没有可能的解法），
 * 会重新生成直到获得一个有效的组合
 * 
 * @param difficulty - 游戏难度等级
 * @param maxAttempts - 最大尝试次数，防止无限循环（默认100次）
 * @returns {Card[]} 有效的卡片组合
 * @throws {Error} 如果超过最大尝试次数仍无法生成有效组合
 */
export function generateValidCardSet(difficulty: GameDifficulty, maxAttempts: number = 100): Card[] {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const cards = generateCards(difficulty);
    
    if (validateCardSet(cards, difficulty)) {
      return cards;
    }
  }
  
  throw new Error(`无法在 ${maxAttempts} 次尝试内生成有效的卡片组合`);
}

// ===== 游戏完成相关函数 =====

/**
 * 计算指定目标数字的总解法数量
 * 
 * 使用现有的getSolutionsForTarget函数计算给定卡片组合和目标数字的所有可能解法
 * 如果无法计算或出现错误，返回0
 * 
 * @param cards - 当前游戏的卡片组合
 * @param targetNumber - 目标数字
 * @returns {number} 总解法数量，如果出错则返回0
 */
export function calculateTotalSolutions(cards: Card[], targetNumber: number): number {
  try {
    const solutions = getSolutionsForTarget(cards, targetNumber);
    
    if (solutions.length === 0) {
      console.warn('No valid solutions found for target:', targetNumber);
      return 0;
    }
    
    return solutions.length;
  } catch (error) {
    console.error('Failed to calculate total solutions:', error);
    return 0;
  }
}

/**
 * 生成有效的游戏配置（卡片+目标数字）
 * 
 * 确保生成的游戏至少有一个有效解法，如果没有则重新生成
 * 
 * @param difficulty - 游戏难度等级
 * @param maxAttempts - 最大尝试次数，防止无限循环（默认10次）
 * @returns {Promise<{cards: Card[], targetNumber: number, totalSolutions: number}>} 有效的游戏配置
 * @throws {Error} 如果超过最大尝试次数仍无法生成有效配置
 */
export async function generateValidGameConfiguration(
  difficulty: GameDifficulty, 
  maxAttempts: number = 10
): Promise<{
  cards: Card[];
  targetNumber: number;
  totalSolutions: number;
}> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // 生成有效的卡片组合
      const cards = generateValidCardSet(difficulty);
      
      // 生成目标数字
      const targetNumber = generateTargetNumber(cards, difficulty);
      
      // 计算总解法数量
      const totalSolutions = calculateTotalSolutions(cards, targetNumber);
      
      // 检查是否有有效解法
      if (totalSolutions > 0) {
        console.log(`Generated valid game configuration: ${totalSolutions} solutions for target ${targetNumber}`);
        return {
          cards,
          targetNumber,
          totalSolutions
        };
      }
      
      console.warn(`Attempt ${attempt + 1}: Generated game has no solutions, retrying...`);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }
  }
  
  throw new Error(`Failed to generate valid game configuration after ${maxAttempts} attempts`);
}

/**
 * 验证游戏配置是否有效
 * 
 * 检查给定的卡片组合和目标数字是否能形成有效的游戏
 * 
 * @param cards - 卡片组合
 * @param targetNumber - 目标数字
 * @returns {boolean} 如果配置有效返回true，否则返回false
 */
export function validateGameConfiguration(cards: Card[], targetNumber: number): boolean {
  try {
    // 检查卡片组合是否有效
    if (!cards || cards.length !== 10) {
      return false;
    }
    
    // 检查目标数字是否有效
    if (!Number.isInteger(targetNumber) || targetNumber <= 0) {
      return false;
    }
    
    // 检查是否至少有一个解法
    const totalSolutions = calculateTotalSolutions(cards, targetNumber);
    return totalSolutions > 0;
  } catch (error) {
    console.error('Error validating game configuration:', error);
    return false;
  }
}
