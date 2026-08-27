import { Payment } from '../shared/types';
import * as paymentRepository from '../repositories/paymentRepository';
import {  PaymentSchema, validateData  } from '../src/utils/validators';

function getPaymentsByServiceId(serviceOrderId: number) {
    return paymentRepository.getPaymentsByServiceId(serviceOrderId);
}

function addPayment(data: Omit<Payment, 'id'>) {
    const validData = validateData(PaymentSchema, data) as Omit<Payment, 'id'>;
    return paymentRepository.addPayment(validData);
}

function deletePayment(id: number | string) {
    return paymentRepository.deletePayment(id);
}

function updateServicePaymentStatus(serviceOrderId: number) {
    return paymentRepository.updateServicePaymentStatus(serviceOrderId);
}

export { 
    getPaymentsByServiceId,
    addPayment,
    deletePayment,
    updateServicePaymentStatus
 };
