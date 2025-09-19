variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "cluster_name" {
  type    = string
  default = "budget_planner-cluster"
}

variable "node_group_name" {
  type    = string
  default = "budget_planner-nodes"
}

variable "node_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "desired_capacity" {
  type    = number
  default = 3
}
