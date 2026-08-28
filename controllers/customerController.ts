import { Customer } from '../shared/types';
import * as customerRepository from '../repositories/customerRepository';
import {  CustomerSchema, validateData  } from '../src/utils/validators';

function getCustomers(searchQuery: string = '', page: number = 1, limit: number = 50) {
    return customerRepository.getCustomers(searchQuery, page, limit);
}

function getCustomerById(id: number | string) {
    return customerRepository.getCustomerById(id);
}

function addCustomer(data: Customer) {
    const validData = validateData(CustomerSchema, data) as Customer;
    return customerRepository.addCustomer(validData);
}

function updateCustomer(id: number | string, data: Customer) {
    const validData = validateData(CustomerSchema, data) as Customer;
    return customerRepository.updateCustomer(id, validData);
}

function deleteCustomer(id: number | string) {
    const hasServiceOrders = customerRepository.checkCustomerHasServiceOrders(id);
    if (hasServiceOrders) {
        throw new Error("Pelanggan tidak bisa dihapus karena masih memiliki riwayat tiket servis.");
    }
    return customerRepository.deleteCustomer(id);
}

export { 
    getCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer
 };
