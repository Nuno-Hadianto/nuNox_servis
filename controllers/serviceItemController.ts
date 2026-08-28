import { ServiceItem } from '../shared/types';
import * as serviceItemRepository from '../repositories/serviceItemRepository';
import {  ServiceItemSchema, validateData  } from '../src/utils/validators';

function getServiceItems(serviceOrderId: number | string) {
    return serviceItemRepository.getServiceItems(serviceOrderId);
}

function addServiceItem(data: ServiceItem) {
    const validData = validateData(ServiceItemSchema, data) as ServiceItem;
    return serviceItemRepository.addServiceItem(validData);
}

function deleteServiceItem(id: number | string) {
    return serviceItemRepository.deleteServiceItem(id);
}

export { 
    getServiceItems,
    addServiceItem,
    deleteServiceItem
 };
