# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Kubernetes Canary Deployment demonstration project featuring:
- A Next.js TypeScript game application with Tailwind CSS
- Complete Kubernetes manifests for canary deployments
- Multistage Docker configuration for optimized builds
- CI/CD pipeline with GitHub Actions

## Development Guidelines

### Code Standards
- Use TypeScript for all components and logic
- Follow React best practices with App Router
- Implement responsive design with Tailwind CSS
- Write clean, maintainable code with proper error handling

### Game Development
- Create interactive game components
- Implement state management for game logic
- Add proper UI/UX for game interactions
- Include score tracking and game progression

### Kubernetes & DevOps
- Maintain separation between stable and canary deployments
- Use proper labeling and selectors for K8s resources
- Implement health checks and readiness probes
- Follow security best practices for container deployment

### Docker Best Practices
- Use multistage builds for optimized image size
- Run containers as non-root user
- Minimize attack surface with distroless images
- Cache dependencies for faster builds
