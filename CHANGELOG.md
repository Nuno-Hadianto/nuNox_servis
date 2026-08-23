# Changelog

Semua perubahan yang signifikan pada proyek ini akan didokumentasikan di file ini.

Format pencatatan ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), dan proyek ini menganut versi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Fitur peringatan otomatis untuk barang yang terlantar (_abandoned services_) dan stok menipis (_low stock_).
- Integrasi Drizzle ORM untuk manajemen skema database SQLite.
- _End-to-End Testing_ menggunakan Playwright untuk memvalidasi _UI state_.
- GitHub Actions untuk CI/CD (E2E Tests, Build Release).
- Pengaturan Git Hooks dengan `husky` dan `lint-staged` untuk standarisasi kode.
- Panduan arsitektur lokal (`docs/ARCHITECTURE.md`).

### Changed

- _Refactoring_ sistem antarmuka utama (UI) ke desain yang lebih modern (_Glassmorphism_) dan membersihkan seluruh penggunaan tipe `any` pada Typescript untuk jaminan _type-safety_.

### Fixed

- Memperbaiki parsing data pada _import_ Excel di `partRepository` (sekarang menggunakan konversi String untuk menangani nilai alfanumerik yang kosong atau tidak valid).

## [1.0.0] - 2024-03-01

### Added

- Rilis awal (Initial Release) aplikasi POS dan Manajemen Servis nuNox Servis.
- Fitur transaksi POS, riwayat servis, serta pengelolaan sparepart secara lokal.
- Fungsi ekspor data (laporan PDF) dan fitur pengiriman _template_ tagihan via WhatsApp.
