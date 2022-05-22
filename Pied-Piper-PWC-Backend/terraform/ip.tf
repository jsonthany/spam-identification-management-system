data "azurerm_public_ip" "CMA_LB_IP" {
  name                = "CMA-LB-IP"
  resource_group_name = "CyberMailAnalyzer"
}
