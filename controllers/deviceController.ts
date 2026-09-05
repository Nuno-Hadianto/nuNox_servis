import { Device } from '../shared/types';
import * as deviceRepository from '../repositories/deviceRepository';
import {  DeviceSchema, validateData  } from '../src/utils/validators';

function getDevices(searchQuery = '', sortBy = 'name_asc') {
    return deviceRepository.getDevices(searchQuery, sortBy);
}

function getDeviceById(id: number | string) {
    return deviceRepository.getDeviceById(id);
}

function getDevicesByCustomerId(customerId: number | string) {
    return deviceRepository.getDevicesByCustomerId(customerId);
}

function addDevice(data: Device) {
    const validData = validateData(DeviceSchema, data) as Device;
    return deviceRepository.addDevice(validData);
}

function updateDevice(id: number | string, data: Device) {
    const validData = validateData(DeviceSchema, data) as Device;
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
