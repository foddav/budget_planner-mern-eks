output "cluster_name" {
  value = module.eks.cluster_id
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "kubeconfig" {
  value       = module.eks.kubeconfig
  description = "Kubeconfig content (sensitive)"
  sensitive   = true
}

output "mongodb_root_password" {
  value     = random_password.mongodb_root_password.result
  sensitive = true
}

output "ecr_frontend" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend" {
  value = aws_ecr_repository.backend.repository_url
}
