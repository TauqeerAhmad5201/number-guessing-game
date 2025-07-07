#!/bin/bash

# Local Kubernetes Testing Script for Canary Deployment
# This script sets up a complete local testing environment for canary deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="number-game"
STABLE_IMAGE="number-game:stable"
CANARY_IMAGE="number-game:canary"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed. Please install docker first."
        exit 1
    fi
    
    # Check if Kubernetes cluster is running
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Kubernetes cluster is not accessible. Please start your local cluster (minikube, kind, etc.)"
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    
    # Build stable image
    print_status "Building stable image..."
    docker build -t $STABLE_IMAGE .
    print_success "Stable image built successfully"
    
    # Build canary image (simulate a different version)
    print_status "Building canary image..."
    # Create a temporary Dockerfile with a small change for canary
    cp Dockerfile Dockerfile.canary
    echo "ENV CANARY_VERSION=true" >> Dockerfile.canary
    docker build -f Dockerfile.canary -t $CANARY_IMAGE .
    rm Dockerfile.canary
    print_success "Canary image built successfully"
    
    # If using minikube, load images into minikube
    if command -v minikube &> /dev/null && minikube status &> /dev/null; then
        print_status "Loading images into minikube..."
        minikube image load $STABLE_IMAGE
        minikube image load $CANARY_IMAGE
        print_success "Images loaded into minikube"
    fi
}

# Deploy to Kubernetes
deploy_to_k8s() {
    print_header "Deploying to Kubernetes"
    
    # Apply namespace and config
    print_status "Creating namespace and configuration..."
    kubectl apply -f k8s/00-namespace.yaml
    kubectl apply -f k8s/00-configmap.yaml
    
    # Deploy stable version
    print_status "Deploying stable version..."
    kubectl apply -f k8s/01-deployment-stable.yaml
    
    # Deploy canary version
    print_status "Deploying canary version..."
    kubectl apply -f k8s/02-deployment-canary.yaml
    
    # Apply services
    print_status "Creating services..."
    kubectl apply -f k8s/03-services.yaml
    
    print_success "All resources deployed successfully"
}

# Wait for deployments to be ready
wait_for_deployments() {
    print_header "Waiting for Deployments"
    
    print_status "Waiting for stable deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/number-game-stable -n $NAMESPACE
    
    print_status "Waiting for canary deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/number-game-canary -n $NAMESPACE
    
    print_success "All deployments are ready"
}

# Get service URLs
get_service_urls() {
    print_header "Service Information"
    
    # Get node IP (for NodePort services)
    if command -v minikube &> /dev/null && minikube status &> /dev/null; then
        NODE_IP=$(minikube ip)
    else
        NODE_IP="localhost"
    fi
    
    echo -e "${GREEN}Service URLs:${NC}"
    echo -e "  Main Service (Load Balanced): http://${NODE_IP}:30080"
    echo -e "  Stable Service: http://${NODE_IP}:30081"
    echo -e "  Canary Service: http://${NODE_IP}:30082"
    echo ""
    
    # Show service status
    kubectl get services -n $NAMESPACE
    echo ""
    
    # Show pod status
    kubectl get pods -n $NAMESPACE -o wide
}

# Test services
test_services() {
    print_header "Testing Services"
    
    # Get node IP
    if command -v minikube &> /dev/null && minikube status &> /dev/null; then
        NODE_IP=$(minikube ip)
    else
        NODE_IP="localhost"
    fi
    
    # Test stable service
    print_status "Testing stable service..."
    if curl -f -s http://${NODE_IP}:30081/api/health > /dev/null; then
        print_success "Stable service is healthy"
    else
        print_warning "Stable service health check failed (might still be starting)"
    fi
    
    # Test canary service
    print_status "Testing canary service..."
    if curl -f -s http://${NODE_IP}:30082/api/health > /dev/null; then
        print_success "Canary service is healthy"
    else
        print_warning "Canary service health check failed (might still be starting)"
    fi
    
    # Test main service (load balanced)
    print_status "Testing main service (load balanced)..."
    if curl -f -s http://${NODE_IP}:30080/api/health > /dev/null; then
        print_success "Main service is healthy"
    else
        print_warning "Main service health check failed (might still be starting)"
    fi
}

# Simulate canary testing
simulate_canary_test() {
    print_header "Simulating Canary Testing"
    
    # Get node IP
    if command -v minikube &> /dev/null && minikube status &> /dev/null; then
        NODE_IP=$(minikube ip)
    else
        NODE_IP="localhost"
    fi
    
    echo -e "${YELLOW}Sending requests to test traffic distribution:${NC}"
    
    for i in {1..10}; do
        echo -n "Request $i: "
        response=$(curl -s http://${NODE_IP}:30080/api/health || echo "failed")
        if [[ $response == *"healthy"* ]]; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC}"
        fi
        sleep 1
    done
}

# Cleanup function
cleanup() {
    print_header "Cleanup"
    
    print_status "Removing all resources..."
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    print_status "Removing Docker images..."
    docker rmi $STABLE_IMAGE $CANARY_IMAGE --force 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Monitor function
monitor() {
    print_header "Monitoring"
    
    echo -e "${YELLOW}Monitoring pods in real-time. Press Ctrl+C to stop.${NC}"
    kubectl get pods -n $NAMESPACE -w
}

# Show usage
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Full setup (check prerequisites, build images, deploy)"
    echo "  deploy    - Deploy to Kubernetes only"
    echo "  test      - Test services"
    echo "  monitor   - Monitor pods"
    echo "  cleanup   - Remove all resources"
    echo "  urls      - Show service URLs"
    echo "  canary    - Simulate canary testing"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # Complete setup from scratch"
    echo "  $0 test     # Test existing deployment"
    echo "  $0 cleanup  # Clean up everything"
}

# Main execution
case "${1:-setup}" in
    setup)
        check_prerequisites
        build_images
        deploy_to_k8s
        wait_for_deployments
        get_service_urls
        test_services
        ;;
    deploy)
        deploy_to_k8s
        wait_for_deployments
        get_service_urls
        ;;
    test)
        test_services
        ;;
    monitor)
        monitor
        ;;
    cleanup)
        cleanup
        ;;
    urls)
        get_service_urls
        ;;
    canary)
        simulate_canary_test
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        usage
        exit 1
        ;;
esac
