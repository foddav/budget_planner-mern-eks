variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

provider "aws" {
  region = var.aws_region
}

