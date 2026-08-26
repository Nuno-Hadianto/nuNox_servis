import { Settings } from '../shared/types';
import * as settingsRepository from '../repositories/settingsRepository';

function getSettings() {
    return settingsRepository.getSettings();
}

function updateSettings(data) {
    return settingsRepository.updateSettings(data);
}

export { 
    getSettings,
    updateSettings
 };
