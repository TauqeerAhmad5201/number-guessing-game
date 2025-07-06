import NumberGuessingGame from '@/components/NumberGuessingGame';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎮 Number Guessing Game
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Kubernetes Canary Deployment Demo
          </p>
          <div className="mt-4 inline-block bg-orange-100 dark:bg-orange-900 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Version: Canary 🚧
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            ✨ New features being tested
          </div>
        </div>
        
        <NumberGuessingGame />
        
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built with Next.js, TypeScript & Tailwind CSS for Kubernetes Canary Deployment
          </p>
          <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
            🔥 Canary Version - Enhanced UI & Features
          </p>
        </footer>
      </div>
    </div>
  );
}
