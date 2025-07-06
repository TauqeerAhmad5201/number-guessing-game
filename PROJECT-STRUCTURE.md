# Project Structure Overview

## 📁 Complete File Structure

```
games/
├── 📄 README.md                           # Comprehensive project documentation
├── 📄 package.json                        # Node.js dependencies and scripts
├── 📄 next.config.ts                      # Next.js configuration (standalone builds)
├── 📄 tsconfig.json                       # TypeScript configuration
├── 📄 tailwind.config.ts                  # Tailwind CSS configuration
├── 📄 eslint.config.mjs                   # ESLint configuration
├── 📄 postcss.config.mjs                  # PostCSS configuration
├── 📄 docker-compose.yml                  # Local canary simulation
├── 📄 nginx.conf                          # NGINX load balancer config
├── 📄 Dockerfile                          # Multistage production build
├── 📄 .dockerignore                       # Docker build optimization
├── 📄 start.sh                            # Quick start script
│
├── 📂 src/                                 # Application source code
│   ├── 📂 app/
│   │   ├── 📄 layout.tsx                  # Root layout component
│   │   ├── 📄 page.tsx                    # Main game page (stable)
│   │   ├── 📄 page-canary.tsx             # Canary version demo
│   │   ├── 📄 globals.css                 # Global styles
│   │   ├── 📄 favicon.ico                 # App icon
│   │   └── 📂 api/
│   │       └── 📂 health/
│   │           └── 📄 route.ts            # Health check endpoint
│   └── 📂 components/
│       └── 📄 NumberGuessingGame.tsx      # Interactive game component
│
├── 📂 k8s/                                # Kubernetes manifests
│   ├── 📄 00-namespace.yaml               # Namespace and ConfigMaps
│   ├── 📄 01-deployment-stable.yaml       # Stable deployment (3 replicas)
│   ├── 📄 02-deployment-canary.yaml       # Canary deployment (1 replica)
│   ├── 📄 03-services.yaml                # ClusterIP services
│   ├── 📄 04-ingress.yaml                 # NGINX Ingress with traffic split
│   ├── 📄 05-hpa.yaml                     # Horizontal Pod Autoscaler
│   └── 📄 06-pdb.yaml                     # Pod Disruption Budgets
│
├── 📂 scripts/                            # Automation scripts
│   ├── 📄 deploy.sh                       # Kubernetes deployment automation
│   ├── 📄 test-local.sh                   # Local testing utilities
│   └── 📄 monitor-canary.sh               # Canary monitoring tools
│
├── 📂 .github/                            # GitHub specific files
│   ├── 📄 copilot-instructions.md         # Copilot development guidelines
│   └── 📂 workflows/
│       └── 📄 ci-cd.yml                   # Complete CI/CD pipeline
│
└── 📂 public/                             # Static assets
    ├── 📄 next.svg                        # Next.js logo
    ├── 📄 vercel.svg                      # Vercel logo
    ├── 📄 file.svg                        # File icon
    ├── 📄 globe.svg                       # Globe icon
    └── 📄 window.svg                      # Window icon
```

## 🎯 Key Components Explained

### 🎮 Application Layer
- **NumberGuessingGame.tsx**: Full-featured React game with state management
- **Health API**: Kubernetes-ready health check endpoints
- **Responsive UI**: Tailwind CSS with dark mode support

### 🐳 Containerization
- **Multistage Dockerfile**: Optimized production builds
- **Security**: Non-root user, minimal attack surface
- **Health Checks**: Built-in container health monitoring

### ☸️ Kubernetes Configuration
- **Canary Strategy**: 90% stable, 10% canary traffic split
- **Auto-scaling**: CPU and memory-based HPA
- **High Availability**: Pod disruption budgets
- **Load Balancing**: NGINX Ingress Controller

### 🚀 DevOps Pipeline
- **CI/CD**: Automated testing, building, and deployment
- **Multi-environment**: Separate staging (canary) and production
- **Monitoring**: Health checks and deployment validation

### 🛠️ Development Tools
- **Local Testing**: Docker Compose canary simulation
- **Automation Scripts**: Deployment and monitoring utilities
- **Code Quality**: ESLint, TypeScript, formatting

## 📋 Usage Scenarios

### 🏃‍♂️ Quick Start
```bash
# Development
./start.sh dev

# Local testing
./start.sh compose

# Production deployment
./scripts/deploy.sh deploy-stable
```

### 🔄 Canary Deployment Flow
```bash
# 1. Deploy stable version
./scripts/deploy.sh deploy-stable

# 2. Deploy canary (10% traffic)
./scripts/deploy.sh deploy-canary

# 3. Monitor performance
./scripts/monitor-canary.sh monitor

# 4. Promote or rollback
./scripts/deploy.sh promote
# OR
./scripts/deploy.sh cleanup-canary
```

### 📊 Monitoring and Observability
```bash
# Check deployment status
./scripts/deploy.sh status

# Monitor canary metrics
./scripts/monitor-canary.sh metrics

# Test traffic distribution
./scripts/monitor-canary.sh test-traffic

# View logs
./scripts/monitor-canary.sh logs both
```

## 🎓 Learning Outcomes

This project teaches:

1. **Canary Deployment Strategy**: Gradual rollout with traffic splitting
2. **Kubernetes Best Practices**: Resource management, health checks, scaling
3. **Container Optimization**: Multistage builds, security, efficiency
4. **CI/CD Automation**: Pipeline design, testing, deployment
5. **Monitoring & Observability**: Health checks, metrics, logging
6. **Risk Management**: Rollback strategies, disruption budgets

## 🚀 Next Steps

- **Prometheus Integration**: Add metrics collection
- **Grafana Dashboards**: Visualize deployment metrics
- **Flagger Integration**: Automated canary analysis
- **Service Mesh**: Istio for advanced traffic management
- **Multi-cluster**: Cross-cluster canary deployments
