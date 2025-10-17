/**
 * 进度工具函数单元测试
 * 
 * 测试进度计算、格式化和状态检查功能
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCompletionPercentage,
  formatProgressText,
  createSolutionProgress,
  isGameCompleted,
  formatProgressPercentage,
  getProgressStatusText
} from '../progressUtils';

describe('progressUtils', () => {
  describe('calculateCompletionPercentage', () => {
    it('should return 0 when total solutions is 0', () => {
      expect(calculateCompletionPercentage(0, 0)).toBe(0);
      expect(calculateCompletionPercentage(5, 0)).toBe(0);
    });

    it('should return 0 when no solutions found', () => {
      expect(calculateCompletionPercentage(0, 10)).toBe(0);
    });

    it('should return 100 when all solutions found', () => {
      expect(calculateCompletionPercentage(10, 10)).toBe(100);
      expect(calculateCompletionPercentage(5, 5)).toBe(100);
    });

    it('should return 100 when found exceeds total', () => {
      expect(calculateCompletionPercentage(15, 10)).toBe(100);
    });

    it('should calculate correct percentage for partial completion', () => {
      expect(calculateCompletionPercentage(1, 4)).toBe(25);
      expect(calculateCompletionPercentage(3, 4)).toBe(75);
      expect(calculateCompletionPercentage(1, 3)).toBe(33); // 33.33... rounded to 33
      expect(calculateCompletionPercentage(2, 3)).toBe(67); // 66.66... rounded to 67
    });

    it('should handle edge cases with negative numbers', () => {
      expect(calculateCompletionPercentage(-1, 10)).toBe(0);
      expect(calculateCompletionPercentage(5, -1)).toBe(0);
    });
  });

  describe('formatProgressText', () => {
    it('should format text when total solutions is 0', () => {
      expect(formatProgressText(0, 0)).toBe('0 solutions found');
      expect(formatProgressText(3, 0)).toBe('3 solutions found');
    });

    it('should format text with total when total > 0', () => {
      expect(formatProgressText(0, 5)).toBe('0 of 5 solutions found');
      expect(formatProgressText(3, 5)).toBe('3 of 5 solutions found');
      expect(formatProgressText(5, 5)).toBe('5 of 5 solutions found');
    });

    it('should handle when found exceeds total', () => {
      expect(formatProgressText(7, 5)).toBe('7 of 5 solutions found');
    });
  });

  describe('createSolutionProgress', () => {
    it('should create progress object with correct values', () => {
      const progress = createSolutionProgress(3, 10);
      expect(progress).toEqual({
        current: 3,
        total: 10,
        percentage: 30
      });
    });

    it('should handle zero total solutions', () => {
      const progress = createSolutionProgress(0, 0);
      expect(progress).toEqual({
        current: 0,
        total: 0,
        percentage: 0
      });
    });

    it('should handle completion', () => {
      const progress = createSolutionProgress(5, 5);
      expect(progress).toEqual({
        current: 5,
        total: 5,
        percentage: 100
      });
    });
  });

  describe('isGameCompleted', () => {
    it('should return false when total solutions is 0', () => {
      expect(isGameCompleted(0, 0)).toBe(false);
      expect(isGameCompleted(5, 0)).toBe(false);
    });

    it('should return false when not all solutions found', () => {
      expect(isGameCompleted(0, 5)).toBe(false);
      expect(isGameCompleted(3, 5)).toBe(false);
      expect(isGameCompleted(4, 5)).toBe(false);
    });

    it('should return true when all solutions found', () => {
      expect(isGameCompleted(5, 5)).toBe(true);
      expect(isGameCompleted(1, 1)).toBe(true);
    });

    it('should return true when found exceeds total', () => {
      expect(isGameCompleted(7, 5)).toBe(true);
    });

    it('should handle negative numbers', () => {
      expect(isGameCompleted(-1, 5)).toBe(false);
      expect(isGameCompleted(5, -1)).toBe(false);
    });
  });

  describe('formatProgressPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatProgressPercentage(0, 4)).toBe('0%');
      expect(formatProgressPercentage(1, 4)).toBe('25%');
      expect(formatProgressPercentage(3, 4)).toBe('75%');
      expect(formatProgressPercentage(4, 4)).toBe('100%');
    });

    it('should handle zero total', () => {
      expect(formatProgressPercentage(0, 0)).toBe('0%');
      expect(formatProgressPercentage(5, 0)).toBe('0%');
    });

    it('should handle completion and over-completion', () => {
      expect(formatProgressPercentage(5, 5)).toBe('100%');
      expect(formatProgressPercentage(7, 5)).toBe('100%');
    });
  });

  describe('getProgressStatusText', () => {
    it('should return appropriate message for no solutions available', () => {
      expect(getProgressStatusText(0, 0)).toBe('No solutions available');
      expect(getProgressStatusText(5, 0)).toBe('No solutions available');
    });

    it('should return appropriate message for just starting', () => {
      expect(getProgressStatusText(0, 10)).toBe('Just getting started');
    });

    it('should return appropriate message for completion', () => {
      expect(getProgressStatusText(10, 10)).toBe('All solutions found!');
      expect(getProgressStatusText(15, 10)).toBe('All solutions found!');
    });

    it('should return appropriate messages for different progress levels', () => {
      // 25% - Making good progress
      expect(getProgressStatusText(1, 4)).toBe('Making good progress');
      expect(getProgressStatusText(2, 8)).toBe('Making good progress');
      
      // < 25% - Keep going!
      expect(getProgressStatusText(1, 10)).toBe('Keep going!');
      expect(getProgressStatusText(2, 10)).toBe('Keep going!');
      
      // 50% - Halfway there!
      expect(getProgressStatusText(5, 10)).toBe('Halfway there!');
      expect(getProgressStatusText(2, 4)).toBe('Halfway there!');
      
      // 75% - Almost there!
      expect(getProgressStatusText(3, 4)).toBe('Almost there!');
      expect(getProgressStatusText(8, 10)).toBe('Almost there!');
    });

    it('should handle edge cases around thresholds', () => {
      // Exactly 25%
      expect(getProgressStatusText(25, 100)).toBe('Making good progress');
      
      // Exactly 50%
      expect(getProgressStatusText(50, 100)).toBe('Halfway there!');
      
      // Exactly 75%
      expect(getProgressStatusText(75, 100)).toBe('Almost there!');
      
      // Just under thresholds
      expect(getProgressStatusText(24, 100)).toBe('Keep going!');
      expect(getProgressStatusText(49, 100)).toBe('Making good progress');
      expect(getProgressStatusText(74, 100)).toBe('Halfway there!');
    });
  });
});
