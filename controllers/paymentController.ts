import { Payment } from '../shared/types';
import * as paymentRepository from '../repositories/paymentRepository';
import {  PaymentSchema, validateData  } from '../src/utils/validators';

function getPaymentsByServiceId(serviceOrderId) {
    return paymentRepository.getPaymentsByServiceId(serviceOrderId);
}

function addPayment(data: Payment) {
    const validData = validateData(PaymentSchema, data) as any;
    return paymentRepository.addPayment(validData);
}

function deletePayment(id: number | string) {
    return paymentRepository.deletePayment(id);
}

function updateServicePaymentStatus(serviceOrderId) {
    return paymentRepository.updateServicePaymentStatus(serviceOrderId);
}

export { 
    getPaymentsByServiceId,
    addPayment,
    deletePayment,
    updateServicePaymentStatus
 };
