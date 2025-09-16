resource "aws_ecr_repository" "frontend" {
  name = "budget_planner-frontend-ecr"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "backend" {
  name = "budget_planner-backend-ecr"
  image_tag_mutability = "MUTABLE"
}
