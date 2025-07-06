# 🎮 Number Guessing Game - Kubernetes Canary Deployment Demo

A comprehensive demonstration of Kubernetes Canary Deployment using a Next.js TypeScript game application with complete DevOps infrastructure.

## 🚀 Project Overview

This project showcases a production-ready implementation of:
- **Interactive Number Guessing Game** built with Next.js, TypeScript, and Tailwind CSS
- **Kubernetes Canary Deployment** strategy with automated traffic splitting
- **Multistage Docker builds** for optimized production images
- **Complete CI/CD pipeline** with GitHub Actions
- **Infrastructure as Code** with comprehensive K8s manifests

## 🎯 Game Features

- **Interactive Gameplay**: Guess numbers between 1-100 with intelligent feedback
- **Progressive Hints**: Get location hints after 5 guesses
- **Statistics Tracking**: Local storage for game statistics and performance
- **Responsive Design**: Modern UI with dark mode support
- **Health Monitoring**: Built-in health check endpoints for K8s

## 🏗️ Architecture

### Application Stack
- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks with localStorage persistence

### Infrastructure
- **Container Platform**: Docker with multistage builds
- **Orchestration**: Kubernetes with canary deployment strategy
- **Load Balancing**: NGINX Ingress with traffic splitting
- **Monitoring**: Health checks and readiness probes
- **Scaling**: Horizontal Pod Autoscaler (HPA)

### Deployment Strategy
```
Production Traffic Flow:
┌─────────────────┐
│   NGINX Ingress │ 
│   (Traffic Split)│
└─────────┬───────┘
         │
    90%  │  10%
    ┌────▼────┐  ┌──▼──────┐
    │ Stable  │  │ Canary  │
    │ (3 pods)│  │ (1 pod) │
    └─────────┘  └─────────┘
```

## 📂 Project Structure

```
games/
├── src/
│   ├── app/
│   │   ├── api/health/          # Health check endpoint
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main game page
│   └── components/
│       └── NumberGuessingGame.tsx # Game component
├── k8s/
│   ├── 00-namespace.yaml        # Namespace and configs
│   ├── 01-deployment-stable.yaml # Stable deployment
│   ├── 02-deployment-canary.yaml # Canary deployment
│   ├── 03-services.yaml         # K8s services
│   ├── 04-ingress.yaml          # Ingress with canary
│   ├── 05-hpa.yaml              # Auto-scaling
│   └── 06-pdb.yaml              # Pod disruption budgets
├── scripts/
│   └── deploy.sh                # Deployment automation
├── .github/
│   ├── workflows/ci-cd.yml      # GitHub Actions pipeline
│   └── copilot-instructions.md  # Development guidelines
├── Dockerfile                   # Multistage production build
└── docker-compose.yml           # Local development
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured

### 1. Local Development

```bash
# Clone and setup
git clone <repository-url>
cd games

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### 2. Docker Build

```bash
# Build production image
docker build -t number-game:stable .

# Run with Docker
docker run -p 3000:3000 number-game:stable
```

### 3. Kubernetes Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy stable version
./scripts/deploy.sh deploy-stable

# Deploy canary version (10% traffic)
./scripts/deploy.sh deploy-canary

# Check deployment status
./scripts/deploy.sh status

# Promote canary to stable
./scripts/deploy.sh promote
```

## 🎯 Canary Deployment Workflow

### 1. Stable Deployment
```bash
# Initial stable deployment (100% traffic)
kubectl apply -f k8s/01-deployment-stable.yaml
```

### 2. Canary Release
```bash
# Deploy canary version (receives 10% traffic)
kubectl apply -f k8s/02-deployment-canary.yaml
```

### 3. Traffic Monitoring
```bash
# Monitor canary performance
kubectl logs -f deployment/number-game-canary -n number-game

# Check health endpoints
curl http://number-game.local/api/health
```

### 4. Promotion or Rollback
```bash
# Promote canary to stable (if successful)
./scripts/deploy.sh promote

