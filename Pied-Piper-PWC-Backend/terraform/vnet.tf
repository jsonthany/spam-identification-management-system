data "azurerm_subnet" "CyberMailAnalyzer_subnet" {
    name                 = "default"
    virtual_network_name = data.azurerm_virtual_network.CyberMainAnalyzer_vnet.name
    resource_group_name  = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.name
}

data "azurerm_virtual_network" "CyberMainAnalyzer_vnet" {
    name                = "CyberMailAnalyzer-vnet"
    resource_group_name = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.name
}

data "azurerm_resource_group" "CyberMailAnalyzer_resource_group" {
    name = "CyberMailAnalyzer"
}