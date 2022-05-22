# CyberMailAnalyzer Load Balancer is not managed by Terraform
# data "azurerm_lb" "CMA_LB" {
#     name = "${var.prefix}-LB"
#     resource_group_name = "CyberMailAnalyzer"
# }

# data "azurerm_lb_backend_address_pool" "CMA_LB_backend_addr_pool" {
#   name            = "CMA-node-pool"
#   loadbalancer_id = data.azurerm_lb.CMA_LB.id
# }

# resource "azurerm_lb_backend_address_pool_address" "CMA_VM" {
#   name                    = "lb_backend_addr_pool_vm_ip"
#   backend_address_pool_id = data.azurerm_lb_backend_address_pool.CMA_LB_backend_addr_pool.id
#   virtual_network_id      = data.azurerm_virtual_network.CyberMainAnalyzer_vnet.id
#   ip_address              = azurerm_network_interface.CyberMailAnalyzer_network_interface.private_ip_address
# }
