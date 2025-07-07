# Local Canary Deployment Testing Guide

This guide will help you test the canary deployment setup locally using Kubernetes with NodePort services.

## Prerequisites

Before starting, make sure you have:

1. **Docker** installed and running
2. **kubectl** installed and configured
3. **A local Kubernetes cluster** running (one of the following):
   - Minikube
   - Kind
   - Docker Desktop with Kubernetes enabled
   - K3s

## Quick Start

### 1. Start Your Local Kubernetes Cluster

**Using Minikube:**
```bash
minikube start
```

**Using Kind:**
```bash
kind create cluster --name canary-test
```

**Using Docker Desktop:**
Enable Kubernetes in Docker Desktop settings.

### 2. Run the Complete Setup

```bash
# Navigate to the project directory
cd /home/tauqeerahmad/Documents/games

# Run the complete setup
./scripts/local-k8s-test.sh setup
```

This will:
- Check prerequisites
- Build Docker images for stable and canary versions
- Deploy both versions to Kubernetes
- Create NodePort services
- Test the deployment

### 3. Access Your Services

After successful deployment, you can access:

- **Main Service (Load Balanced)**: http://localhost:30080 (or minikube-ip:30080)
- **Stable Service**: http://localhost:30081 (or minikube-ip:30081)  
- **Canary Service**: http://localhost:30082 (or minikube-ip:30082)

**For Minikube users:**
```bash
# Get Minikube IP
minikube ip
# Use this IP instead of localhost
```

## Testing Canary Deployment

### Manual Testing

1. **Test Stable Version:**
   ```bash
   curl http://localhost:30081/api/health
   ```

2. **Test Canary Version:**
   ```bash
   curl http://localhost:30082/api/health
   ```

3. **Test Load Balanced Service:**
   ```bash
   curl http://localhost:30080/api/health
   ```

### Automated Testing

```bash
# Run canary simulation
./scripts/local-k8s-test.sh canary
```

This will send multiple requests to the main service to test traffic distribution.

## Available Commands

### Script Commands

```bash
# Complete setup from scratch
./scripts/local-k8s-test.sh setup

# Deploy only (assumes images are built)
./scripts/local-k8s-test.sh deploy

# Test existing services
./scripts/local-k8s-test.sh test

# Monitor pods in real-time
./scripts/local-k8s-test.sh monitor

# Show service URLs and status
./scripts/local-k8s-test.sh urls

# Simulate canary testing
./scripts/local-k8s-test.sh canary

# Clean up all resources
./scripts/local-k8s-test.sh cleanup
```

### Manual Kubernetes Commands

```bash
# Check namespace and pods
kubectl get pods -n number-game

# Check services
kubectl get services -n number-game

# Check deployments
kubectl get deployments -n number-game

# View logs
kubectl logs -f deployment/number-game-stable -n number-game
kubectl logs -f deployment/number-game-canary -n number-game

# Scale deployments
kubectl scale deployment number-game-stable --replicas=2 -n number-game
kubectl scale deployment number-game-canary --replicas=1 -n number-game
```

## Understanding the Setup

### Service Architecture

1. **number-game-service** (Port 30080): Main load-balanced service that routes to both stable and canary
2. **number-game-stable** (Port 30081): Direct access to stable pods only
3. **number-game-canary** (Port 30082): Direct access to canary pods only

### Traffic Distribution

By default:
- **Stable**: 3 replicas (75% of traffic)
- **Canary**: 1 replica (25% of traffic)

### NodePort Configuration

- **30080**: Main service (load balanced between stable and canary)
- **30081**: Stable service only
- **30082**: Canary service only

## Simulating Real Canary Scenarios

### Scenario 1: Gradual Rollout

1. Start with canary at 0 replicas:
   ```bash
   kubectl scale deployment number-game-canary --replicas=0 -n number-game
   ```

2. Gradually increase canary replicas:
   ```bash
   kubectl scale deployment number-game-canary --replicas=1 -n number-game
   # Test with ./scripts/local-k8s-test.sh canary
   
   kubectl scale deployment number-game-canary --replicas=2 -n number-game
   # Test again
   ```

### Scenario 2: Canary Rollback

1. If canary shows issues, scale it down:
   ```bash
   kubectl scale deployment number-game-canary --replicas=0 -n number-game
   ```

2. All traffic goes to stable version

### Scenario 3: Full Promotion

1. If canary is stable, promote it:
   ```bash
   # Update stable to use canary image
   kubectl set image deployment/number-game-stable number-game=number-game:canary -n number-game
   
   # Scale down old canary
   kubectl scale deployment number-game-canary --replicas=0 -n number-game
   ```

## Monitoring and Observability

### Pod Status
```bash
# Watch pods in real-time
kubectl get pods -n number-game -w

# Describe pod for details
kubectl describe pod <pod-name> -n number-game
```

### Service Endpoints
```bash
# Check service endpoints
kubectl get endpoints -n number-game

# Describe service for details
kubectl describe service number-game-service -n number-game
```

### Resource Usage
```bash
# Check resource usage
kubectl top pods -n number-game
kubectl top nodes
```

## Troubleshooting

### Common Issues

1. **Services not accessible:**
   - Check if Kubernetes cluster is running
   - Verify NodePort range (30000-32767)
   - For Minikube, use `minikube ip` instead of localhost

2. **Pods not starting:**
   - Check pod logs: `kubectl logs <pod-name> -n number-game`
   - Verify image is available: `kubectl describe pod <pod-name> -n number-game`

3. **Health checks failing:**
   - Ensure the `/api/health` endpoint exists in your application
   - Check if the application is listening on port 3000

### Cleanup and Reset

```bash
# Complete cleanup
./scripts/local-k8s-test.sh cleanup

# Or manually
kubectl delete namespace number-game
docker rmi number-game:stable number-game:canary
```

## Next Steps

After testing locally, you can:

1. **Deploy to cloud Kubernetes** (EKS, GKE, AKS)
2. **Add ingress controller** for better traffic management
3. **Implement proper monitoring** with Prometheus/Grafana
4. **Add automated canary analysis** with Flagger or Argo Rollouts
5. **Set up CI/CD pipeline** for automated deployments

## Additional Resources

- [Kubernetes NodePort Documentation](https://kubernetes.io/docs/concepts/services-networking/service/#nodeport)
- [Canary Deployments Best Practices](https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/#canary-deployments)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
