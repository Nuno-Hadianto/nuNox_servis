import type { User, Customer, Device, ServiceOrder, Part, ServiceItem, Payment, Settings } from '../shared/types';
import {  contextBridge, ipcRenderer  } from 'electron';

const invokeSafe = async (channel: string, ...args: unknown[]) => {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error: unknown) {
    if (error instanceof Error && error.message) {
      error.message = error.message.replace(/Error invoking remote method '.*?':\s*(Error:\s*)?/, '');
    }
    throw error;
  }
};

contextBridge.exposeInMainWorld('api', {
  appReady: () => ipcRenderer.send('app-ready'),
  getDashboardStats: () => invokeSafe('get-dashboard-stats'),
  getAlerts: () => invokeSafe('get-alerts'),
  
  // Customers
  getCustomers: (searchQuery: string, page: number, limit: number) => invokeSafe('get-customers', searchQuery, page, limit),
  getCustomer: (id: number) => invokeSafe('get-customer', id),
  addCustomer: (data: Omit<Customer, 'id'>) => invokeSafe('add-customer', data),
  updateCustomer: (id: number, data: Partial<Customer>) => invokeSafe('update-customer', id, data),
  deleteCustomer: (id: number) => invokeSafe('delete-customer', id),

  // Devices
  getDevices: (searchQuery: string) => invokeSafe('get-devices', searchQuery),
  getDevice: (id: number) => invokeSafe('get-device', id),
  getDevicesByCustomer: (customerId: number) => invokeSafe('get-devices-by-customer', customerId),
  addDevice: (data: Omit<Device, 'id'>) => invokeSafe('add-device', data),
  updateDevice: (id: number, data: Partial<Device>) => invokeSafe('update-device', id, data),
  deleteDevice: (id: number) => invokeSafe('delete-device', id),

  // Services
  getServices: (searchQuery: string, page: number, limit: number) => invokeSafe('get-services', searchQuery, page, limit),
  getService: (id: number) => invokeSafe('get-service', id),
  getServiceByTicket: (ticket: string) => invokeSafe('get-service-by-ticket', ticket),
  getServiceHistory: (id: number) => invokeSafe('get-service-history', id),
  addService: (data: Omit<ServiceOrder, 'id'>) => invokeSafe('add-service', data),
  updateServiceStatus: (id: number, status: string, notes: string, warrantyDays: number = 0) => invokeSafe('update-service-status', id, status, notes, warrantyDays),
  updateServiceDetails: (id: number, data: Partial<ServiceOrder>) => invokeSafe('update-service-details', id, data),
  deleteService: (id: number) => invokeSafe('delete-service', id),

  // Warranty
  checkWarranty: (deviceId: number) => invokeSafe('check-warranty', deviceId),

  // Photos
  uploadPhoto: (serviceId: number, type: string, buffer: ArrayBuffer, fileName: string) => invokeSafe('upload-photo', serviceId, type, buffer, fileName),
  getPhotos: (serviceId: number) => invokeSafe('get-photos', serviceId),
  deletePhoto: (id: number) => invokeSafe('delete-photo', id),

  // Parts
  getParts: (searchQuery: string) => invokeSafe('get-parts', searchQuery),
  getPart: (id: number) => invokeSafe('get-part', id),
  addPart: (data: Omit<Part, 'id'>) => invokeSafe('add-part', data),
  updatePart: (id: number, data: Partial<Part>) => invokeSafe('update-part', id, data),
  updatePartStock: (id: number, change: number, reason?: string, ref_id?: string) => invokeSafe('update-part-stock', id, change, reason, ref_id),
  deletePart: (id: number) => invokeSafe('delete-part', id),
  importPartsExcel: () => invokeSafe('import-parts-excel'),
  getLowStockParts: (threshold: number) => invokeSafe('get-low-stock-parts', threshold),
  getPartLogs: (id: number) => invokeSafe('get-part-logs', id),

  // Service Items
  getServiceItems: (serviceId: number) => invokeSafe('get-service-items', serviceId),
  addServiceItem: (data: Omit<ServiceItem, 'id'>) => invokeSafe('add-service-item', data),
  deleteServiceItem: (id: number) => invokeSafe('delete-service-item', id),

  // Payments
  getPayments: (serviceId: number) => invokeSafe('get-payments', serviceId),
  addPayment: (data: Omit<Payment, 'id'>) => invokeSafe('add-payment', data),
  deletePayment: (id: number) => invokeSafe('delete-payment', id),

  // Settings
  getSettings: () => invokeSafe('get-settings'),
  updateSettings: (data: Settings) => invokeSafe('update-settings', data),

  // Reports
  getIncomeReport: (start: string, end: string) => invokeSafe('get-income-report', start, end),
  getCompletedServices: (start: string, end: string) => invokeSafe('get-completed-services', start, end),
  getTopSpareparts: (start: string, end: string) => invokeSafe('get-top-spareparts', start, end),
  getReportBreakdown: (start: string, end: string) => invokeSafe('get-report-breakdown', start, end),


  // Backup & Restore
  backupDatabase: () => invokeSafe('backup-database'),
  restoreDatabase: () => invokeSafe('restore-database'),
  testGdrive: (creds: string, folderId: string) => invokeSafe('test-gdrive', creds, folderId),
  selectDirectory: () => invokeSafe('select-directory'),

  // Export
  exportExcel: (data: unknown) => invokeSafe('export-excel', data),
  exportPdf: (data: unknown) => invokeSafe('export-pdf', data),
  openExternalUrl: (url: string) => invokeSafe('open-external-url', url),
  getLogoBase64: () => invokeSafe('get-logo-base64'),
  showNotification: (title: string, body: string) => invokeSafe('show-notification', { title, body }),
  
  // Print & Preview
  printPreview: (options: Record<string, unknown>) => invokeSafe('print-preview', options),
  getPrinters: () => invokeSafe('get-printers'),
  silentPrint: (options: Record<string, unknown>) => invokeSafe('silent-print', options),

  // Users & Auth
  login: (username: string, password: string) => invokeSafe('login', username, password),
  getUsers: () => invokeSafe('get-users'),
  getUser: (id: number) => invokeSafe('get-user', id),
  addUser: (data: Omit<User, 'id'>) => invokeSafe('add-user', data),
  updateUser: (id: number, data: Partial<User>) => invokeSafe('update-user', id, data),
  deleteUser: (id: number) => invokeSafe('delete-user', id),

  // Updater
  checkForUpdates: () => invokeSafe('check-for-updates'),
  installUpdate: () => invokeSafe('install-update'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdaterEvent: (callback: (event: unknown, data: any) => void) => {
    ipcRenderer.on('updater-event', callback);
  },
  removeUpdaterEvents: () => {
    ipcRenderer.removeAllListeners('updater-event');
  }
});
