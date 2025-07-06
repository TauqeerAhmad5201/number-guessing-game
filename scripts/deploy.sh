#!/bin/bash

# Kubernetes Deployment Script for Number Guessing Game
# This script handles both stable and canary deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="number-game"
APP_NAME="number-guessing-game"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"

# Print colored output
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

# Function to build Docker image
build_image() {
    local version=$1
    local image_tag="${DOCKER_REGISTRY}/number-game:${version}"
    
    print_status "Building Docker image: ${image_tag}"
    docker build -t "${image_tag}" .
    
    print_status "Pushing Docker image: ${image_tag}"
    docker push "${image_tag}"
    
    print_success "Image ${image_tag} built and pushed successfully"
}

# Function to deploy to Kubernetes
deploy_k8s() {
    local deployment_type=$1
    
    print_status "Deploying ${deployment_type} version to Kubernetes..."
    
    # Apply namespace and common resources first
    kubectl apply -f k8s/00-namespace.yaml
    kubectl apply -f k8s/03-services.yaml
    kubectl apply -f k8s/04-ingress.yaml
    kubectl apply -f k8s/05-hpa.yaml
    kubectl apply -f k8s/06-pdb.yaml
    
    # Apply specific deployment
    if [[ "${deployment_type}" == "stable" ]]; then
        kubectl apply -f k8s/01-deployment-stable.yaml
    elif [[ "${deployment_type}" == "canary" ]]; then
        kubectl apply -f k8s/02-deployment-canary.yaml
    else
        print_error "Invalid deployment type: ${deployment_type}"
        exit 1
    fi
    
    print_success "${deployment_type} deployment applied successfully"
}

# Function to check deployment status
check_deployment() {
    local deployment_type=$1
    local deployment_name="number-game-${deployment_type}"
    
    print_status "Checking deployment status for ${deployment_name}..."
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/${deployment_name} -n ${NAMESPACE} --timeout=300s
    
    # Check pod status
    kubectl get pods -n ${NAMESPACE} -l app=${APP_NAME},version=${deployment_type}
    
    print_success "Deployment ${deployment_name} is ready"
}

# Function to promote canary to stable
promote_canary() {
    print_warning "Promoting canary to stable..."
    
    # Update stable deployment with canary image
    local canary_image=$(kubectl get deployment number-game-canary -n ${NAMESPACE} -o jsonpath='{.spec.template.spec.containers[0].image}')
    
    print_status "Updating stable deployment with image: ${canary_image}"
    kubectl set image deployment/number-game-stable number-game=${canary_image} -n ${NAMESPACE}
    
    # Wait for rollout
    kubectl rollout status deployment/number-game-stable -n ${NAMESPACE} --timeout=300s
    
    # Scale down canary
    kubectl scale deployment number-game-canary --replicas=0 -n ${NAMESPACE}
    
    print_success "Canary promoted to stable successfully"
}

# Function to rollback deployment
rollback() {
    local deployment_type=$1
    local deployment_name="number-game-${deployment_type}"
    
    print_warning "Rolling back ${deployment_name}..."
    kubectl rollout undo deployment/${deployment_name} -n ${NAMESPACE}
    kubectl rollout status deployment/${deployment_name} -n ${NAMESPACE} --timeout=300s
    
    print_success "Rollback completed for ${deployment_name}"
}

# Function to cleanup canary deployment
cleanup_canary() {
    print_warning "Cleaning up canary deployment..."
    kubectl scale deployment number-game-canary --replicas=0 -n ${NAMESPACE}
    print_success "Canary deployment scaled down"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build-stable                 Build and push stable Docker image"
    echo "  build-canary                 Build and push canary Docker image"
    echo "  deploy-stable                Deploy stable version to Kubernetes"
    echo "  deploy-canary                Deploy canary version to Kubernetes"
    echo "  check-stable                 Check stable deployment status"
    echo "  check-canary                 Check canary deployment status"
    echo "  promote                      Promote canary to stable"
    echo "  rollback-stable              Rollback stable deployment"
    echo "  rollback-canary              Rollback canary deployment"
    echo "  cleanup-canary               Scale down canary deployment"
    echo "  status                       Show deployment status"
    echo "  help                         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build-stable              # Build stable version"
    echo "  $0 deploy-canary             # Deploy canary version"
    echo "  $0 promote                   # Promote canary to stable"
}

# Function to show deployment status
show_status() {
    print_status "Checking deployment status..."
    echo ""
    
    print_status "Namespace: ${NAMESPACE}"
    kubectl get namespace ${NAMESPACE} 2>/dev/null || print_warning "Namespace ${NAMESPACE} not found"
    echo ""
    
    print_status "Deployments:"
    kubectl get deployments -n ${NAMESPACE} 2>/dev/null || print_warning "No deployments found"
    echo ""
    
    print_status "Pods:"
    kubectl get pods -n ${NAMESPACE} 2>/dev/null || print_warning "No pods found"
    echo ""
    
    print_status "Services:"
    kubectl get services -n ${NAMESPACE} 2>/dev/null || print_warning "No services found"
    echo ""
    
    print_status "Ingress:"
    kubectl get ingress -n ${NAMESPACE} 2>/dev/null || print_warning "No ingress found"
}

# Main script logic
case "${1:-help}" in
    "build-stable")
        build_image "stable"
        ;;
    "build-canary")
        build_image "canary"
        ;;
    "deploy-stable")
        deploy_k8s "stable"
        check_deployment "stable"
        ;;
    "deploy-canary")
        deploy_k8s "canary"
        check_deployment "canary"
        ;;
    "check-stable")
        check_deployment "stable"
        ;;
    "check-canary")
        check_deployment "canary"
        ;;
    "promote")
        promote_canary
        ;;
    "rollback-stable")
        rollback "stable"
        ;;
    "rollback-canary")
        rollback "canary"
        ;;
    "cleanup-canary")
        cleanup_canary
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
