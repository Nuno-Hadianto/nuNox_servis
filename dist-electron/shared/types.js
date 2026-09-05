"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.ServiceStatus = void 0;
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["DITERIMA"] = "Diterima";
    ServiceStatus["PROSES_PERBAIKAN"] = "Proses Perbaikan";
    ServiceStatus["MENUNGGU_SPAREPART"] = "Menunggu Sparepart";
    ServiceStatus["SELESAI_BELUM_DIAMBIL"] = "Selesai (Belum Diambil)";
    ServiceStatus["SELESAI_SUDAH_DIAMBIL"] = "Selesai (Sudah Diambil)";
    ServiceStatus["BATAL"] = "Batal";
    ServiceStatus["DIBATALKAN"] = "Dibatalkan";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["BELUM_LUNAS"] = "Belum Lunas";
    PaymentStatus["LUNAS"] = "Lunas";
    PaymentStatus["DP"] = "DP / Sebagian";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
