import { BrowserWindow } from 'electron';
import type { SystemEvent } from '../../shared/types';
import log from 'electron-log';

export const EventBus = {
  /**
   * Mengirim event ke semua window aktif
   */
  broadcast(event: SystemEvent) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('system-event', event);
      }
    });
    
    // Log juga di backend
    if (event.level === 'error') {
      log.error(`[EventBus] ${event.type}: ${event.message}`);
    } else {
      log.info(`[EventBus] ${event.type}: ${event.message}`);
    }
  },

  /**
   * Helper untuk mengirim toast
   */
  sendToast(level: 'info' | 'success' | 'warning' | 'error', message: string) {
    this.broadcast({
      type: 'toast',
      level,
      message
    });
  }
};
