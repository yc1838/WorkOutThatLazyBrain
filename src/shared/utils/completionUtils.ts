/**
 * 游戏完成检测工具函数
 * 
 * 这个文件包含与游戏完成状态检测相关的函数
 * 用于检测游戏是否完成并管理完成状态
 */

import type { GameCompletionState } from '../types/game';

/**
 * 检测游戏是否完成
 * 
 * 根据已找到的解法数量和总解法数量判断游戏是否完成
 * 
 * @param foundSolutions - 已找到的解法数量
 * @param totalSolutions - 总解法数量
 * @returns {boolean} 如果游戏完成返回true，否则返回false
 */
export function detectGameCompletion(foundSolutions: number, totalSolutions: number): boolean {
  // 确保参数有效
  if (totalSolutions <= 0 || foundSolutions < 0) {
    return false;
  }
  
  // 当找到的解法数量等于或超过总解法数量时，游戏完成
  return foundSolutions >= totalSolutions;
}

/**
 * 更新游戏完成状态
 * 
 * 根据当前找到的解法数量更新完成状态，如果检测到完成则触发完成状态
 * 
 * @param currentState - 当前的游戏完成状态
 * @param newFoundSolutions - 新的已找到解法数量
 * @returns {GameCompletionState} 更新后的完成状态
 */
export function updateCompletionState(
  currentState: GameCompletionState, 
  newFoundSolutions: number
): GameCompletionState {
  // 检查是否完成
  const isCompleted = detectGameCompletion(newFoundSolutions, currentState.totalSolutions);
  
  // 创建新的状态对象
  const updatedState: GameCompletionState = {
    ...currentState,
    foundSolutions: newFoundSolutions,
    isCompleted
  };
  
  // 如果刚刚完成（之前未完成，现在完成了），记录完成时间
  if (isCompleted && !currentState.isCompleted) {
    updatedState.completionTime = Date.now();
  }
  
  return updatedState;
}

/**
 * 创建初始完成状态
 * 
 * 为新游戏创建初始的完成状态
 * 
 * @param totalSolutions - 总解法数量
 * @returns {GameCompletionState} 初始完成状态
 */
export function createInitialCompletionState(totalSolutions: number): GameCompletionState {
  return {
    totalSolutions,
    foundSolutions: 0,
    isCompleted: false
  };
}

/**
 * 重置完成状态
 * 
 * 为新游戏重置完成状态，保留总解法数量但清除其他状态
 * 
 * @param totalSolutions - 新游戏的总解法数量
 * @returns {GameCompletionState} 重置后的完成状态
 */
export function resetCompletionState(totalSolutions: number): GameCompletionState {
  return createInitialCompletionState(totalSolutions);
}

/**
 * 检查是否应该触发完成庆祝
 * 
 * 判断是否应该显示完成庆祝界面
 * 
 * @param completionState - 当前完成状态
 * @returns {boolean} 如果应该显示庆祝返回true
 */
export function shouldTriggerCelebration(completionState: GameCompletionState): boolean {
  return completionState.isCompleted && completionState.totalSolutions > 0;
}

/**
 * 获取完成统计信息
 * 
 * 获取用于显示的完成统计信息
 * 
 * @param completionState - 完成状态
 * @param startTime - 游戏开始时间（可选）
 * @returns 完成统计信息对象
 */
export function getCompletionStats(
  completionState: GameCompletionState, 
  startTime?: number
): {
  totalSolutions: number;
  foundSolutions: number;
  completionTime?: number;
  gameDuration?: number;
  isCompleted: boolean;
} {
  const stats = {
    totalSolutions: completionState.totalSolutions,
    foundSolutions: completionState.foundSolutions,
    completionTime: completionState.completionTime,
    isCompleted: completionState.isCompleted
  };
  
  // 如果有开始时间和完成时间，计算游戏持续时间
  if (startTime && completionState.completionTime) {
    return {
      ...stats,
      gameDuration: completionState.completionTime - startTime
    };
  }
  
  return stats;
}
