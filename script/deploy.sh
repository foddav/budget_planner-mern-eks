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

# ================= 3) install ingress helm =================
echo "Adding ingress-nginx helm repo (no-op if already added)..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx || true
helm repo update || true

echo "Install/upgrade ingress-nginx controller..."
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --wait --timeout 5m

# ================= 4) build & push images =================
echo "Building & pushing frontend image..."
docker build -t budget_planner_frontend:latest ./application/frontend
docker tag budget_planner_frontend:latest "${ECR_FRONT}:latest"
docker push "${ECR_FRONT}:latest"

echo "Building & pushing backend image..."
docker build -t budget_planner_backend:latest ./application/backend
docker tag budget_planner_backend:latest "${ECR_BACK}:latest"
docker push "${ECR_BACK}:latest"

# ================= 5) apply k8s namespace manifest =================
echo "Applying Kubernetes manifests (namespaces)..."
kubectl apply -f kubernetes/namespaces.yaml

# ================= 6) create/update mongodb secret =================
echo "Creating/updating mongodb-credentials secret in namespace 'app'..."
kubectl create secret generic mongodb-credentials \
  --from-literal=MONGO_USERNAME=appuser \
  --from-literal=MONGO_PASSWORD="$MONGO_PASS" \
  --from-literal=MONGO_HOST='mongodb.database.svc.cluster.local' \
  --from-literal=MONGO_DB='budget_planner' \
  -n app \
  --dry-run=client -o yaml | kubectl apply -f -

# ================= 7) apply k8s namespace manifest =================
echo "Applying Kubernetes manifests (ingress, backend, frontend)..."
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml

# ================= 8) final status and frontend service address =================
echo "Ingress controller svc (look for EXTERNAL-IP / HOSTNAME):"
kubectl get svc -n ingress-nginx

echo ""
echo "If the ingress has an EXTERNAL-IP / HOSTNAME, open it in browser."
echo "If it's <pending> wait a minute and re-run: kubectl get svc -n ingress-nginx"
echo ""
echo "DONE."