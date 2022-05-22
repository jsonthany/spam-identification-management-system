resource "azurerm_virtual_machine" "CyberMailAnalyzer_virtual_machine" {
  name                  = "${var.prefix}-vm-${formatdate("DD-MM-YYYY-hh-mm", timeadd(timestamp(), "-8h"))}"
  location              = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.location
  resource_group_name   = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.name
  network_interface_ids = [azurerm_network_interface.CyberMailAnalyzer_network_interface.id]
  vm_size               = "Standard_B1s"

  delete_os_disk_on_termination    = true
  delete_data_disks_on_termination = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }
  storage_os_disk {
    name              = "${var.prefix}_vm_${formatdate("DD-MM-YYYY-hh-mm", timeadd(timestamp(), "-8h"))}_OsDisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
    disk_size_gb      = 30
  }
  os_profile {
    computer_name  = "${var.prefix}-vm-${formatdate("DD-MM-YYYY-hh-mm", timeadd(timestamp(), "-8h"))}"
    admin_username = "azureuser"
    custom_data    = file("scripts/vm_init.sh")
  }
  os_profile_linux_config {
    disable_password_authentication = true
    ssh_keys {
      key_data = data.azurerm_ssh_public_key.PiedPiperSSHKey.public_key
      path     = "/home/azureuser/.ssh/authorized_keys"
    }
  }

  # lifecycle {
  #   create_before_destroy = true
  # }
}

resource "azurerm_network_interface" "CyberMailAnalyzer_network_interface" {
  name                = "${var.prefix}-nic"
  location            = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.location
  resource_group_name = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.name

  ip_configuration {
    name                          = "testconfiguration1"
    subnet_id                     = data.azurerm_subnet.CyberMailAnalyzer_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = data.azurerm_public_ip.CMA_LB_IP.id
  }

  # lifecycle {
  #   create_before_destroy = true
  # }
}

data "azurerm_network_security_group" "CyberMailAnalyzer_nsg" {
  name                = "test2-nsg"
  resource_group_name = data.azurerm_resource_group.CyberMailAnalyzer_resource_group.name
}

resource "azurerm_network_interface_security_group_association" "CMA_nsg_association" {
  network_interface_id      = azurerm_network_interface.CyberMailAnalyzer_network_interface.id
  network_security_group_id = data.azurerm_network_security_group.CyberMailAnalyzer_nsg.id
}

data "azurerm_ssh_public_key" "PiedPiperSSHKey" {
  name                = "PiedPiperSSHKey"
  resource_group_name = "CyberMailAnalyzer"
}
