import * as reportRepository from '../repositories/reportRepository';

function getIncomeReport(startDate, endDate) {
    return reportRepository.getIncomeReport(startDate, endDate);
}

function getCompletedServices(startDate, endDate) {
    return reportRepository.getCompletedServices(startDate, endDate);
}

function getTopSpareparts(startDate, endDate) {
    return reportRepository.getTopSpareparts(startDate, endDate);
}

export { 
    getIncomeReport,
    getCompletedServices,
    getTopSpareparts
 };
