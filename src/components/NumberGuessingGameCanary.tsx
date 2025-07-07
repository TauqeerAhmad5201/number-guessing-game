'use client';

import { useState, useEffect, useCallback } from 'react';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  currentStreak: number;
  bestStreak: number;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface DifficultyConfig {
  range: number;
  maxGuesses: number;
  label: string;
  color: string;
  emoji: string;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { range: 50, maxGuesses: 12, label: 'Easy', color: 'green', emoji: '🟢' },
  medium: { range: 100, maxGuesses: 10, label: 'Medium', color: 'blue', emoji: '🔵' },
  hard: { range: 200, maxGuesses: 8, label: 'Hard', color: 'orange', emoji: '🟠' },
  expert: { range: 500, maxGuesses: 6, label: 'Expert', color: 'red', emoji: '🔴' }
};

export default function NumberGuessingGameCanary() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');
  const [stats, setStats] = useState<GameStats>({ 
    gamesPlayed: 0, 
    gamesWon: 0, 
    averageGuesses: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const config = DIFFICULTIES[difficulty];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Initialize game
  useEffect(() => {
    startNewGame();
    loadStats();
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = () => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('numberGameStatsCanary');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    }
  };

  const saveStats = useCallback((newStats: GameStats) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('numberGameStatsCanary', JSON.stringify(newStats));
      setStats(newStats);
    }
  }, []);

  const playSound = (type: 'success' | 'error' | 'hint') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.1); // G3
        break;
      case 'hint':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startNewGame = () => {
    const newNumber = Math.floor(Math.random() * config.range) + 1;
    setTargetNumber(newNumber);
    setCurrentGuess('');
    setGuesses([]);
    setGameStatus('playing');
    setMessage(`🎯 I'm thinking of a number between 1 and ${config.range}!`);
    setShowHint(false);
    setShowCelebration(false);
    setGameTime(0);
    setIsTimerRunning(true);
  };

  const makeGuess = () => {
    const guess = parseInt(currentGuess);
    
    if (isNaN(guess) || guess < 1 || guess > config.range) {
      setMessage(`❌ Please enter a valid number between 1 and ${config.range}!`);
      playSound('error');
      return;
    }

    if (guesses.includes(guess)) {
      setMessage('🔄 You already guessed that number! Try a different one.');
      playSound('error');
      return;
    }

    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (guess === targetNumber) {
      setGameStatus('won');
      setIsTimerRunning(false);
      setShowCelebration(true);
      setMessage(`🎉 Incredible! You found it in ${newGuesses.length} guess${newGuesses.length === 1 ? '' : 'es'} and ${gameTime}s!`);
      playSound('success');
      
      // Update stats with streak
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        averageGuesses: ((stats.averageGuesses * stats.gamesPlayed) + newGuesses.length) / (stats.gamesPlayed + 1),
        currentStreak: stats.currentStreak + 1,
        bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1)
      };
      saveStats(newStats);
      
      setTimeout(() => setShowCelebration(false), 3000);
    } else if (newGuesses.length >= config.maxGuesses) {
      setGameStatus('lost');
      setIsTimerRunning(false);
      setMessage(`💀 Game over! The number was ${targetNumber}. Better luck next time!`);
      playSound('error');
      
      // Update stats - reset streak
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon,
        averageGuesses: ((stats.averageGuesses * stats.gamesPlayed) + newGuesses.length) / (stats.gamesPlayed + 1),
        currentStreak: 0,
        bestStreak: stats.bestStreak
      };
      saveStats(newStats);
    } else {
      const remaining = config.maxGuesses - newGuesses.length;
      const diff = Math.abs(guess - targetNumber);
      
      let feedbackEmoji = '';
      if (diff <= 5) feedbackEmoji = '🔥 Very Hot!';
      else if (diff <= 15) feedbackEmoji = '♨️ Hot!';
      else if (diff <= 30) feedbackEmoji = '😊 Warm';
      else if (diff <= 50) feedbackEmoji = '😐 Cool';
      else feedbackEmoji = '🥶 Cold!';
      
      if (guess < targetNumber) {
        setMessage(`📈 Too low! ${feedbackEmoji} ${remaining} guess${remaining === 1 ? '' : 'es'} remaining.`);
      } else {
        setMessage(`📉 Too high! ${feedbackEmoji} ${remaining} guess${remaining === 1 ? '' : 'es'} remaining.`);
      }
      
      // Show hint after half the guesses
      if (newGuesses.length >= Math.floor(config.maxGuesses / 2)) {
        setShowHint(true);
        playSound('hint');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && gameStatus === 'playing') {
      makeGuess();
    }
  };

  const getHint = () => {
    const quarter = config.range / 4;
    if (targetNumber <= quarter) return `🎯 The number is in the first quarter (1-${Math.floor(quarter)})`;
    if (targetNumber <= quarter * 2) return `🎯 The number is in the second quarter (${Math.floor(quarter) + 1}-${Math.floor(quarter * 2)})`;
    if (targetNumber <= quarter * 3) return `🎯 The number is in the third quarter (${Math.floor(quarter * 2) + 1}-${Math.floor(quarter * 3)})`;
    return `🎯 The number is in the fourth quarter (${Math.floor(quarter * 3) + 1}-${config.range})`;
  };

  const getGuessColor = (guess: number) => {
    const diff = Math.abs(guess - targetNumber);
    if (diff === 0) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse';
    if (diff <= 5) return 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md';
    if (diff <= 15) return 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-md';
    if (diff <= 30) return 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md';
    return 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-md';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: Difficulty) => {
    const colors = {
      easy: 'from-green-500 to-emerald-500',
      medium: 'from-blue-500 to-cyan-500',
      hard: 'from-orange-500 to-red-500',
      expert: 'from-red-500 to-pink-500'
    };
    return colors[diff];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30">
        {/* Difficulty Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
            🎮 Choose Your Challenge
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key as Difficulty)}
                className={`p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  difficulty === key
                    ? `bg-gradient-to-r ${getDifficultyColor(key as Difficulty)} text-white shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-sm">{diff.emoji} {diff.label}</div>
                <div className="text-xs opacity-75">1-{diff.range}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ⏱️ {formatTime(gameTime)}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white`}>
            {config.emoji} {config.label} Mode
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
            gameStatus === 'won' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse' :
            gameStatus === 'lost' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' :
            'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
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
              placeholder={`Enter your guess (1-${config.range})`}
              className="flex-1 px-6 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-xl 
                         focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300
                         dark:bg-gray-700 dark:text-white text-center text-lg font-medium
                         bg-gradient-to-r from-white to-purple-50 dark:from-gray-700 dark:to-purple-900"
              min="1"
              max={config.range}
            />
            <button
              onClick={makeGuess}
              disabled={!currentGuess.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                         disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg
                         transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              🎯 Guess!
            </button>
          </div>
        )}

        {/* Hint */}
        {showHint && gameStatus === 'playing' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 
                          border-2 border-yellow-200 dark:border-yellow-800 rounded-xl animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Hint: {getHint()}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">Progress</span>
            <span className="font-medium">{guesses.length}/{config.maxGuesses} guesses</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${
                guesses.length / config.maxGuesses > 0.8 ? 'from-red-500 to-pink-500' :
                guesses.length / config.maxGuesses > 0.6 ? 'from-orange-500 to-red-500' :
                'from-purple-500 to-pink-500'
              }`}
              style={{ width: `${(guesses.length / config.maxGuesses) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Previous Guesses with Enhanced Visual */}
        {guesses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              📋 Your Guesses: 
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (🔥 = Very Close, ♨️ = Close, 😊 = Warm, 😐 = Cool, 🥶 = Cold)
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {guesses.map((guess, index) => {
                const diff = Math.abs(guess - targetNumber);
                let emoji = '';
                if (diff === 0) emoji = '🎯';
                else if (diff <= 5) emoji = '🔥';
                else if (diff <= 15) emoji = '♨️';
                else if (diff <= 30) emoji = '😊';
                else if (diff <= 50) emoji = '😐';
                else emoji = '🥶';
                
                return (
                  <span
                    key={index}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 ${getGuessColor(guess)}`}
                  >
                    {emoji} {guess}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Over Actions */}
        {gameStatus !== 'playing' && (
          <div className="text-center mb-6">
            <button
              onClick={startNewGame}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                         text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🎮 Play Again
            </button>
          </div>
        )}

        {/* Enhanced Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="pt-6 border-t-2 border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              📊 Your Gaming Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.gamesPlayed}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Games Played</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl p-4 border border-green-200 dark:border-green-700">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Win Rate</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.averageGuesses.toFixed(1)}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Avg Guesses</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Current Streak</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.bestStreak}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Best Streak</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
