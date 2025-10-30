import React from 'react';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="splash-screen">
      {/* Background with the existing background image */}
      <div
        className="splash-background"
        style={{
          backgroundImage: 'url(/background.jpg)',
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
            Nerd Insult Game
          </h1>

          {/* Game description */}
          <p className="splash-description">
            Challenge your math skills! Use three cards to create equations that equal the target number.
            Find all possible solutions and prove you're the ultimate math nerd!
          </p>

          {/* Features list */}
          <div className="splash-features">
            <div className="feature-item">
              <span className="feature-icon">🧮</span>
              <span>Mathematical Puzzles</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Multiple Difficulty Levels</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Track Your Progress</span>
            </div>
          </div>

          {/* Start button */}
          <button
            className="splash-start-button"
            onClick={onStart}
          >
            <span className="button-text">🎯 Start Challenge</span>
            <div className="button-glow" />
          </button>

          {/* Game preview */}
          <div className="splash-difficulty">
            <span>Choose your challenge level and show your math prowess</span>
          </div>
        </div>
      </div>
    </div>
  );
};
