import * as reportRepository from '../repositories/reportRepository';

function getIncomeReport(startDate: string, endDate: string) {
    return reportRepository.getIncomeReport(startDate, endDate);
}

function getCompletedServices(startDate: string, endDate: string) {
    return reportRepository.getCompletedServices(startDate, endDate);
}

function getTopSpareparts(startDate: string, endDate: string) {
    return reportRepository.getTopSpareparts(startDate, endDate);
}

function getReportBreakdown(startDate: string, endDate: string) {
    return reportRepository.getReportBreakdown(startDate, endDate);
}

export { 
    getIncomeReport,
    getCompletedServices,
    getTopSpareparts,
    getReportBreakdown
 };
