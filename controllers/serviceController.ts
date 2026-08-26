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
    // Make sure we only validate the keys that matter for creation, or partial validation
    // because estimated_cost might be missing on creation.
    // wait, Zod schema has default(0) for estimated_cost.
    const validData = validateData(ServiceOrderSchema, data);
    return serviceRepository.addService(validData);
}

function updateServiceStatus(id: number, status: string, notes: string, warrantyDays: number = 0) {
    return serviceRepository.updateServiceStatus(id, status, notes, warrantyDays);
}

function updateServiceDetails(id: number | string, data: ServiceOrder) {
    // For update details, some fields might not be present (like customer_id), so we should use partial validation
    const validData = validateData(ServiceOrderSchema.partial(), data);
    return serviceRepository.updateServiceDetails(id, validData);
}

function deleteService(id: number | string) {
    return serviceRepository.deleteService(id);
}

function addPhoto(serviceOrderId: number, photoType: string, filepath: string) {
    return serviceRepository.addPhoto(serviceOrderId, photoType, filepath);
}

function getPhotos(serviceOrderId: number) {
    return serviceRepository.getPhotos(serviceOrderId);
}

function deletePhoto(id: number) {
    // maybe we should delete the file from disk here too, or in IPC handler. 
    // IPC handler will call deletePhoto from disk.
    return serviceRepository.deletePhoto(id);
}

function getPhotoById(id: number) {
    return serviceRepository.getPhotoById(id);
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
    addPhoto,
    getPhotos,
    deletePhoto,
    getPhotoById,
    checkWarranty
 };
