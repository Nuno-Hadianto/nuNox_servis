"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcMain } = require('electron');
const customerController = require('../../controllers/customerController');
const { validateData, CustomerSchema } = require('../../src/utils/validators');
function registerCustomerIpc() {
    ipcMain.handle('get-customers', (event, searchQuery, page, limit) => customerController.getCustomers(searchQuery, page, limit));
    ipcMain.handle('get-customer', (event, id) => customerController.getCustomerById(id));
    ipcMain.handle('add-customer', (event, data) => {
        const validData = validateData(CustomerSchema, data);
        return customerController.addCustomer(validData);
    });
    ipcMain.handle('update-customer', (event, id, data) => {
        // For partial updates, we might want a Partial schema, but since the form usually sends everything, we'll validate.
        // However, since it's Partial<Customer>, we can use CustomerSchema.partial()
        const validData = validateData(CustomerSchema.partial(), data);
        return customerController.updateCustomer(id, validData);
    });
    ipcMain.handle('delete-customer', (event, id) => customerController.deleteCustomer(id));
}
module.exports = { registerCustomerIpc };
