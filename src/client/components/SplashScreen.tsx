import React from 'react';
import type { GameDifficulty } from '../../shared/types/game';

interface SplashScreenProps {
  onStart: (difficulty: GameDifficulty) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const handleDifficultySelect = (difficulty: GameDifficulty) => {
    onStart(difficulty);
  };

  return (
    <div className="splash-screen">
      {/* Background with the existing background image */}
      <div
        className="splash-background"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="splash-overlay" />

        {/* Main content */}
        <div className="splash-content">
          {/* Game logo/icon using the snoo image */}
          <div className="splash-logo">
            <img
              src="/snoo.png"
              alt="Nerd Insult Game"
              className="splash-icon"
            />
          </div>

          {/* Game title */}
          <h1 className="splash-title">
            🧮 A Real Nerd Can Calculate!
          </h1>

          {/* Game description */}
          <p className="splash-description">
            Challenge your math skills! Your brain becomes smarter when you work it out!
            Use three cards to create equations that equal the target number.
            Find all possible solutions and prove you're the ultimate nerd!
          </p>

          {/* Game Rules */}
          <div className="splash-rules">
            <div className="rules-title">How to Play</div>
            <div className="rule-item">
              <span className="rule-number">1</span>
              <span>Select exactly 3 cards from the grid</span>
            </div>
            <div className="rule-item">
              <span className="rule-number">2</span>
              <span>Create an equation that equals the target number</span>
            </div>
            <div className="rule-item">
              <span className="rule-number">3</span>
              <span>Find all possible solutions to complete the level</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="splash-difficulty-selection">
            <div className="difficulty-title">
              Choose Your Challenge Level
            </div>
            <div className="difficulty-options">
              {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((difficulty) => (
                <button
                  key={difficulty}
                  className="difficulty-button"
                  onClick={() => handleDifficultySelect(difficulty)}
                >
                  <div className="difficulty-name">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                  <div className="difficulty-description">
                    {difficulty === 'easy' && '3×3 Grid • Simple Numbers'}
                    {difficulty === 'medium' && '4×4 Grid • More Complex'}
                    {difficulty === 'hard' && '5×5 Grid • Expert Level'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game preview */}
          <div className="splash-difficulty">
            <span>Click any difficulty to start playing!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
