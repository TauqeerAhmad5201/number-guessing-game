#!/bin/bash

# Local Testing Script for Canary Deployment Demo
# This script helps test the application locally with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to test local development
test_dev() {
    print_status "Starting development server..."
    npm run dev &
    DEV_PID=$!
    
    sleep 5
    
    if curl -f http://localhost:3000/api/health; then
        print_success "Development server is healthy"
    else
        print_error "Development server health check failed"
        kill $DEV_PID
        exit 1
    fi
    
    print_status "Development server running at http://localhost:3000"
    print_warning "Press Ctrl+C to stop"
    
    # Wait for user interrupt
    trap "kill $DEV_PID; exit 0" INT
    wait $DEV_PID
}

# Function to test Docker build
test_docker() {
    print_status "Building Docker image..."
    docker build -t number-game:test .
    
    print_status "Running Docker container..."
    docker run -d -p 3000:3000 --name number-game-test number-game:test
    
    sleep 10
    
    if curl -f http://localhost:3000/api/health; then
        print_success "Docker container is healthy"
    else
        print_error "Docker container health check failed"
        docker stop number-game-test
        docker rm number-game-test
        exit 1
    fi
    
    print_status "Docker container running at http://localhost:3000"
    print_warning "Stopping container..."
    
    docker stop number-game-test
    docker rm number-game-test
    print_success "Docker test completed successfully"
}

# Function to test with docker-compose
test_compose() {
    print_status "Starting services with docker-compose..."
    docker-compose up -d
    
    sleep 15
    
    print_status "Testing stable version (port 3000)..."
    if curl -f http://localhost:3000/api/health; then
        print_success "Stable version is healthy"
    else
        print_error "Stable version health check failed"
    fi
    
    print_status "Testing canary version (port 3001)..."
    if curl -f http://localhost:3001/api/health; then
        print_success "Canary version is healthy"
    else
        print_error "Canary version health check failed"
    fi
    
    print_status "Testing load balancer (port 8080)..."
    if curl -f http://localhost:8080/health; then
        print_success "Load balancer is healthy"
    else
        print_error "Load balancer health check failed"
    fi
    
    print_status "Services are running:"
    print_status "- Stable version: http://localhost:3000"
    print_status "- Canary version: http://localhost:3001"
    print_status "- Load balanced: http://localhost:8080"
    
    print_warning "To stop services: docker-compose down"
}

# Function to cleanup
cleanup() {
    print_warning "Cleaning up..."
    docker-compose down 2>/dev/null || true
    docker stop number-game-test 2>/dev/null || true
    docker rm number-game-test 2>/dev/null || true
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev                         Start development server"
    echo "  docker                      Test Docker build and run"
    echo "  compose                     Test with docker-compose (canary simulation)"
    echo "  cleanup                     Stop and remove all containers"
    echo "  help                        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                      # Start Next.js dev server"
    echo "  $0 docker                   # Test Docker build"
    echo "  $0 compose                  # Test canary deployment locally"
}

# Main script logic
case "${1:-help}" in
    "dev")
        test_dev
        ;;
    "docker")
        test_docker
        ;;
    "compose")
        test_compose
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac
