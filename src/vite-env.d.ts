/// <reference types="vite/client" />
import type { User, Customer, Device, ServiceOrder, Part, ServiceItem, Payment, Settings, Receipt } from '../shared/types';

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    api: {
      appReady: () => void;
      getDashboardStats: () => Promise<any>;
      
      // Customers
      getCustomers: (searchQuery: string, page: number, limit: number) => Promise<{ data: Customer[], total: number }>;
      getCustomer: (id: number) => Promise<Customer>;
      addCustomer: (data: Omit<Customer, 'id'>) => Promise<number>;
      updateCustomer: (id: number, data: Partial<Customer>) => Promise<number>;
      deleteCustomer: (id: number) => Promise<number>;

      // Devices
      getDevices: (searchQuery: string) => Promise<Device[]>;
      getDevice: (id: number) => Promise<Device>;
      getDevicesByCustomer: (customerId: number) => Promise<Device[]>;
      addDevice: (data: Omit<Device, 'id'>) => Promise<number>;
      updateDevice: (id: number, data: Partial<Device>) => Promise<number>;
      deleteDevice: (id: number) => Promise<number>;

      // Services
      getServices: (searchQuery: string, page: number, limit: number) => Promise<{ data: ServiceOrder[], total: number }>;
      getService: (id: number) => Promise<ServiceOrder>;
      getServiceByTicket: (ticket: string) => Promise<ServiceOrder>;
      getServiceHistory: (id: number) => Promise<any[]>;
      addService: (data: Omit<ServiceOrder, 'id'>) => Promise<number>;
      updateServiceStatus: (id: number, status: string, notes: string, warrantyDays?: number) => Promise<number>;
      updateServiceDetails: (id: number, data: Partial<ServiceOrder>) => Promise<number>;
      deleteService: (id: number) => Promise<number>;
      checkWarranty: (deviceId: number) => Promise<any>;

      // Photos
      uploadPhoto: (serviceId: number, type: string, buffer: ArrayBuffer, fileName: string) => Promise<any>;
      getPhotos: (serviceId: number) => Promise<any[]>;
      deletePhoto: (id: number) => Promise<any>;

      // Parts
      getParts: (searchQuery: string) => Promise<Part[]>;
      getPart: (id: number) => Promise<Part>;
      addPart: (data: Omit<Part, 'id'>) => Promise<number>;
      updatePart: (id: number, data: Partial<Part>) => Promise<number>;
      updatePartStock: (id: number, change: number) => Promise<number>;
      deletePart: (id: number) => Promise<number>;
      importPartsExcel: () => Promise<any>;
      getLowStockParts: (threshold: number) => Promise<Part[]>;

      // Service Items
      getServiceItems: (serviceId: number) => Promise<ServiceItem[]>;
      addServiceItem: (data: Omit<ServiceItem, 'id'>) => Promise<number>;
      deleteServiceItem: (id: number) => Promise<number>;

      // Payments
      getPayments: (serviceId: number) => Promise<Payment[]>;
      addPayment: (data: Omit<Payment, 'id'>) => Promise<number>;
      deletePayment: (id: number) => Promise<number>;

      // Settings
      getSettings: () => Promise<Settings>;
      updateSettings: (data: Settings) => Promise<number>;

      // Reports
      getIncomeReport: (start: string, end: string) => Promise<any[]>;
      getCompletedServices: (start: string, end: string) => Promise<any[]>;
      getTopSpareparts: (start: string, end: string) => Promise<any[]>;

      // Sales
      createSale: (saleData: any, items: any[]) => Promise<{ success: boolean, saleId?: number, error?: string }>;
      getSales: (startDate?: string, endDate?: string) => Promise<any[]>;
      getSale: (saleId: number | string) => Promise<any>;
      getSaleItems: (saleId: number | string) => Promise<any[]>;

      // Backup & Utilities
      backupDatabase: () => Promise<any>;
      restoreDatabase: () => Promise<any>;
      selectDirectory: () => Promise<string | null>;
      exportExcel: (data: any) => Promise<any>;
      exportPdf: (data: any) => Promise<any>;
      openExternalUrl: (url: string) => Promise<any>;
      getLogoBase64: () => Promise<any>;
      printPreview: (options: any) => Promise<any>;

      // Auth
      login: (u: string, p: string) => Promise<{ success: boolean, user?: User, error?: string }>;
      getUsers: () => Promise<User[]>;
      getUser: (id: number) => Promise<User>;
      addUser: (data: Omit<User, 'id'>) => Promise<{ success: boolean, id?: number, error?: string }>;
      updateUser: (id: number, data: Partial<User>) => Promise<{ success: boolean, result?: number, error?: string }>;
      deleteUser: (id: number) => Promise<{ success: boolean, result?: number, error?: string }>;
    }
    Swal: any;
    Chart: any;
  }
}
