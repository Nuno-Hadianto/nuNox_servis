import { Device } from '../shared/types';
import * as deviceRepository from '../repositories/deviceRepository';
import {  DeviceSchema, validateData  } from '../src/utils/validators';

function getDevices(searchQuery = '') {
    return deviceRepository.getDevices(searchQuery);
}

function getDeviceById(id: number | string) {
    return deviceRepository.getDeviceById(id);
}

function getDevicesByCustomerId(customerId) {
    return deviceRepository.getDevicesByCustomerId(customerId);
}

function addDevice(data: Device) {
    const validData = validateData(DeviceSchema, data);
    return deviceRepository.addDevice(validData);
}

function updateDevice(id: number | string, data: Device) {
    const validData = validateData(DeviceSchema, data);
    return deviceRepository.updateDevice(id, validData);
}

function deleteDevice(id: number | string) {
    const hasServiceOrders = deviceRepository.checkDeviceHasServiceOrders(id);
    if (hasServiceOrders) {
        throw new Error("Perangkat tidak bisa dihapus karena masih memiliki riwayat tiket servis.");
    }
    return deviceRepository.deleteDevice(id);
}

export { 
    getDevices,
    getDeviceById,
    getDevicesByCustomerId,
    addDevice,
    updateDevice,
    deleteDevice
 };
