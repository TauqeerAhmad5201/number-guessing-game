#!/bin/bash

# Quick Start Script for Number Guessing Game
# This script provides easy commands to get started

echo "🎮 Number Guessing Game - Kubernetes Canary Deployment Demo"
echo "=========================================================="
echo ""

echo "Available commands:"
echo ""
echo "📱 Development:"
echo "  npm run dev                    # Start development server"
echo "  npm run build                  # Build for production"
echo "  npm run lint                   # Run ESLint"
echo ""
echo "🐳 Docker:"
echo "  ./scripts/test-local.sh docker # Test Docker build"
echo "  docker-compose up -d           # Start canary simulation"
echo "  docker-compose down            # Stop services"
echo ""
echo "☸️  Kubernetes:"
echo "  ./scripts/deploy.sh deploy-stable    # Deploy stable version"
echo "  ./scripts/deploy.sh deploy-canary    # Deploy canary version"
echo "  ./scripts/deploy.sh status           # Check deployment status"
echo "  ./scripts/deploy.sh promote          # Promote canary to stable"
echo ""
echo "🔧 Utilities:"
echo "  ./scripts/test-local.sh help         # Local testing help"
echo "  ./scripts/deploy.sh help             # Kubernetes deployment help"
echo ""

# Check if specific command was requested
if [ "$1" = "dev" ]; then
    echo "🚀 Starting development server..."
    npm run dev
elif [ "$1" = "build" ]; then
    echo "🏗️  Building application..."
    npm run build
elif [ "$1" = "docker" ]; then
    echo "🐳 Testing Docker build..."
    ./scripts/test-local.sh docker
elif [ "$1" = "compose" ]; then
    echo "🐳 Starting canary simulation with docker-compose..."
    ./scripts/test-local.sh compose
else
    echo "💡 Quick start examples:"
    echo "  ./start.sh dev               # Start development"
    echo "  ./start.sh build             # Build application"
    echo "  ./start.sh docker            # Test Docker"
    echo "  ./start.sh compose           # Test canary locally"
fi
