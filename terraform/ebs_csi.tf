resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name = module.eks.cluster_name
  addon_name   = "aws-ebs-csi-driver"

  service_account_role_arn = module.ebs_csi_irsa_role.arn

  depends_on = [
    module.eks,
    module.ebs_csi_irsa_role
  ]
}