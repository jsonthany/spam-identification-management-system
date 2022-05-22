# Terraform Infrastructure-as-Code

This directory contains Terraform code that represents our Azure deployment infrastructure. The state is stored in a workspace in Terraform Cloud at https://app.terraform.io/app/PiedPiperUbc/workspaces/Pied-Piper-PWC-Backend. 

For access to this workspace, please contact @jerry-hall. 

## What does this do?

The workspace (located in Terraform Cloud) is connected to this repository. When a change to this repository is detected on main branch, Terraform Cloud will attempt to run `terraform plan` and `terraform apply` against this directory (i.e., attempt to align the state of the actual infrastructure to the state  declared by this directory). 