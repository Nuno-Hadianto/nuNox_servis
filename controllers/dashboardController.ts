import * as dashboardRepository from '../repositories/dashboardRepository';

function getDashboardStats() {
    return dashboardRepository.getDashboardStats();
}

function getAlerts() {
    return dashboardRepository.getAlerts();
}

export { 
    getDashboardStats,
    getAlerts
 };
