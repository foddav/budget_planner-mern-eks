#!/usr/bin/env bash
set -euo pipefail

# ================= CONFIG =================
AWS_REGION="${AWS_REGION:-eu-central-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"
ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)

CLUSTER_NAME=$(terraform -chdir=terraform output -raw cluster_name)
ECR_FRONT=$(terraform -chdir=terraform output -raw ecr_frontend)
ECR_BACK=$(terraform -chdir=terraform output -raw ecr_backend)

MONGO_PASS=$(terraform -chdir=terraform output -raw mongodb_root_password)

# ================= 1) update kubeconfig =================
echo "Updating kubeconfig for EKS cluster..."
aws eks update-kubeconfig --region "$AWS_REGION" --profile "$AWS_PROFILE" --name "$CLUSTER_NAME"

# ================= 2) login to ECR =================
aws ecr get-login-password --region "$AWS_REGION" --profile "$AWS_PROFILE" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# ================= 3) build & push images =================
echo "Building & pushing frontend image..."
docker build -t budget_planner_frontend:latest ./application/frontend
docker tag budget_planner_frontend:latest "${ECR_FRONT}:latest"
docker push "${ECR_FRONT}:latest"

echo "Building & pushing backend image..."
docker build -t budget_planner_backend:latest ./application/backend
docker tag budget_planner_backend:latest "${ECR_BACK}:latest"
docker push "${ECR_BACK}:latest"

# ================= 4) apply k8s namespace manifest =================
echo "Applying Kubernetes manifests (namespaces)..."
kubectl apply -f kubernetes/namespaces.yaml

# ================= 5) create/update mongodb secret =================
echo "Creating/updating mongodb-credentials secret in namespace 'app'..."
kubectl create secret generic mongodb-credentials \
  --from-literal=MONGO_USERNAME=appuser \
  --from-literal=MONGO_PASSWORD="$MONGO_PASS" \
  --from-literal=MONGO_HOST='mongodb.database.svc.cluster.local' \
  --from-literal=MONGO_DB='budget_planner' \
  -n app \
  --dry-run=client -o yaml | kubectl apply -f -

# ================= 6) apply k8s namespace manifest =================
echo "Applying Kubernetes manifests (backend, frontend)..."
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml

# ================= 7) final status and frontend service address =================
echo "Checking frontend service (may take a moment for LoadBalancer IP)..."
kubectl get svc frontend -n app

echo ""
echo "If frontend has EXTERNAL-IP or HOSTNAME, open it in browser (http)."
echo "If EXTERNAL-IP is '<pending>' wait a minute and re-run: kubectl get svc frontend -n app"
echo ""
echo "DONE."
