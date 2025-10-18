/**
 * 游戏完成检测工具函数测试
 * 
 * 测试完成状态检测、状态更新和相关功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectGameCompletion,
  updateCompletionState,
  createInitialCompletionState,
  resetCompletionState,
  shouldTriggerCelebration,
  getCompletionStats
} from '../completionUtils';
import type { GameCompletionState } from '../../types/game';

describe('completionUtils', () => {
  describe('detectGameCompletion', () => {
    it('should return true when found solutions equal total solutions', () => {
      expect(detectGameCompletion(5, 5)).toBe(true);
    });

    it('should return true when found solutions exceed total solutions', () => {
      expect(detectGameCompletion(7, 5)).toBe(true);
    });

    it('should return false when found solutions are less than total solutions', () => {
      expect(detectGameCompletion(3, 5)).toBe(false);
    });

    it('should return false when total solutions is zero', () => {
      expect(detectGameCompletion(1, 0)).toBe(false);
    });

    it('should return false when total solutions is negative', () => {
      expect(detectGameCompletion(1, -1)).toBe(false);
    });

    it('should return false when found solutions is negative', () => {
      expect(detectGameCompletion(-1, 5)).toBe(false);
    });

    it('should handle edge case of zero found solutions', () => {
      expect(detectGameCompletion(0, 5)).toBe(false);
      expect(detectGameCompletion(0, 0)).toBe(false);
    });
  });

  describe('updateCompletionState', () => {
    let initialState: GameCompletionState;

    beforeEach(() => {
      initialState = {
        totalSolutions: 5,
        foundSolutions: 2,
        isCompleted: false
      };
    });

    it('should update found solutions count', () => {
      const result = updateCompletionState(initialState, 3);
      expect(result.foundSolutions).toBe(3);
      expect(result.totalSolutions).toBe(5);
      expect(result.isCompleted).toBe(false);
    });

    it('should mark as completed when found solutions equal total', () => {
      const result = updateCompletionState(initialState, 5);
      expect(result.foundSolutions).toBe(5);
      expect(result.isCompleted).toBe(true);
      expect(result.completionTime).toBeDefined();
      expect(typeof result.completionTime).toBe('number');
    });

    it('should mark as completed when found solutions exceed total', () => {
      const result = updateCompletionState(initialState, 7);
      expect(result.foundSolutions).toBe(7);
      expect(result.isCompleted).toBe(true);
      expect(result.completionTime).toBeDefined();
    });

    it('should not update completion time if already completed', () => {
      const completedState: GameCompletionState = {
        totalSolutions: 5,
        foundSolutions: 5,
        isCompleted: true,
        completionTime: 1000
      };

      const result = updateCompletionState(completedState, 6);
      expect(result.completionTime).toBe(1000); // Should remain unchanged
    });

    it('should preserve other state properties', () => {
      const result = updateCompletionState(initialState, 3);
      expect(result.totalSolutions).toBe(initialState.totalSolutions);
    });
  });

  describe('createInitialCompletionState', () => {
    it('should create initial state with correct total solutions', () => {
      const result = createInitialCompletionState(8);
      expect(result).toEqual({
        totalSolutions: 8,
        foundSolutions: 0,
        isCompleted: false
      });
    });

    it('should handle zero total solutions', () => {
      const result = createInitialCompletionState(0);
      expect(result).toEqual({
        totalSolutions: 0,
        foundSolutions: 0,
        isCompleted: false
      });
    });
  });

  describe('resetCompletionState', () => {
    it('should reset state with new total solutions', () => {
      const result = resetCompletionState(10);
      expect(result).toEqual({
        totalSolutions: 10,
        foundSolutions: 0,
        isCompleted: false
      });
    });

    it('should create clean state regardless of previous state', () => {
      const result = resetCompletionState(3);
      expect(result.foundSolutions).toBe(0);
      expect(result.isCompleted).toBe(false);
      expect(result.completionTime).toBeUndefined();
    });
  });

  describe('shouldTriggerCelebration', () => {
    it('should return true for completed game with solutions', () => {
      const state: GameCompletionState = {
        totalSolutions: 5,
        foundSolutions: 5,
        isCompleted: true
      };
      expect(shouldTriggerCelebration(state)).toBe(true);
    });

    it('should return false for incomplete game', () => {
      const state: GameCompletionState = {
        totalSolutions: 5,
        foundSolutions: 3,
        isCompleted: false
      };
      expect(shouldTriggerCelebration(state)).toBe(false);
    });

    it('should return false for completed game with zero total solutions', () => {
      const state: GameCompletionState = {
        totalSolutions: 0,
        foundSolutions: 0,
        isCompleted: true
      };
      expect(shouldTriggerCelebration(state)).toBe(false);
    });

    it('should return false for completed game with negative total solutions', () => {
      const state: GameCompletionState = {
        totalSolutions: -1,
        foundSolutions: 0,
        isCompleted: true
      };
      expect(shouldTriggerCelebration(state)).toBe(false);
    });
  });

  describe('getCompletionStats', () => {
    const mockCompletionState: GameCompletionState = {
      totalSolutions: 8,
      foundSolutions: 6,
      isCompleted: false,
      completionTime: 5000
    };

    it('should return basic completion stats', () => {
      const result = getCompletionStats(mockCompletionState);
      expect(result).toEqual({
        totalSolutions: 8,
        foundSolutions: 6,
        completionTime: 5000,
        isCompleted: false
      });
    });

    it('should calculate game duration when start time provided', () => {
      const startTime = 2000;
      const result = getCompletionStats(mockCompletionState, startTime);
      expect(result.gameDuration).toBe(3000); // 5000 - 2000
    });

    it('should not calculate duration without completion time', () => {
      const stateWithoutCompletion: GameCompletionState = {
        totalSolutions: 5,
        foundSolutions: 3,
        isCompleted: false
      };
      const result = getCompletionStats(stateWithoutCompletion, 1000);
      expect(result.gameDuration).toBeUndefined();
    });

    it('should not calculate duration without start time', () => {
      const result = getCompletionStats(mockCompletionState);
      expect(result.gameDuration).toBeUndefined();
    });

    it('should handle completed state correctly', () => {
      const completedState: GameCompletionState = {
        totalSolutions: 5,
        foundSolutions: 5,
        isCompleted: true,
        completionTime: 10000
      };
      const result = getCompletionStats(completedState, 5000);
      expect(result.isCompleted).toBe(true);
      expect(result.gameDuration).toBe(5000);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete game flow', () => {
      // Start with initial state
      let state = createInitialCompletionState(3);
      expect(state.foundSolutions).toBe(0);
      expect(state.isCompleted).toBe(false);

      // Find first solution
      state = updateCompletionState(state, 1);
      expect(state.foundSolutions).toBe(1);
      expect(state.isCompleted).toBe(false);
      expect(shouldTriggerCelebration(state)).toBe(false);

      // Find second solution
      state = updateCompletionState(state, 2);
      expect(state.foundSolutions).toBe(2);
      expect(state.isCompleted).toBe(false);
      expect(shouldTriggerCelebration(state)).toBe(false);

      // Find final solution - should complete
      state = updateCompletionState(state, 3);
      expect(state.foundSolutions).toBe(3);
      expect(state.isCompleted).toBe(true);
      expect(state.completionTime).toBeDefined();
      expect(shouldTriggerCelebration(state)).toBe(true);
    });

    it('should handle game reset after completion', () => {
      // Complete a game
      let state = createInitialCompletionState(2);
      state = updateCompletionState(state, 2);
      expect(state.isCompleted).toBe(true);

      // Reset for new game
      state = resetCompletionState(5);
      expect(state.foundSolutions).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(state.totalSolutions).toBe(5);
      expect(state.completionTime).toBeUndefined();
    });
  });
});
