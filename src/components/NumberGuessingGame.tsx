'use client';

import { useState, useEffect } from 'react';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
}

export default function NumberGuessingGame() {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('I\'m thinking of a number between 1 and 100!');
  const [maxGuesses] = useState<number>(10);
  const [stats, setStats] = useState<GameStats>({ gamesPlayed: 0, gamesWon: 0, averageGuesses: 0 });
  const [showHint, setShowHint] = useState<boolean>(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
    loadStats();
  }, []);

  const loadStats = () => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('numberGameStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    }
  };

  const saveStats = (newStats: GameStats) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('numberGameStats', JSON.stringify(newStats));
      setStats(newStats);
    }
  };

  const startNewGame = () => {
    const newNumber = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newNumber);
    setCurrentGuess('');
    setGuesses([]);
    setGameStatus('playing');
    setMessage('I\'m thinking of a number between 1 and 100!');
    setShowHint(false);
  };

  const makeGuess = () => {
    const guess = parseInt(currentGuess);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
      setMessage('Please enter a valid number between 1 and 100!');
      return;
    }

    if (guesses.includes(guess)) {
      setMessage('You already guessed that number! Try a different one.');
      return;
    }

    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (guess === targetNumber) {
      setGameStatus('won');
      setMessage(`🎉 Congratulations! You found it in ${newGuesses.length} guess${newGuesses.length === 1 ? '' : 'es'}!`);
      
      // Update stats
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        averageGuesses: ((stats.averageGuesses * stats.gamesPlayed) + newGuesses.length) / (stats.gamesPlayed + 1)
      };
      saveStats(newStats);
    } else if (newGuesses.length >= maxGuesses) {
      setGameStatus('lost');
      setMessage(`😞 Game over! The number was ${targetNumber}. Better luck next time!`);
      
      // Update stats
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon,
        averageGuesses: ((stats.averageGuesses * stats.gamesPlayed) + newGuesses.length) / (stats.gamesPlayed + 1)
      };
      saveStats(newStats);
    } else {
      const remaining = maxGuesses - newGuesses.length;
      if (guess < targetNumber) {
        setMessage(`📈 Too low! ${remaining} guess${remaining === 1 ? '' : 'es'} remaining.`);
      } else {
        setMessage(`📉 Too high! ${remaining} guess${remaining === 1 ? '' : 'es'} remaining.`);
      }
      
      // Show hint after 5 guesses
      if (newGuesses.length >= 5) {
        setShowHint(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && gameStatus === 'playing') {
      makeGuess();
    }
  };

  const getHint = () => {
    if (targetNumber <= 25) return 'The number is quite small (1-25)';
    if (targetNumber <= 50) return 'The number is in the lower half (26-50)';
    if (targetNumber <= 75) return 'The number is in the upper half (51-75)';
    return 'The number is quite large (76-100)';
  };

  const getGuessColor = (guess: number) => {
    const diff = Math.abs(guess - targetNumber);
    if (diff === 0) return 'bg-green-500 text-white';
    if (diff <= 5) return 'bg-yellow-400 text-gray-800';
    if (diff <= 15) return 'bg-orange-400 text-white';
    return 'bg-red-400 text-white';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Game Status */}
        <div className="text-center mb-6">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            gameStatus === 'won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            gameStatus === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {message}
          </div>
        </div>

        {/* Game Input */}
        {gameStatus === 'playing' && (
          <div className="flex gap-3 mb-6">
            <input
              type="number"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess (1-100)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-center text-lg"
              min="1"
              max="100"
            />
            <button
              onClick={makeGuess}
              disabled={!currentGuess.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                         text-white rounded-lg font-medium transition-colors"
            >
              Guess!
            </button>
          </div>
        )}

        {/* Hint */}
        {showHint && gameStatus === 'playing' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 
                          dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">💡</span>
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Hint: {getHint()}
              </span>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{guesses.length}/{maxGuesses} guesses</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(guesses.length / maxGuesses) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Previous Guesses */}
        {guesses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Your Guesses:
            </h3>
            <div className="flex flex-wrap gap-2">
              {guesses.map((guess, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getGuessColor(guess)}`}
                >
                  {guess}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Actions */}
        {gameStatus !== 'playing' && (
          <div className="text-center">
            <button
              onClick={startNewGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                         font-medium transition-colors text-lg"
            >
              🎮 Play Again
            </button>
          </div>
        )}

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
              📊 Your Stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.gamesPlayed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Played</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.averageGuesses.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Guesses</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
