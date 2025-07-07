'use client';

import { useState, useEffect } from 'react';
import NumberGuessingGame from '@/components/NumberGuessingGame';
import NumberGuessingGameCanary from '@/components/NumberGuessingGameCanary';

interface VersionInfo {
  version: string;
  isCanary: boolean;
  timestamp: string;
}

export default function Home() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then((data: VersionInfo) => {
        setVersionInfo(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to stable version if API fails
        setVersionInfo({ version: 'stable', isCanary: false, timestamp: new Date().toISOString() });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (versionInfo?.isCanary) {
    // Canary version with enhanced UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-8">
            <div className="animate-bounce mb-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2 animate-pulse">
                🎮 Number Guessing Game
              </h1>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-200 font-medium">
              Kubernetes Canary Deployment Demo - Enhanced Edition
            </p>
            <div className="mt-4 inline-flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 px-4 py-2 rounded-full animate-pulse">
                <span className="text-sm font-bold text-orange-800 dark:text-orange-200">
                  Version: Canary 🚧
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  NEW FEATURES ✨
                </span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap justify-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded text-xs">🎨 Enhanced UI</span>
              <span className="bg-pink-100 dark:bg-pink-800 px-2 py-1 rounded text-xs">🎯 Difficulty Levels</span>
              <span className="bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded text-xs">🔥 Streak Tracking</span>
              <span className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-xs">✨ Animations</span>
            </div>
          </div>
          
          <NumberGuessingGameCanary />
          
          <footer className="mt-12 text-center text-gray-600 dark:text-gray-300">
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
              <p className="text-sm font-medium mb-2">
                Built with Next.js, TypeScript & Tailwind CSS for Kubernetes Canary Deployment
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                  🔥 Canary Version
                </span>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-medium">
                  Enhanced UI & Features
                </span>
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-medium">
                  Performance Optimized
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Stable version
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎮 Number Guessing Game
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Kubernetes Canary Deployment Demo
          </p>
          <div className="mt-4 inline-block bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Version: {versionInfo?.version === 'canary' ? 'Canary 🚧' : 'Stable 🚀'}
            </span>
          </div>
        </div>
        
        <NumberGuessingGame />
        
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built with Next.js, TypeScript & Tailwind CSS for Kubernetes Canary Deployment
          </p>
        </footer>
      </div>
    </div>
  );
}
