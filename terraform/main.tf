module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = ">= 21.2.0"

  name    = var.cluster_name
  kubernetes_version = "1.33"

  eks_managed_node_groups = {
    default = {
      desired_capacity = var.desired_capacity
      max_capacity     = var.desired_capacity + 1
      min_capacity     = 1
      instance_types   = [var.node_instance_type]
      name             = var.node_group_name
    }
  }
}

resource "random_password" "mongodb_root_password" {
  length  = 16
  override_characters = "!@#$%&*()-_=+[]{}"
}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_id
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_id
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}

resource "helm_release" "mongodb" {
  name       = "mongodb"
  repository = "oci://registry-1.docker.io/bitnamicharts"
  chart      = "mongodb"
  version    = "16.5.45"

  namespace = "database"

  create_namespace = true

  set {
    name  = "auth.rootPassword"
    value = random_password.mongodb_root_password.result
  }

  set {
    name  = "auth.username"
    value = "appuser"
  }

  set {
    name  = "auth.password"
    value = random_password.mongodb_root_password.result
  }

  set {
    name  = "auth.database"
    value = "budget_planner"
  }

  set {
    name  = "persistence.enabled"
    value = "true"
  }
}
