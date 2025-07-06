#!/bin/bash

# Canary Deployment Monitoring Script
# This script helps monitor and understand canary deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

NAMESPACE="number-game"

print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

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

# Function to show deployment overview
show_overview() {
    print_header "KUBERNETES CANARY DEPLOYMENT OVERVIEW"
    
    echo "This project demonstrates a complete canary deployment setup:"
    echo ""
    echo "🏗️  Architecture:"
    echo "  ├── Stable Deployment (3 replicas) - 90% traffic"
    echo "  ├── Canary Deployment (1 replica) - 10% traffic"
    echo "  ├── NGINX Ingress Controller - Traffic splitting"
    echo "  ├── Services - Load balancing"
    echo "  ├── HPA - Auto-scaling"
    echo "  └── PDB - Disruption budgets"
    echo ""
    echo "🚀 Deployment Flow:"
    echo "  1. Deploy stable version (100% traffic)"
    echo "  2. Deploy canary version (10% traffic split)"
    echo "  3. Monitor canary performance"
    echo "  4. Promote canary to stable OR rollback"
    echo ""
}

# Function to monitor traffic distribution
monitor_traffic() {
    print_header "TRAFFIC DISTRIBUTION MONITORING"
    
    if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        print_error "Namespace $NAMESPACE not found. Please deploy the application first."
        return 1
    fi
    
    print_status "Current deployment status:"
    kubectl get deployments -n $NAMESPACE -o wide
    echo ""
    
    print_status "Pod distribution:"
    kubectl get pods -n $NAMESPACE -l app=number-guessing-game -o wide
    echo ""
    
    print_status "Service endpoints:"
    kubectl get endpoints -n $NAMESPACE
    echo ""
    
    print_status "Ingress configuration:"
    kubectl get ingress -n $NAMESPACE -o yaml | grep -E "(canary|weight)" || print_warning "No canary configuration found"
}

