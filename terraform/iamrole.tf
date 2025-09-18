locals {
  node_group_key = "default"
  node_role_arn  = module.eks.eks_managed_node_groups[local.node_group_key].iam_role_arn
  node_role_name = element(split("/", local.node_role_arn), length(split("/", local.node_role_arn)) - 1)
}

resource "aws_iam_role_policy_attachment" "node_attach_ecr_read" {
  depends_on = [module.eks]
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = local.node_role_name
}
