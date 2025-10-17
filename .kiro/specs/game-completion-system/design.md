# Design Document

## Overview

The game completion system enhances the Reddit Devvit math game by adding progress tracking and completion celebration features. The system will calculate the total number of possible solutions for each game, display progress indicators, and provide a satisfying completion experience when players find all solutions.

The design leverages existing game logic and math utilities while adding new state management and UI components to track completion status.

## Architecture

### Core Components

1. **Solution Calculator** - Calculates total possible solutions using existing `getSolutionsForTarget` function
2. **Progress Tracker** - Manages found vs total solutions state
3. **Completion Detector** - Monitors when all solutions are found
4. **Celebration UI** - Displays completion state and controls
5. **Game State Manager** - Handles completion state and card interaction disabling

### Data Flow

```
Game Start → Calculate Total Solutions → Display Progress → Track Found Solutions → Detect Completion → Show Celebration → Reset for New Game
```

## Components and Interfaces

### 1. Solution Calculation Interface

```typescript
interface GameCompletionState {
  totalSolutions: number;
  foundSolutions: number;
  isCompleted: boolean;
  completionTime?: number;
}

interface SolutionProgress {
  current: number;
  total: number;
  percentage: number;
}
```

### 2. Completion Detection Logic

The system will:
- Calculate total solutions when a new game starts using `getSolutionsForTarget(cards, targetNumber)`
- Track unique solutions found by players using existing solution key generation
- Compare found count with total count to detect completion
- Trigger completion state when `foundSolutions === totalSolutions`

### 3. UI Enhancement Components

**Progress Display Component:**
- Shows "X of Y solutions found" format
- Updates in real-time as solutions are discovered
- Positioned in the existing game info panel

**Completion Celebration Component:**
- Overlay or enhanced panel showing congratulations
- Celebration visual effects (enhanced styling, animations)
- "Start New Game" button prominently displayed
- Statistics summary (time taken, difficulty level)

**Card Interaction Control:**
- Disable card click handlers when game is completed
- Visual indication that cards are no longer interactive
- Maintain last selection state until new game starts

## Data Models

### Enhanced Game State

Extend existing state with completion tracking:

```typescript
// Add to existing App component state
const [completionState, setCompletionState] = useState<GameCompletionState>({
  totalSolutions: 0,
  foundSolutions: 0,
  isCompleted: false
});

const [gameCompleted, setGameCompleted] = useState<boolean>(false);
```

### Solution Tracking

Leverage existing solution tracking with completion detection:

```typescript
// Enhanced solution tracking
const checkGameCompletion = (foundCount: number, totalCount: number) => {
  if (foundCount >= totalCount && totalCount > 0) {
    setGameCompleted(true);
    setCompletionState(prev => ({
      ...prev,
      isCompleted: true,
      completionTime: Date.now()
    }));
  }
};
```

## Error Handling

### Edge Cases

1. **No Valid Solutions**: If `getSolutionsForTarget` returns empty array, regenerate game
2. **Calculation Errors**: Wrap solution calculation in try-catch, fallback to regeneration
3. **State Inconsistency**: Validate found solutions count doesn't exceed total
4. **Performance**: Limit solution calculation to reasonable time bounds

### Error Recovery

```typescript
const calculateTotalSolutions = (cards: Card[], target: number): number => {
  try {
    const solutions = getSolutionsForTarget(cards, target);
    if (solutions.length === 0) {
      throw new Error('No valid solutions found');
    }
    return solutions.length;
  } catch (error) {
    console.error('Solution calculation failed:', error);
    // Trigger new game generation
    generateNewGame();
    return 0;
  }
};
```

## Testing Strategy

### Unit Testing

1. **Solution Calculation Tests**
   - Test `getSolutionsForTarget` with known card sets
   - Verify total solution count accuracy
   - Test edge cases (no solutions, single solution)

2. **Completion Detection Tests**
   - Test completion trigger when found === total
   - Test state updates during completion
   - Test reset functionality

3. **Progress Calculation Tests**
   - Test percentage calculations
   - Test progress display formatting
   - Test real-time updates

### Integration Testing

1. **Game Flow Tests**
   - Test complete game cycle from start to completion
   - Test new game generation after completion
   - Test card interaction disabling

2. **UI Component Tests**
   - Test progress display updates
   - Test completion celebration display
   - Test button states and interactions

### Performance Testing

1. **Solution Calculation Performance**
   - Measure calculation time for different difficulty levels
   - Test with maximum card combinations (10×9×8 = 720 combinations)
   - Ensure UI remains responsive during calculation

## Implementation Notes

### Existing Code Integration

The design leverages existing functions:
- `getSolutionsForTarget()` for total solution calculation
- `generateSolutionKey()` for unique solution tracking
- `generateNewGame()` for game reset functionality
- Existing state management patterns in App.tsx

### Performance Considerations

- Solution calculation happens once per game at startup
- Progress tracking uses existing solution key comparison
- Completion detection is O(1) comparison operation
- UI updates are batched with React state updates

### Accessibility

- Progress information announced to screen readers
- Completion celebration includes text alternatives
- Keyboard navigation support for new game button
- High contrast colors for completion states

### Mobile Responsiveness

- Progress display adapts to smaller screens
- Completion celebration overlay scales appropriately
- Touch-friendly button sizes for new game action
