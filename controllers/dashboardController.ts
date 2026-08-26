import * as dashboardRepository from '../repositories/dashboardRepository';

function getDashboardStats() {
    return dashboardRepository.getDashboardStats();
}

export { 
    getDashboardStats
 };
