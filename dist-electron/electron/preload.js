"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const invokeSafe = async (channel, ...args) => {
    try {
        return await electron_1.ipcRenderer.invoke(channel, ...args);
    }
    catch (error) {
        if (error instanceof Error && error.message) {
            error.message = error.message.replace(/Error invoking remote method '.*?':\s*(Error:\s*)?/, '');
        }
        throw error;
    }
};
electron_1.contextBridge.exposeInMainWorld('api', {
    appReady: () => electron_1.ipcRenderer.send('app-ready'),
    getDashboardStats: () => invokeSafe('get-dashboard-stats'),
    getAlerts: () => invokeSafe('get-alerts'),
    // Customers
    getCustomers: (searchQuery, page, limit) => invokeSafe('get-customers', searchQuery, page, limit),
    getCustomer: (id) => invokeSafe('get-customer', id),
    addCustomer: (data) => invokeSafe('add-customer', data),
    updateCustomer: (id, data) => invokeSafe('update-customer', id, data),
    deleteCustomer: (id) => invokeSafe('delete-customer', id),
    // Devices
    getDevices: (searchQuery) => invokeSafe('get-devices', searchQuery),
    getDevice: (id) => invokeSafe('get-device', id),
    getDevicesByCustomer: (customerId) => invokeSafe('get-devices-by-customer', customerId),
    addDevice: (data) => invokeSafe('add-device', data),
    updateDevice: (id, data) => invokeSafe('update-device', id, data),
    deleteDevice: (id) => invokeSafe('delete-device', id),
    // Services
    getServices: (searchQuery, page, limit) => invokeSafe('get-services', searchQuery, page, limit),
    getService: (id) => invokeSafe('get-service', id),
    getServiceByTicket: (ticket) => invokeSafe('get-service-by-ticket', ticket),
    getServiceHistory: (id) => invokeSafe('get-service-history', id),
    addService: (data) => invokeSafe('add-service', data),
    updateServiceStatus: (id, status, notes, warrantyDays = 0) => invokeSafe('update-service-status', id, status, notes, warrantyDays),
    updateServiceDetails: (id, data) => invokeSafe('update-service-details', id, data),
    deleteService: (id) => invokeSafe('delete-service', id),
    // Warranty
    checkWarranty: (deviceId) => invokeSafe('check-warranty', deviceId),
    // Parts
    getParts: (searchQuery) => invokeSafe('get-parts', searchQuery),
    getPart: (id) => invokeSafe('get-part', id),
    addPart: (data) => invokeSafe('add-part', data),
    updatePart: (id, data) => invokeSafe('update-part', id, data),
    updatePartStock: (id, change, reason, ref_id) => invokeSafe('update-part-stock', id, change, reason, ref_id),
    deletePart: (id) => invokeSafe('delete-part', id),
    getLowStockParts: (threshold) => invokeSafe('get-low-stock-parts', threshold),
    getPartLogs: (id) => invokeSafe('get-part-logs', id),
    // Service Items
    getServiceItems: (serviceId) => invokeSafe('get-service-items', serviceId),
    addServiceItem: (data) => invokeSafe('add-service-item', data),
    deleteServiceItem: (id) => invokeSafe('delete-service-item', id),
    // Payments
    getPayments: (serviceId) => invokeSafe('get-payments', serviceId),
    addPayment: (data) => invokeSafe('add-payment', data),
    deletePayment: (id) => invokeSafe('delete-payment', id),
    // Settings
    getSettings: () => invokeSafe('get-settings'),
    updateSettings: (data) => invokeSafe('update-settings', data),
    // Reports
    getIncomeReport: (start, end) => invokeSafe('get-income-report', start, end),
    getCompletedServices: (start, end) => invokeSafe('get-completed-services', start, end),
    getTopSpareparts: (start, end) => invokeSafe('get-top-spareparts', start, end),
    getReportBreakdown: (start, end) => invokeSafe('get-report-breakdown', start, end),
    // Backup & Restore
    getDbSize: () => invokeSafe('get-db-size'),
    backupDatabase: () => invokeSafe('backup-database'),
    restoreDatabase: () => invokeSafe('restore-database'),
    testGdrive: (creds, folderId) => invokeSafe('test-gdrive', creds, folderId),
    selectDirectory: () => invokeSafe('select-directory'),
    // Export
    exportPdf: (data) => invokeSafe('export-pdf', data),
    openExternalUrl: (url) => invokeSafe('open-external-url', url),
    getLogoBase64: () => invokeSafe('get-logo-base64'),
    showNotification: (title, body) => invokeSafe('show-notification', { title, body }),
    // Print & Preview
    printPreview: (options) => invokeSafe('print-preview', options),
    getPrinters: () => invokeSafe('get-printers'),
    silentPrint: (options) => invokeSafe('silent-print', options),
    // Users & Auth
    login: (username, password) => invokeSafe('login', username, password),
    getUsers: () => invokeSafe('get-users'),
    getUser: (id) => invokeSafe('get-user', id),
    addUser: (data) => invokeSafe('add-user', data),
    updateUser: (id, data) => invokeSafe('update-user', id, data),
    deleteUser: (id) => invokeSafe('delete-user', id),
    // Updater
    checkForUpdates: () => invokeSafe('check-for-updates'),
    installUpdate: () => invokeSafe('install-update'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdaterEvent: (callback) => {
        electron_1.ipcRenderer.on('updater-event', callback);
    },
    removeUpdaterEvents: () => {
        electron_1.ipcRenderer.removeAllListeners('updater-event');
    }
});
