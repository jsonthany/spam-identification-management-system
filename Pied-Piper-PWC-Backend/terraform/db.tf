data "azurerm_resource_group" "CMA_Resource_Group" {
  name     = "CyberMailAnalyzer"
}

data "azurerm_virtual_network" "CMA_vNet" {
  name                = "CyberMailAnalyzer-vnet"
  resource_group_name = data.azurerm_resource_group.CMA_Resource_Group.name
}

resource "azurerm_postgresql_flexible_server" "CMA_db" {
    name                          = "${var.prefix}-db"
    resource_group_name           = data.azurerm_resource_group.CMA_Resource_Group.name
    location                      = data.azurerm_resource_group.CMA_Resource_Group.location
    administrator_login           = var.db_default_user
    administrator_password        = var.db_default_password
    zone                          = "2"
    version = 13
    storage_mb = 32768

    sku_name   = "B_Standard_B1ms"

}

resource "azurerm_postgresql_flexible_server_firewall_rule" "CMA_db_firewall_rule" {
  name                = "${var.prefix}_allow_all_ips"     # Must allow all IPs as we don't have a VPN set up
  server_id           = azurerm_postgresql_flexible_server.CMA_db.id
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}