# 🚀 Canary Version Features

This document outlines the enhanced features available in the canary version of the Number Guessing Game.

## ✨ New Features in Canary Version

### 🎨 Enhanced Visual Design
- **Animated Background**: Beautiful blob animations that move across the screen
- **Gradient Themes**: Rich purple, pink, and orange gradient color schemes
- **Modern UI Components**: Enhanced buttons, cards, and input fields with better styling
- **Responsive Animations**: Smooth transitions and hover effects throughout the interface

### 🎯 Advanced Game Mechanics
- **Multiple Difficulty Levels**:
  - 🟢 Easy: 1-50, 12 guesses
  - 🔵 Medium: 1-100, 10 guesses  
  - 🟠 Hard: 1-200, 8 guesses
  - 🔴 Expert: 1-500, 6 guesses

### 🔥 Enhanced Features
- **Streak Tracking**: Track your winning streaks across games
- **Timer**: Real-time game timer to track how fast you solve puzzles
- **Sound Effects**: Optional audio feedback for game events
- **Improved Hints**: More detailed hint system with quarter-based ranges
- **Visual Feedback**: Color-coded guesses showing how close you are:
  - 🎯 Exact match
  - 🔥 Very close (within 5)
  - ♨️ Close (within 15)
  - 😊 Warm (within 30)
  - 😐 Cool (within 50)
  - 🥶 Cold (beyond 50)

### 📊 Advanced Statistics
- **Enhanced Stats Display**: Beautiful card-based statistics layout
- **Current Streak**: Track your current winning streak
- **Best Streak**: Your all-time best winning streak
- **Performance Metrics**: Average guesses and win rate tracking

### 🎮 User Experience Improvements
- **Celebration Effects**: Visual celebrations when you win
- **Better Progress Indicators**: Enhanced progress bars with color coding
- **Improved Mobile Experience**: Better responsive design for all screen sizes
- **Accessibility**: Better contrast ratios and keyboard navigation

## 🏗️ Building the Canary Version

### Using the Build Script
```bash
# Build only canary version
./scripts/build-canary.sh

# Build both canary and stable versions
./scripts/build-canary.sh --build-stable
```

### Manual Docker Build
```bash
# Build canary version
docker build \
  --build-arg APP_VERSION=canary \
  --build-arg BUILD_DATE="$(date -u '+%Y-%m-%d_%H:%M:%S_UTC')" \
  --build-arg GIT_COMMIT="$(git rev-parse --short HEAD)" \
  -t number-game:canary \
  .

# Build stable version
docker build \
  --build-arg APP_VERSION=stable \
  --build-arg BUILD_DATE="$(date -u '+%Y-%m-%d_%H:%M:%S_UTC')" \
  --build-arg GIT_COMMIT="$(git rev-parse --short HEAD)" \
  -t number-game:stable \
  .
```

## 🚀 Deployment

### Kubernetes Deployment
The application automatically detects if it's running in canary mode based on the `APP_VERSION` environment variable:

```yaml
# Canary deployment
env:
- name: APP_VERSION
  value: "canary"
```

### Environment Variables
- `APP_VERSION`: Set to "canary" to enable canary features
- `NODE_ENV`: Set to "production" for production builds
- `BUILD_DATE`: Build timestamp (set automatically)
- `GIT_COMMIT`: Git commit hash (set automatically)

## 🔄 Version Detection

The application uses the `APP_VERSION` environment variable to determine which version to serve:

- **stable**: Serves the original stable game with basic features
- **canary**: Serves the enhanced game with all new features

This allows for seamless canary deployments where a percentage of traffic gets the new features while the majority uses the stable version.

## 🎯 Testing the Canary Version

1. **Local Development**:
   ```bash
   export APP_VERSION=canary
   npm run dev
   ```

2. **Docker Testing**:
   ```bash
   docker run -p 3000:3000 -e APP_VERSION=canary number-game:canary
   ```

3. **Kubernetes Testing**:
   ```bash
   kubectl apply -f k8s/
   kubectl port-forward service/number-game-service 3000:80 -n number-game
   ```

## 📈 Performance Considerations

The canary version includes several optimizations:

- **Code Splitting**: Enhanced components are loaded only when needed
- **Optimized Assets**: Better image and animation optimization
- **Memory Efficiency**: Improved state management and cleanup
- **Caching**: Better localStorage usage for statistics

## 🔍 Monitoring

Use these commands to monitor the canary deployment:

```bash
# Check pod status
kubectl get pods -n number-game -l version=canary

# View logs
kubectl logs -f deployment/number-game-canary -n number-game

# Check resource usage
kubectl top pods -n number-game
```

## 🐛 Troubleshooting

### Common Issues

1. **Animations not working**: Ensure CSS animations are supported in the browser
2. **Sound effects not playing**: Check browser audio permissions
3. **Statistics not saving**: Verify localStorage is enabled
4. **Version not detected**: Check `APP_VERSION` environment variable

### Debug Commands

```bash
# Check environment variables in pod
kubectl exec -it deployment/number-game-canary -n number-game -- env | grep APP_VERSION

# Verify image labels
docker inspect number-game:canary | grep -A 10 Labels
```
