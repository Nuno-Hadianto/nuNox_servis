/// <reference types="vite/client" />
import type {
  User,
  Customer,
  Device,
  ServiceOrder,
  Part,
  ServiceItem,
  Payment,
  Settings,
  DashboardStats,
  ServiceHistory,
  Photo,
  Sale,
  SaleItem
} from '../shared/types'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare global {
  interface Window {
    api: {
      appReady: () => void
      getDashboardStats: () => Promise<DashboardStats>

      // Customers
      getCustomers: (
        searchQuery: string,
        page: number,
        limit: number
      ) => Promise<{ data: Customer[]; total: number; page: number }>
      getCustomer: (id: number) => Promise<Customer>
      addCustomer: (data: Omit<Customer, 'id'>) => Promise<number>
      updateCustomer: (id: number, data: Partial<Customer>) => Promise<number>
      deleteCustomer: (id: number) => Promise<number>

      // Devices
      getDevices: (searchQuery: string) => Promise<Device[]>
      getDevice: (id: number) => Promise<Device>
      getDevicesByCustomer: (customerId: number) => Promise<Device[]>
      addDevice: (data: Omit<Device, 'id'>) => Promise<number>
      updateDevice: (id: number, data: Partial<Device>) => Promise<number>
      deleteDevice: (id: number) => Promise<number>

      // Services
      getServices: (
        searchQuery: string,
        page: number,
        limit: number
      ) => Promise<{ data: ServiceOrder[]; total: number; page: number }>
      getService: (id: number) => Promise<ServiceOrder>
      getServiceByTicket: (ticket: string) => Promise<ServiceOrder>
      getServiceHistory: (id: number) => Promise<ServiceHistory[]>
      addService: (data: Partial<ServiceOrder>) => Promise<number>
      updateServiceStatus: (
        id: number,
        status: string,
        notes: string,
        warrantyDays?: number
      ) => Promise<number>
      updateServiceDetails: (id: number, data: Partial<ServiceOrder>) => Promise<number>
      deleteService: (id: number) => Promise<number>
      checkWarranty: (deviceId: number) => Promise<{ status: string; days_left?: number; message?: string }>

      // Photos
      uploadPhoto: (
        serviceId: number,
        type: string,
        buffer: ArrayBuffer,
        fileName: string
      ) => Promise<{ success: boolean; id?: number; error?: string }>
      getPhotos: (serviceId: number) => Promise<Photo[]>
      deletePhoto: (id: number) => Promise<{ success: boolean; error?: string }>

      // Parts
      getParts: (searchQuery: string) => Promise<Part[]>
      getPart: (id: number) => Promise<Part>
      addPart: (data: Omit<Part, 'id'>) => Promise<number>
      updatePart: (id: number, data: Partial<Part>) => Promise<number>
      updatePartStock: (id: number, change: number) => Promise<number>
      deletePart: (id: number) => Promise<number>
      importPartsExcel: () => Promise<{ success: boolean; error?: string }>
      getLowStockParts: (threshold: number) => Promise<Part[]>

      // Service Items
      getServiceItems: (serviceId: number) => Promise<ServiceItem[]>
      addServiceItem: (data: Omit<ServiceItem, 'id'>) => Promise<number>
      deleteServiceItem: (id: number) => Promise<number>

      // Payments
      getPayments: (serviceId: number) => Promise<Payment[]>
      addPayment: (data: Omit<Payment, 'id'>) => Promise<number>
      deletePayment: (id: number) => Promise<number>

      // Settings
      getSettings: () => Promise<Settings>
      updateSettings: (data: Settings) => Promise<number>

      // Reports
      getIncomeReport: (start: string, end: string) => Promise<Record<string, unknown>[]>
      getCompletedServices: (start: string, end: string) => Promise<Record<string, unknown>[]>
      getTopSpareparts: (start: string, end: string) => Promise<Record<string, unknown>[]>

      // Sales
      createSale: (
        saleData: Sale,
        items: SaleItem[]
      ) => Promise<{ success: boolean; saleId?: number; error?: string }>
      getSales: (startDate?: string, endDate?: string) => Promise<Sale[]>
      getSale: (saleId: number | string) => Promise<Sale>
      getSaleItems: (saleId: number | string) => Promise<SaleItem[]>

      // Backup & Utilities
      backupDatabase: () => Promise<boolean>
      restoreDatabase: () => Promise<boolean>
      selectDirectory: () => Promise<string | null>
      exportExcel: (data: Record<string, unknown>[]) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>
      exportPdf: (data: { html: string; filename: string }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>
      openExternalUrl: (url: string) => Promise<boolean>
      getLogoBase64: () => Promise<string | null>
      printPreview: (options: Record<string, unknown>) => Promise<boolean>

      // Auth
      login: (u: string, p: string) => Promise<{ success: boolean; user?: User; error?: string }>
      getUsers: () => Promise<User[]>
      getUser: (id: number) => Promise<User>
      addUser: (
        data: Omit<User, 'id'>
      ) => Promise<{ success: boolean; id?: number; error?: string }>
      updateUser: (
        id: number,
        data: Partial<User>
      ) => Promise<{ success: boolean; result?: number; error?: string }>
      deleteUser: (id: number) => Promise<{ success: boolean; result?: number; error?: string }>
    }
    Swal: unknown
  }
}
