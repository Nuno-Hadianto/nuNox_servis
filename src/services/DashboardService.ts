import type { DashboardStats } from '../../shared/types'

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (!window.api?.getDashboardStats) throw new Error('API not available')
    return window.api.getDashboardStats()
  },

  async getAlerts(): Promise<unknown[]> {
    if (!window.api?.getAlerts) throw new Error('API not available')
    return window.api.getAlerts()
  }
}
