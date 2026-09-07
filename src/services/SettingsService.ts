import type { Settings } from '../../shared/types'

export const SettingsService = {
  async getSettings(): Promise<Settings> {
    if (!window.api?.getSettings) throw new Error('API not available')
    return window.api.getSettings()
  },

  async updateSettings(data: Settings): Promise<number> {
    if (!window.api?.updateSettings) throw new Error('API not available')
    return window.api.updateSettings(data)
  }
}
