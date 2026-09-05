import { ServiceOrder } from '../shared/types';
import * as serviceRepository from '../repositories/serviceRepository';
import {  ServiceOrderSchema, validateData  } from '../src/utils/validators';

function getServices(searchQuery: string = '', page: number = 1, limit: number = 50) {
    return serviceRepository.getServices(searchQuery, page, limit);
}

function getServiceById(id: number | string) {
    return serviceRepository.getServiceById(id);
}

function getServiceByTicketNumber(ticketNumber: string) {
    return serviceRepository.getServiceByTicketNumber(ticketNumber);
}

function getServiceStatusHistory(serviceOrderId: number) {
    return serviceRepository.getServiceStatusHistory(serviceOrderId);
}

function addService(data: ServiceOrder) {
    const validData = validateData(ServiceOrderSchema, data) as ServiceOrder;
    return serviceRepository.addService(validData);
}

function updateServiceStatus(id: number, status: string, notes: string, warrantyDays: number = 0) {
    return serviceRepository.updateServiceStatus(id, status, notes, warrantyDays);
}

function updateServiceDetails(id: number | string, data: ServiceOrder) {
    // For update details, some fields might not be present (like customer_id), so we should use partial validation
    const validData = validateData(ServiceOrderSchema.partial(), data) as ServiceOrder;
    return serviceRepository.updateServiceDetails(id, validData);
}

function deleteService(id: number | string) {
    return serviceRepository.deleteService(id);
}



function checkWarranty(deviceId: number) {
    return serviceRepository.checkWarranty(deviceId);
}

export { 
    getServices,
    getServiceById,
    getServiceByTicketNumber,
    getServiceStatusHistory,
    addService,
    updateServiceStatus,
    updateServiceDetails,
    deleteService,
    checkWarranty
 };
