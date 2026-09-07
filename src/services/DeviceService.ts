import type { Device } from '../../shared/types'

export const DeviceService = {
  async getAll(searchQuery: string, sortBy?: string): Promise<Device[]> {
    if (!window.api?.getDevices) throw new Error('API not available')
    return window.api.getDevices(searchQuery, sortBy)
  },

  async getById(id: number): Promise<Device> {
    if (!window.api?.getDevice) throw new Error('API not available')
    return window.api.getDevice(id)
  },

  async getByCustomer(customerId: number): Promise<Device[]> {
    if (!window.api?.getDevicesByCustomer) throw new Error('API not available')
    return window.api.getDevicesByCustomer(customerId)
  },

  async create(data: Omit<Device, 'id'>): Promise<number> {
    if (!window.api?.addDevice) throw new Error('API not available')
    return window.api.addDevice(data)
  },

  async update(id: number, data: Partial<Device>): Promise<number> {
    if (!window.api?.updateDevice) throw new Error('API not available')
    return window.api.updateDevice(id, data)
  },

  async delete(id: number): Promise<number> {
    if (!window.api?.deleteDevice) throw new Error('API not available')
    return window.api.deleteDevice(id)
  }
}
