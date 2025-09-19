module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = ">= 21.2.0"

  name               = var.cluster_name
  kubernetes_version = "1.33"

  addons = {
    coredns                = {}
    eks-pod-identity-agent = { before_compute = true }
    kube-proxy             = {}
    vpc-cni                = { before_compute = true }
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  enable_irsa                             = true
  endpoint_public_access                  = true
  enable_cluster_creator_admin_permissions = true

  eks_managed_node_groups = {
    default = {
      desired_capacity = var.desired_capacity
      max_capacity     = var.desired_capacity + 1
      min_capacity     = 1
      instance_types   = [var.node_instance_type]
      name             = var.node_group_name

      force_update_version = true
      create_before_destroy = true
    }
  }
}