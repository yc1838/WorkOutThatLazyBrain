/**
 * 游戏完成流程集成测试
 * 
 * 测试完整的游戏完成流程，包括卡片禁用和新游戏重置功能
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
import { generateValidCardSet, generateTargetNumber } from '../gameLogic';
import { getSolutionsForTarget } from '../mathUtils';
import type { GameCompletionState, GameDifficulty, Card } from '../../types/game';

describe('Game Completion Flow Integration Tests', () => {
  describe('Complete game cycle from start to completion', () => {
    let cards: Card[];
    let targetNumber: number;
    let totalSolutions: number;
    let completionState: GameCompletionState;
    const difficulty: GameDifficulty = 'easy';

    beforeEach(() => {
      // Generate a valid game setup
      cards = generateValidCardSet(difficulty);
      targetNumber = generateTargetNumber(cards, difficulty);
      
      // Calculate total solutions
      const allSolutions = getSolutionsForTarget(cards, targetNumber);
      totalSolutions = allSolutions.length;
      
      // Initialize completion state
      completionState = createInitialCompletionState(totalSolutions);
    });

    it('should start with initial state and no card interactions disabled', () => {
      // Initial state should not be completed
      expect(completionState.isCompleted).toBe(false);
      expect(completionState.foundSolutions).toBe(0);
      expect(completionState.totalSolutions).toBe(totalSolutions);
      expect(shouldTriggerCelebration(completionState)).toBe(false);
      
      // Cards should be interactive (not disabled)
      const cardsDisabled = completionState.isCompleted;
      expect(cardsDisabled).toBe(false);
    });

    it('should progress through finding solutions without disabling cards', () => {
      // Simulate finding solutions one by one
      for (let i = 1; i < totalSolutions; i++) {
        completionState = updateCompletionState(completionState, i);
        
        // Should not be completed yet
        expect(completionState.isCompleted).toBe(false);
        expect(completionState.foundSolutions).toBe(i);
        expect(shouldTriggerCelebration(completionState)).toBe(false);
        
        // Cards should still be interactive
        const cardsDisabled = completionState.isCompleted;
        expect(cardsDisabled).toBe(false);
      }
    });

    it('should complete game and disable card interactions when all solutions found', () => {
      // Find all solutions
      completionState = updateCompletionState(completionState, totalSolutions);
      
      // Game should be completed
      expect(completionState.isCompleted).toBe(true);
      expect(completionState.foundSolutions).toBe(totalSolutions);
      expect(completionState.completionTime).toBeDefined();
      expect(shouldTriggerCelebration(completionState)).toBe(true);
      
      // Cards should be disabled
      const cardsDisabled = completionState.isCompleted;
      expect(cardsDisabled).toBe(true);
    });

    it('should maintain completion state and card disabling after completion', () => {
      // Complete the game
      completionState = updateCompletionState(completionState, totalSolutions);
      const completionTime = completionState.completionTime;
      
      // Try to update again (simulate additional solution attempts)
      const updatedState = updateCompletionState(completionState, totalSolutions + 1);
      
      // Should remain completed with same completion time
      expect(updatedState.isCompleted).toBe(true);
      expect(updatedState.completionTime).toBe(completionTime);
      expect(shouldTriggerCelebration(updatedState)).toBe(true);
      
      // Cards should remain disabled
      const cardsDisabled = updatedState.isCompleted;
      expect(cardsDisabled).toBe(true);
    });
  });

  describe('New game reset functionality', () => {
    let completedState: GameCompletionState;

    beforeEach(() => {
      // Create a completed game state
      completedState = createInitialCompletionState(5);
      completedState = updateCompletionState(completedState, 5);
      expect(completedState.isCompleted).toBe(true);
    });

    it('should reset completion state when starting new game', () => {
      const newTotalSolutions = 8;
      
      // Reset for new game
      const newState = resetCompletionState(newTotalSolutions);
      
      // Should be reset to initial state
      expect(newState.isCompleted).toBe(false);
      expect(newState.foundSolutions).toBe(0);
      expect(newState.totalSolutions).toBe(newTotalSolutions);
      expect(newState.completionTime).toBeUndefined();
      expect(shouldTriggerCelebration(newState)).toBe(false);
      
      // Cards should be interactive again
      const cardsDisabled = newState.isCompleted;
      expect(cardsDisabled).toBe(false);
    });

    it('should allow normal progression in new game after reset', () => {
      const newTotalSolutions = 3;
      let newState = resetCompletionState(newTotalSolutions);
      
      // Should be able to progress normally
      newState = updateCompletionState(newState, 1);
      expect(newState.isCompleted).toBe(false);
      expect(newState.foundSolutions).toBe(1);
      
      newState = updateCompletionState(newState, 2);
      expect(newState.isCompleted).toBe(false);
      expect(newState.foundSolutions).toBe(2);
      
      // Complete new game
      newState = updateCompletionState(newState, 3);
      expect(newState.isCompleted).toBe(true);
      expect(newState.foundSolutions).toBe(3);
      expect(newState.completionTime).toBeDefined();
      
      // Cards should be disabled again
      const cardsDisabled = newState.isCompleted;
      expect(cardsDisabled).toBe(true);
    });

    it('should handle multiple game resets correctly', () => {
      let state = completedState;
      
      // Reset multiple times with different solution counts
      const solutionCounts = [3, 7, 2, 10];
      
      for (const count of solutionCounts) {
        state = resetCompletionState(count);
        
        expect(state.isCompleted).toBe(false);
        expect(state.foundSolutions).toBe(0);
        expect(state.totalSolutions).toBe(count);
        expect(state.completionTime).toBeUndefined();
        
        // Cards should be interactive
        const cardsDisabled = state.isCompleted;
        expect(cardsDisabled).toBe(false);
      }
    });
  });

  describe('Card interaction state management', () => {
    it('should correctly determine card interaction state based on completion', () => {
      let state = createInitialCompletionState(3);
      
      // Initially cards should be interactive
      expect(state.isCompleted).toBe(false);
      let canInteract = !state.isCompleted;
      expect(canInteract).toBe(true);
      
      // Progress without completion
      state = updateCompletionState(state, 2);
      expect(state.isCompleted).toBe(false);
      canInteract = !state.isCompleted;
      expect(canInteract).toBe(true);
      
      // Complete game
      state = updateCompletionState(state, 3);
      expect(state.isCompleted).toBe(true);
      canInteract = !state.isCompleted;
      expect(canInteract).toBe(false);
    });

    it('should handle edge cases for card interaction state', () => {
      // Game with no solutions
      let state = createInitialCompletionState(0);
      expect(state.isCompleted).toBe(false);
      let canInteract = !state.isCompleted;
      expect(canInteract).toBe(true);
      
      // Game with single solution
      state = createInitialCompletionState(1);
      expect(state.isCompleted).toBe(false);
      canInteract = !state.isCompleted;
      expect(canInteract).toBe(true);
      
      // Complete single solution game
      state = updateCompletionState(state, 1);
      expect(state.isCompleted).toBe(true);
      canInteract = !state.isCompleted;
      expect(canInteract).toBe(false);
    });
  });

  describe('Game statistics and completion celebration', () => {
    it('should provide correct completion statistics throughout game cycle', () => {
      const startTime = Date.now() - 10000; // 10 seconds ago
      let state = createInitialCompletionState(4);
      
      // Initial stats
      let stats = getCompletionStats(state, startTime);
      expect(stats.totalSolutions).toBe(4);
      expect(stats.foundSolutions).toBe(0);
      expect(stats.isCompleted).toBe(false);
      expect(stats.gameDuration).toBeUndefined();
      
      // Progress stats
      state = updateCompletionState(state, 2);
      stats = getCompletionStats(state, startTime);
      expect(stats.foundSolutions).toBe(2);
      expect(stats.isCompleted).toBe(false);
      expect(stats.gameDuration).toBeUndefined();
      
      // Completion stats
      state = updateCompletionState(state, 4);
      stats = getCompletionStats(state, startTime);
      expect(stats.foundSolutions).toBe(4);
      expect(stats.isCompleted).toBe(true);
      expect(stats.completionTime).toBeDefined();
      expect(stats.gameDuration).toBeDefined();
      expect(stats.gameDuration).toBeGreaterThan(0);
    });

    it('should trigger celebration only when appropriate', () => {
      let state = createInitialCompletionState(2);
      
      // No celebration initially
      expect(shouldTriggerCelebration(state)).toBe(false);
      
      // No celebration during progress
      state = updateCompletionState(state, 1);
      expect(shouldTriggerCelebration(state)).toBe(false);
      
      // Celebration on completion
      state = updateCompletionState(state, 2);
      expect(shouldTriggerCelebration(state)).toBe(true);
      
      // Celebration should persist
      expect(shouldTriggerCelebration(state)).toBe(true);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle invalid solution counts gracefully', () => {
      let state = createInitialCompletionState(5);
      
      // Negative found solutions
      state = updateCompletionState(state, -1);
      expect(detectGameCompletion(state.foundSolutions, state.totalSolutions)).toBe(false);
      expect(state.isCompleted).toBe(false);
      
      // Excessive found solutions
      state = updateCompletionState(state, 100);
      expect(state.isCompleted).toBe(true);
      expect(shouldTriggerCelebration(state)).toBe(true);
    });

    it('should handle zero total solutions correctly', () => {
      let state = createInitialCompletionState(0);
      expect(state.totalSolutions).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(shouldTriggerCelebration(state)).toBe(false);
      
      // Even if we somehow find solutions, celebration should not trigger
      state = updateCompletionState(state, 1);
      expect(shouldTriggerCelebration(state)).toBe(false);
    });

    it('should maintain state consistency during rapid updates', () => {
      let state = createInitialCompletionState(10);
      
      // Rapid sequential updates
      for (let i = 1; i <= 10; i++) {
        state = updateCompletionState(state, i);
        expect(state.foundSolutions).toBe(i);
        expect(state.totalSolutions).toBe(10);
        
        if (i < 10) {
          expect(state.isCompleted).toBe(false);
        } else {
          expect(state.isCompleted).toBe(true);
          expect(state.completionTime).toBeDefined();
        }
      }
    });
  });
});