# Or rollback if issues detected
./scripts/deploy.sh rollback-canary
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Application environment (production/development)
- `APP_VERSION`: Version identifier for deployment tracking
- `DOCKER_REGISTRY`: Container registry for images

### Kubernetes Resources
- **Namespace**: `number-game`
- **Stable Deployment**: 3 replicas, resource limits
- **Canary Deployment**: 1 replica, 10% traffic split
- **Auto-scaling**: CPU (70%) and Memory (80%) thresholds
- **Health Checks**: Readiness and liveness probes

### Traffic Split Configuration
```yaml
# Canary Ingress - 10% traffic
annotations:
  nginx.ingress.kubernetes.io/canary: "true"
  nginx.ingress.kubernetes.io/canary-weight: "10"
```

## 🔍 Monitoring & Observability

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Kubernetes pod status
kubectl get pods -n number-game -w

# Deployment status
kubectl rollout status deployment/number-game-stable -n number-game
```

### Logs
```bash
# Application logs
kubectl logs -f deployment/number-game-stable -n number-game

# Canary logs
kubectl logs -f deployment/number-game-canary -n number-game
```

### Metrics
```bash
# Pod resource usage
kubectl top pods -n number-game

# HPA status
kubectl get hpa -n number-game
```

## 🛠️ CI/CD Pipeline

The GitHub Actions workflow provides:

1. **Code Quality**: Linting, type checking, testing
2. **Image Building**: Automated Docker builds with tags
3. **Canary Deployment**: Automatic deployment to staging on `develop` branch
4. **Production Deployment**: Stable deployment on `main` branch
5. **Health Verification**: Automated health checks post-deployment
6. **Cleanup**: Automatic canary cleanup after successful promotion

### Pipeline Triggers
- **Pull Requests**: Run tests and validation
- **Develop Branch**: Deploy to canary environment
- **Main Branch**: Deploy to production (stable)

## 🔐 Security Features

### Container Security
- **Non-root user**: Containers run as dedicated user (UID 1001)
- **Minimal base**: Alpine Linux for reduced attack surface
- **Multi-stage builds**: Separate build and runtime environments
- **Resource limits**: CPU and memory constraints

### Kubernetes Security
- **Pod Security**: Resource quotas and limits
- **Network Policies**: Traffic control between pods
- **Service Accounts**: Minimal required permissions
- **Secrets Management**: Secure handling of sensitive data

## 📊 Performance Optimizations

### Docker
- **Layer caching**: Optimized Dockerfile layer ordering
- **Dependencies**: Separate dependency and application layers
- **Build context**: Minimal build context with .dockerignore

### Kubernetes
- **Resource requests/limits**: Efficient resource allocation
- **Horizontal scaling**: Automatic scaling based on metrics
- **Pod disruption budgets**: Maintain availability during updates
- **Readiness probes**: Traffic only to healthy pods

### Application
- **Static optimization**: Next.js production optimizations
- **Asset optimization**: Automatic image and font optimization
- **Code splitting**: Dynamic imports for optimal loading

## 🚨 Troubleshooting

### Common Issues

1. **Image pull errors**
   ```bash
   # Check image availability
   docker pull <image-name>
   
   # Verify registry access
   kubectl get secrets -n number-game
   ```

2. **Pod startup failures**
   ```bash
   # Check pod logs
   kubectl logs <pod-name> -n number-game
   
   # Describe pod for events
   kubectl describe pod <pod-name> -n number-game
   ```

3. **Service connectivity**
   ```bash
   # Test service endpoints
   kubectl port-forward service/number-game-service 3000:80 -n number-game
   curl http://localhost:3000/api/health
   ```

### Debug Commands
```bash
# Get all resources
kubectl get all -n number-game

# Check ingress configuration
kubectl describe ingress -n number-game

# View deployment history
kubectl rollout history deployment/number-game-stable -n number-game
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Ensure Docker builds successfully
- Test Kubernetes deployments locally

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Next.js team for the excellent React framework
- Kubernetes community for orchestration platform
- NGINX Ingress for traffic management
- GitHub Actions for CI/CD automation

---

**Built with ❤️ for learning Kubernetes Canary Deployments**
