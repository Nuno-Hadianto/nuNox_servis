import * as settingsRepository from '../repositories/settingsRepository';

function getSettings() {
    return settingsRepository.getSettings();
}

function updateSettings(data: Record<string, string>) {
    return settingsRepository.updateSettings(data);
}

export { 
    getSettings,
    updateSettings
 };
