#!/bin/bash

# Build and push both stable and canary images for canary deployment
set -e

echo "🚀 Building Number Guessing Game Docker images for canary deployment..."

# Build and push stable image
echo "📦 Building and pushing stable image..."
docker build -t tauqeerops/number-guessing-game:latest .
docker push tauqeerops/number-guessing-game:latest

# Build and push canary image  
echo "📦 Building and pushing canary image..."
docker build -t tauqeerops/number-guessing-game:canary .
docker push tauqeerops/number-guessing-game:canary

echo ""
echo "🎯 Images built and pushed successfully!"
echo "   Stable: tauqeerops/number-guessing-game:latest"
echo "   Canary: tauqeerops/number-guessing-game:canary"

echo ""
echo "🔧 Next steps:"
echo "   1. Deploy to Kubernetes: kubectl rollout restart deployment/number-game-stable deployment/number-game-canary -n number-game"
echo "   2. Monitor deployment: kubectl get pods -n number-game"
echo "   3. Test canary: http://number-game.local:33157"
