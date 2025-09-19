resource "kubernetes_storage_class" "budget_planner_gp3" {
  metadata {
    name = "gp3"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }

  storage_provisioner = "ebs.csi.aws.com"
  volume_binding_mode = "Immediate"
  reclaim_policy      = "Delete"

  parameters = {
    type = "gp3"
  }

  depends_on = [
    module.eks,
    aws_eks_addon.ebs_csi_driver
  ]
}