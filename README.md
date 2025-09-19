# Budget Planner — EKS + Terraform + Kubernetes CI-friendly deployment  
  
This is a simple **fullstack Budget Planner (MERN)** application packaged with infrastructure-as-code (Terraform), container images, and Kubernetes manifests — intended as a clean, junior-level but production-minded project demonstrating infra, build and deploy automation.  
This project was created as part of my DevOps learning journey and portfolio.  

---

## Short summary  
  
This repository contains:  
  
- `application/` — frontend (Vite/React) and backend (Node/Express + Mongoose)  
  
- `kubernetes/` — Kubernetes manifests (namespaces, Deployments, Services, Ingress)  
  
- `terraform/` — Terraform configuration that provisions an AWS VPC, EKS cluster, ECR repositories, and a MongoDB Helm release (Bitnami)  
  
- `script/deploy.sh` — convenience script that builds Docker images, pushes them to the ECR repos created by Terraform, and applies the Kubernetes manifests to the cluster  
  
---

## 🖥 About the app  
Budget Planner is a simple single-page web app that helps users track and plan expenses.  
Users can register and log in; accounts (username + password) are stored in the database so data persists between sessions.  
Authenticated users can add expense items with an amount and a description, see a list of their expenses, delete individual items, and view the current total (sum of all amounts).  
The app is useful for short-term budgeting tasks like planning a trip or a shopping list and demonstrates basic CRUD flows for a personal finance tool.  
  
---

## 📌 Project Goals  
- Show a minimal production-style infrastructure for a containerized fullstack app.  
- Demonstrate building, pushing, and deploying images to an AWS EKS cluster.  
- Keep the repo clean and demonstrate simple production-minded DevOps practices (namespaces, Kubernetes Secrets for runtime credentials, and clear automation scripts).
- Use Terraform for infra, Helm for the MongoDB chart, and Kubernetes manifests for application deployment.  
  
---

## ⚙️ Technologies Used  
- Frontend: **React (Vite)**  
- Backend: **Node.js, Express, Mongoose (MongoDB)**  
- Containerization: **Docker**  
- Registry: **Amazon ECR**  
- Orchestration: **Kubernetes (EKS)**  
- Ingress: **ingress-nginx (Helm)**  
- Infrastructure as Code: **Terraform** (AWS provider, terraform-aws-modules/eks)  
- Helm charts: **Bitnami MongoDB Helm chart** (OCI or classic repo)  
- Utility: **bash script** to automate build/push/apply  
  
---

## 📝 How It Works  
1. Terraform (`/terraform`) provisions AWS resources: VPC, EKS cluster, ECR repositories and installs EBS CSI + MongoDB via Helm.  
  
2. Terraform prints outputs including ecr_frontend, ecr_backend and mongodb_root_password.  
  
3. The script/deploy.sh:  
- updates kubeconfig for the created EKS cluster  
- logs into ECR  
- installs the ingress controller (Helm)  
- builds frontend/backend Docker images locally, tags them with the ECR URLs  
- pushes images to ECR  
- creates/updates a Kubernetes Secret for MongoDB credentials using the password from Terraform outputs  
- applies Kubernetes manifests (namespaces, ingress, backend and frontend deployments)  
  
4. The ingress controller exposes the frontend and proxies /api to the backend service.  
  
---

## 🚀 Quick deploy to AWS (step-by-step)  
1. Prepare:  
Ensure you have AWS CLI, kubectl, helm, docker and terraform installed and configured locally.  
  
2. From repo root, run Terraform:
```
cd terraform  
terraform init  
terraform apply  
```  
Confirm the apply and wait until infra is created.  
This will create VPC, EKS cluster with nodes, ECR repositories and installs EBS CSI + MongoDB via Helm.  
  
3. After terraform apply completes, get the Terraform ECR name outputs:  
- ecr_frontend → copy this value into kubernetes/frontend-deployment.yaml replacing <REPLACE_WITH_ECR_FRONTEND>  
  
- ecr_backend → copy this value into kubernetes/backend-deployment.yaml replacing <REPLACE_WITH_ECR_BACKEND>  
  
(The YAMLs expect the full ECR repository URL. Example: 123456789012.dkr.ecr.eu-central-1.amazonaws.com/budget_planner-frontend-ecr:latest)  
  
4. Make the deploy script executable:  
```
cd ..  
chmod +x script/deploy.sh  
``` 
  
5. Configure AWS profile:  
- list existing profiles: `aws configure list-profiles`  
  
- (optional) create a new profile named `<example>`:  
```
aws configure --profile <example>  
```  
  
6. Run the deployment script using the profile:  
```
AWS_PROFILE=<example> ./script/deploy.sh
``` 
  
7. After the script finishes:  
- Check ingress/ingress-nginx service for the external address on the console.    
- Open the EXTERNAL-IP / HOSTNAME in your browser to access the app.  
  
8. Cleanup (if you want to destroy infra):  
```
cd terraform  
terraform destroy
```  
confirm and wait until everything is removed

  
## Notes & important details / tips  
- **.env support**  
  - Backend (server): in development the server loads .env automatically if NODE_ENV !== "production". You can set either a full MONGO_URI or individual vars MONGO_HOST, MONGO_DB, MONGO_USERNAME, MONGO_PASSWORD. Example .env for local dev:  
    - `MONGO_HOST=localhost`  
    - `MONGO_DB=test`  
    - `MONGO_USERNAME=`  
    - `MONGO_PASSWORD=`    
  - Frontend (Vite): set VITE_API_BASE in .env if you need to point the frontend to a different API base (e.g. a different domain). Default fallback is /api.  
- **MongoDB credentials & secrets**  
  - The MongoDB root password is generated by Terraform (`random_password`), exposed as a Terraform output named `mongodb_root_password` (marked sensitive).  
  - The deploy script uses that output to create/update a Kubernetes Secret `mongodb-credentials` in namespace app. The Kubernetes Secret is what the backend deployment references (via `env.valueFrom.secretKeyRef`).  
  - The password is not stored in the repo; it lives in Terraform state (consider encrypting remote state or restricting access).  
- **Helm / Bitnami chart note**  
  - The Terraform config currently uses the Bitnami MongoDB chart with an OCI repo:  
    - `repository = "oci://registry-1.docker.io/bitnamicharts"`  
  - If the OCI-based fetch fails (some environments or provider versions can have issues), you can switch to the classic index-based repo before running terraform apply:  
    - Run locally: `helm repo add bitnami https://charts.bitnami.com/bitnami`  
    - Then: `helm repo update`  
  - In some cases you may also need to `helm registry login registry-1.docker.io` if DockerHub rate-limits or requires auth for OCI pulls. If you plan to rely on OCI charts in automation (CI) verify your Helm provider version supports OCI and your environment can access DockerHub.  
- **ECR / Kubernetes manifest sync**  
  - The repo includes `kubernetes/*-deployment.yaml` with placeholders `<REPLACE_WITH_ECR_* >`. After Terraform creates ECR repos, replace those placeholders with the `terraform output` values before applying the manifests (or modify manifests dynamically in CI).  
  - Alternatively, the provided script/deploy.sh tags and pushes images to the ECR URLs from Terraform outputs, then applies manifests. Make sure manifests contain the correct final image URLs.  
- **Local testing**  
  - You can run backend locally (development):  
    - `cd application/backend`  
    - create `.env` with local Mongo settings or set `MONGO_URI` to a running local Mongo  
    - `npm install`  
    - `node server.js`  
  - Frontend local dev:  
    - `cd application/frontend`  
    - `npm install`  
    - `npm run dev`  