# Function to test traffic split
test_traffic_split() {
    print_header "TESTING TRAFFIC SPLIT"
    
    local test_count=${1:-20}
    local service_url="http://number-game.local"
    
    print_status "Testing traffic distribution with $test_count requests..."
    print_warning "Note: This requires the ingress to be accessible at $service_url"
    
    # Check if we can reach the service
    if ! command -v curl >/dev/null 2>&1; then
        print_error "curl is required for traffic testing"
        return 1
    fi
    
    local stable_count=0
    local canary_count=0
    
    for i in $(seq 1 $test_count); do
        local response=$(curl -s -H "Host: number-game.local" http://localhost/api/health 2>/dev/null || echo "failed")
        
        if [[ $response == *"stable"* ]]; then
            ((stable_count++))
        elif [[ $response == *"canary"* ]]; then
            ((canary_count++))
        fi
        
        echo -n "."
    done
    
    echo ""
    print_status "Traffic distribution results:"
    echo "  Stable: $stable_count/$test_count ($(( stable_count * 100 / test_count ))%)"
    echo "  Canary: $canary_count/$test_count ($(( canary_count * 100 / test_count ))%)"
    
    if [ $canary_count -gt 0 ]; then
        print_success "Canary traffic detected - deployment is working!"
    else
        print_warning "No canary traffic detected - check ingress configuration"
    fi
}

# Function to show canary metrics
show_metrics() {
    print_header "CANARY DEPLOYMENT METRICS"
    
    if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        print_error "Namespace $NAMESPACE not found"
        return 1
    fi
    
    print_status "Resource usage:"
    kubectl top pods -n $NAMESPACE 2>/dev/null || print_warning "Metrics server not available"
    echo ""
    
    print_status "Horizontal Pod Autoscaler status:"
    kubectl get hpa -n $NAMESPACE
    echo ""
    
    print_status "Recent events:"
    kubectl get events -n $NAMESPACE --sort-by=.metadata.creationTimestamp | tail -10
}

# Function to simulate canary promotion
simulate_promotion() {
    print_header "CANARY PROMOTION SIMULATION"
    
    echo "This is what happens during canary promotion:"
    echo ""
    echo "🔄 Step 1: Validate canary performance"
    echo "  - Check error rates"
    echo "  - Monitor response times"
    echo "  - Verify business metrics"
    echo ""
    echo "✅ Step 2: Update stable deployment"
    echo "  - Replace stable image with canary image"
    echo "  - Rolling update of stable pods"
    echo "  - Wait for rollout completion"
    echo ""
    echo "🔽 Step 3: Scale down canary"
    echo "  - Reduce canary replicas to 0"
    echo "  - Remove canary traffic routing"
    echo "  - 100% traffic to new stable version"
    echo ""
    echo "To actually promote canary to stable:"
    echo "  ./scripts/deploy.sh promote"
}

# Function to show rollback procedure
show_rollback() {
    print_header "CANARY ROLLBACK PROCEDURE"
    
    echo "If issues are detected with the canary:"
    echo ""
    echo "🚨 Immediate actions:"
    echo "  1. Scale canary to 0 replicas:"
    echo "     kubectl scale deployment number-game-canary --replicas=0 -n $NAMESPACE"
    echo ""
    echo "  2. Remove canary traffic:"
    echo "     kubectl delete ingress number-game-canary-ingress -n $NAMESPACE"
    echo ""
    echo "  3. Verify 100% traffic to stable:"
    echo "     kubectl get ingress -n $NAMESPACE"
    echo ""
    echo "📊 Monitor recovery:"
    echo "  - Check error rates return to normal"
    echo "  - Verify user experience is restored"
    echo "  - Investigate canary issues"
    echo ""
    echo "Quick rollback command:"
    echo "  ./scripts/deploy.sh cleanup-canary"
}

# Function to show logs
show_logs() {
    local deployment=${1:-stable}
    print_header "DEPLOYMENT LOGS - $deployment"
    
    if [ "$deployment" = "both" ]; then
        print_status "Stable deployment logs:"
        kubectl logs -l app=number-guessing-game,version=stable -n $NAMESPACE --tail=10
        echo ""
        print_status "Canary deployment logs:"
        kubectl logs -l app=number-guessing-game,version=canary -n $NAMESPACE --tail=10
    else
        kubectl logs -l app=number-guessing-game,version=$deployment -n $NAMESPACE --tail=20 -f
    fi
}

# Function to watch deployment status
watch_deployment() {
    print_header "WATCHING DEPLOYMENT STATUS"
    print_warning "Press Ctrl+C to stop watching"
    
    watch -n 2 "kubectl get pods,deployments,hpa -n $NAMESPACE"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  overview                     Show canary deployment overview"
    echo "  monitor                      Monitor current deployment status"
    echo "  test-traffic [count]         Test traffic distribution (default: 20 requests)"
    echo "  metrics                      Show deployment metrics"
    echo "  promote                      Simulate promotion process"
    echo "  rollback                     Show rollback procedure"
    echo "  logs [stable|canary|both]    Show deployment logs"
    echo "  watch                        Watch deployment status (live)"
    echo "  help                         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 overview                  # Learn about canary deployments"
    echo "  $0 monitor                   # Check current status"
    echo "  $0 test-traffic 50           # Test with 50 requests"
    echo "  $0 logs canary               # Show canary logs"
}

# Main script logic
case "${1:-overview}" in
    "overview")
        show_overview
        ;;
    "monitor")
        monitor_traffic
        ;;
    "test-traffic")
        test_traffic_split "${2:-20}"
        ;;
    "metrics")
        show_metrics
        ;;
    "promote")
        simulate_promotion
        ;;
    "rollback")
        show_rollback
        ;;
    "logs")
        show_logs "${2:-stable}"
        ;;
    "watch")
        watch_deployment
        ;;
    "help"|*)
        show_help
        ;;
esac
