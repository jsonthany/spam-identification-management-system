variable "prefix" {
  type        = string
  description = "Prefix to prepend to resource names in this directory"
  default     = "cma"
}

variable "db_default_user" {
  type        = string
  description = "The default user for the database"
  default     = "psqladmin"
}
variable "db_default_password" {
  type        = string
  description = "The default password used by the database"
}