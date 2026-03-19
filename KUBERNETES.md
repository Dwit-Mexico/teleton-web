# ☸️ Kubernetes Deployment Guide

This directory contains the manifests to deploy the Pixel Dog Gallery to a
Kubernetes cluster.

## 📋 Prerequisites

1. **Kubernetes Cluster**: A running cluster (e.g., DigitalOcean, Linode, AWS
   EKS, etc.).
2. **kubectl**: Configured to communicate with your cluster.
3. **Container Registry**: A place to push your Docker image (e.g., Docker Hub,
   GHCR, DigitalOcean Container Registry).

## 🚀 Deployment Steps

### 1. Build and Push Image

First, you need to build the image and push it to a registry that your cluster
can access.

```bash
# Build the image
docker build -t your-registry/teleton-web:latest .

# Push to registry
docker push your-registry/teleton-web:latest
```

### 2. Update Configuration

Edit `k8s/deployment.yaml` and update the `image` field:

```yaml
containers:
    - name: teleton-web
      image: ghcr.io/romanshkvolkov/teleton-web:latest # <--- Update this
```

Edit `k8s/http-route.yaml` and update the `host` field:

```yaml
spec:
    rules:
        - host: teleton.guz-studio.dev # <--- Update this
```

### 3. Apply Manifests

Apply the configuration to your cluster:

```bash
kubectl apply -f k8s/
```

### 4. Verify Deployment

Check the status of your pods:

```bash
kubectl get pods
```

Check logs if needed:

```bash
kubectl logs -l app=teleton-web
```

## 🔄 Updates

To deploy a new version:

1. Update your code.
2. Build and push a new image tag (e.g., `v2`).
3. Update `k8s/deployment.yaml` with the new tag.
4. Run `kubectl apply -f k8s/deployment.yaml`.
