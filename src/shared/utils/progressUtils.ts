/**
 * 游戏进度跟踪工具函数
 * 
 * 这个文件包含与游戏完成进度相关的计算和格式化函数
 * 用于跟踪玩家找到的解法数量和显示进度信息
 */

import type { SolutionProgress } from '../types/game';

/**
 * 计算完成百分比
 * 
 * 根据已找到的解法数量和总解法数量计算完成百分比
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {number} 完成百分比（0-100），如果总数为0则返回0
 */
export function calculateCompletionPercentage(foundSolutions: number, totalSolutions: number): number {
  if (totalSolutions <= 0 || foundSolutions < 0) {
    return 0;
  }
  
  if (foundSolutions >= totalSolutions) {
    return 100;
  }
  
  return Math.round((foundSolutions / totalSolutions) * 100);
}

/**
 * 格式化进度文本
 * 
 * 生成用于显示的进度文本，格式为 "X of Y solutions found"
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {string} 格式化的进度文本
 */
export function formatProgressText(foundSolutions: number, totalSolutions: number): string {
  if (totalSolutions <= 0) {
    return `${foundSolutions} solutions found`;
  }
  
  return `${foundSolutions} of ${totalSolutions} solutions found`;
}

/**
 * 创建解法进度对象
 * 
 * 根据当前状态创建包含所有进度信息的对象
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {SolutionProgress} 包含当前进度、总数和百分比的对象
 */
export function createSolutionProgress(foundSolutions: number, totalSolutions: number): SolutionProgress {
  return {
    current: foundSolutions,
    total: totalSolutions,
    percentage: calculateCompletionPercentage(foundSolutions, totalSolutions)
  };
}

/**
 * 检查游戏是否完成
 * 
 * 判断玩家是否已经找到所有可能的解法
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {boolean} 如果游戏完成返回true，否则返回false
 */
export function isGameCompleted(foundSolutions: number, totalSolutions: number): boolean {
  return totalSolutions > 0 && foundSolutions >= totalSolutions;
}

/**
 * 格式化进度百分比文本
 * 
 * 生成百分比显示文本，如 "75%" 或 "100%"
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {string} 格式化的百分比文本
 */
export function formatProgressPercentage(foundSolutions: number, totalSolutions: number): string {
  const percentage = calculateCompletionPercentage(foundSolutions, totalSolutions);
  return `${percentage}%`;
}

/**
 * 获取进度状态描述
 * 
 * 根据当前进度返回描述性文本
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {string} 进度状态描述
 */
export function getProgressStatusText(foundSolutions: number, totalSolutions: number): string {
  if (totalSolutions <= 0) {
    return 'No solutions available';
  }
  
  if (foundSolutions === 0) {
    return 'Just getting started';
  }
  
  const percentage = calculateCompletionPercentage(foundSolutions, totalSolutions);
  
  if (percentage === 100) {
    return 'All solutions found!';
  } else if (percentage >= 75) {
    return 'Almost there!';
  } else if (percentage >= 50) {
    return 'Halfway there!';
  } else if (percentage >= 25) {
    return 'Making good progress';
  } else {
    return 'Keep going!';
  }
}
