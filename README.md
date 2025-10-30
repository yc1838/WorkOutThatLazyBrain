# 🧮 A Real Nerd Can Calculate!

A challenging math puzzle game that tests your arithmetic skills and problem-solving abilities.

## Game Overview

**A Real Nerd Can Calculate!** is an engaging math puzzle game where players must use exactly three cards to create equations that equal a target number. The goal is to find all possible solutions to complete each level.

### How It Works
- Select exactly 3 cards from a grid of numbers and operators
- Create mathematical equations that equal the target number
- Find all possible solutions to complete the level
- Challenge yourself across three difficulty levels

### Game Features
- **Three Difficulty Levels**: Easy (3×3), Medium (4×4), Hard (5×5) grids
- **Progressive Challenge**: Each difficulty offers more complex number combinations
- **Complete Solution Tracking**: Find all possible solutions to master each level
- **Celebration System**: Enjoy satisfying completion animations when you solve all equations
- **Responsive Design**: Play seamlessly on desktop and mobile devices

### Brain Benefits
This game helps exercise:
- **Arithmetic Skills**: Quick mental math calculations
- **Pattern Recognition**: Identifying number relationships
- **Problem-Solving**: Strategic thinking and systematic exploration
- **Processing Speed**: Fast decision-making under challenge

**Does playing games actually help your brain?** Short answer is **Yes**! You can see the scientific evidence [below](#scientific-evidence-on-game-plays-influence-on-brain-plasticity).

## Game Screenshots & Features

### Splash Screen
- Clean, intuitive difficulty selection
- Direct click-to-play interface (no confirmation needed)
- Responsive design for all screen sizes

### Gameplay
- Beautiful low-poly card design with themed colors
- Real-time equation building and validation
- Progress tracking with completion percentage
- Found solutions history

### Completion System
- Celebration animations when all solutions are found
- Detailed game statistics (time, score, progress)
- Smooth transition to new games


## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

## Development & Testing

### Available Scripts
- `npm run demo:direct`: Run math backend demo for testing game logic
- `npm run test:run`: Execute the full test suite
- `npm run dev`: Start development server with live Reddit integration
- `npm run build`: Build production version
- `npm run deploy`: Deploy to Reddit

### Game Logic Testing
The game includes comprehensive testing for:
- **Math Utilities**: Equation generation and validation
- **Game Logic**: Card generation, difficulty scaling, solution detection
- **Completion System**: Progress tracking and celebration triggers
- **Expression Normalization**: Mathematical equivalence detection


## Tech Stack

### Frontend
- **[React](https://react.dev/)**: Modern UI framework with hooks and functional components
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development with comprehensive type definitions
- **[Vite](https://vite.dev/)**: Fast build tool and development server
- **Custom CSS**: Responsive design with CSS Grid, Flexbox, and animations

### Backend & Platform
- **[Devvit](https://developers.reddit.com/)**: Reddit's platform for building immersive games
- **[Express](https://expressjs.com/)**: Server-side logic and API endpoints
- **Math.js**: Advanced mathematical expression evaluation and normalization

### Game Architecture
- **Modular Design**: Separated utilities for game logic, math operations, and UI components
- **State Management**: React hooks for game state, progress tracking, and user interactions
- **Responsive Layout**: Mobile-first design with adaptive grid systems
- **Performance Optimized**: Efficient card generation and solution detection algorithms


## Game Mechanics

### Difficulty Levels
1. **Easy (3×3 Grid)**
   - 9 cards total
   - Simple numbers and basic operations
   - Perfect for beginners and quick games

2. **Medium (4×4 Grid)**
   - 16 cards total
   - More complex number combinations
   - Increased challenge with more solution possibilities

3. **Hard (5×5 Grid)**
   - 25 cards total
   - Expert-level complexity
   - Maximum challenge for math enthusiasts

### Scoring System
- **+1 point** for each unique solution found
- **Progress tracking** shows completion percentage
- **Time tracking** for performance measurement
- **Celebration rewards** for 100% completion

### Card Selection Rules
- Must select exactly 3 cards
- Cards are used in the order selected (1st → 2nd → 3rd)
- Equation format: `number1 operator1 number2 operator2 number3 = target`
- Solutions are mathematically normalized to prevent duplicates

## Scientific Evidence on Game Play's Influence on Brain Plasticity

### Cognitive Benefits of Math Games
Research shows that engaging in mathematical puzzle games can:
- **Improve Working Memory**: Regular practice enhances short-term memory capacity
- **Enhance Processing Speed**: Quick calculations improve cognitive processing
- **Strengthen Problem-Solving**: Strategic thinking develops analytical skills
- **Boost Neuroplasticity**: Mental challenges promote brain adaptability

### Evidence 1: Mathematical Cognition
Studies demonstrate that arithmetic games activate multiple brain regions simultaneously, promoting neural connectivity and cognitive flexibility.
