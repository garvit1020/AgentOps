output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = false
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate for cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "ecr_frontend_url" {
  description = "ECR URL for frontend Docker image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR URL for backend Docker image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_agents_url" {
  description = "ECR URL for Python agents Docker image"
  value       = aws_ecr_repository.agents.repository_url
}

output "ecr_demo_app_url" {
  description = "ECR URL for demo app Docker image"
  value       = aws_ecr_repository.demo_app.repository_url
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "kubectl_config_command" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
