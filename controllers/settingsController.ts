import * as settingsRepository from '../repositories/settingsRepository';

import type { Settings } from '../shared/types';

function getSettings() {
    return settingsRepository.getSettings();
}

function updateSettings(data: Settings) {
    return settingsRepository.updateSettings(data as unknown as Record<string, string | number | boolean>);
}

export { 
    getSettings,
    updateSettings
 };
