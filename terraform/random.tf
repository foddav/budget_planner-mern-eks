resource "random_password" "mongodb_root_password" {
  length           = 16
  special          = true
  override_special = "!@#$%&*()-_=+"
}