/**
 * 网格大小工具函数测试
 * 
 * 测试基于难度的固定网格大小功能
 */

import { describe, it, expect } from 'vitest';
import type { GameDifficulty } from '../../types/game';

// 从App.tsx中提取的函数，用于测试
const getGridSizeForDifficulty = (difficulty: GameDifficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 4;    // 4x4 = 16 cards
    case 'medium':
      return 5;    // 5x5 = 25 cards
    case 'hard':
      return 6;    // 6x6 = 36 cards
    default:
      return 5;
  }
};

describe('getGridSizeForDifficulty', () => {
  it('should return 4 for easy difficulty', () => {
    expect(getGridSizeForDifficulty('easy')).toBe(4);
  });

  it('should return 5 for medium difficulty', () => {
    expect(getGridSizeForDifficulty('medium')).toBe(5);
  });

  it('should return 6 for hard difficulty', () => {
    expect(getGridSizeForDifficulty('hard')).toBe(6);
  });

  it('should return 5 as default for unknown difficulty', () => {
    // @ts-expect-error - testing invalid input
    expect(getGridSizeForDifficulty('unknown')).toBe(5);
  });

  it('should provide correct card counts for each difficulty', () => {
    const easySize = getGridSizeForDifficulty('easy');
    const mediumSize = getGridSizeForDifficulty('medium');
    const hardSize = getGridSizeForDifficulty('hard');

    expect(easySize * easySize).toBe(16);    // 4x4 = 16 cards
    expect(mediumSize * mediumSize).toBe(25); // 5x5 = 25 cards
    expect(hardSize * hardSize).toBe(36);     // 6x6 = 36 cards
  });

  it('should have progressive difficulty with increasing grid sizes', () => {
    const easySize = getGridSizeForDifficulty('easy');
    const mediumSize = getGridSizeForDifficulty('medium');
    const hardSize = getGridSizeForDifficulty('hard');

    expect(easySize).toBeLessThan(mediumSize);
    expect(mediumSize).toBeLessThan(hardSize);
  });
});
