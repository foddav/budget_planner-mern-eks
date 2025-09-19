resource "helm_release" "mongodb" {
  depends_on = [
    kubernetes_storage_class.budget_planner_gp3,
    aws_eks_addon.ebs_csi_driver
  ]

  name             = "mongodb"
  repository       = "oci://registry-1.docker.io/bitnamicharts"
  chart            = "mongodb"
  version          = "16.5.45"
  namespace        = "database"
  create_namespace = true
  timeout          = 600

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

  set {
    name  = "image.registry"
    value = "docker.io"
  }

  set {
    name  = "image.repository"
    value = "bitnamilegacy/mongodb"
  }

  set {
    name  = "image.tag"
    value = "8.0.13-debian-12-r0"
  }
}