#!/bin/bash

# Simple build script for Number Guessing Game
set -e

echo "🚀 Building Number Guessing Game Docker images..."

# Build the canary image
echo "📦 Building canary image..."
docker build -t number-game:canary .

# Optionally build stable image
if [[ "$1" == "--build-stable" ]]; then
  echo "📦 Building stable image..."
  docker build -t number-game:stable .
fi

# List the created images
echo ""
echo "📋 Docker images created:"
docker images | grep "number-game" | head -5

echo ""
echo "🎯 Images ready for deployment!"
echo "   Canary: number-game:canary"
if [[ "$1" == "--build-stable" ]]; then
  echo "   Stable: number-game:stable"
fi

echo ""
echo "🔧 Next steps:"
echo "   1. Deploy to Kubernetes: kubectl apply -f k8s/"
echo "   2. Monitor deployment: kubectl get pods -n number-game"
