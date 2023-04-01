resource "azurerm_resource_group" "micronode" {

    name = var.app_name

    location = var.location
}