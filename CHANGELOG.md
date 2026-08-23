# Changelog

Semua perubahan yang signifikan pada proyek ini akan didokumentasikan di file ini.

Format pencatatan ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), dan proyek ini menganut versi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Fitur peringatan otomatis untuk barang yang terlantar (*abandoned services*) dan stok menipis (*low stock*).
- Integrasi Drizzle ORM untuk manajemen skema database SQLite.
- *End-to-End Testing* menggunakan Playwright untuk memvalidasi *UI state*.
- GitHub Actions untuk CI/CD (E2E Tests, Build Release).
- Pengaturan Git Hooks dengan `husky` dan `lint-staged` untuk standarisasi kode.
- Panduan arsitektur lokal (`docs/ARCHITECTURE.md`).

### Changed
- *Refactoring* sistem antarmuka utama (UI) ke desain yang lebih modern (*Glassmorphism*) dan membersihkan seluruh penggunaan tipe `any` pada Typescript untuk jaminan *type-safety*.

### Fixed
- Memperbaiki parsing data pada *import* Excel di `partRepository` (sekarang menggunakan konversi String untuk menangani nilai alfanumerik yang kosong atau tidak valid).

## [1.0.0] - 2024-03-01
### Added
- Rilis awal (Initial Release) aplikasi POS dan Manajemen Servis nuNox Servis.
- Fitur transaksi POS, riwayat servis, serta pengelolaan sparepart secara lokal.
- Fungsi ekspor data (laporan PDF) dan fitur pengiriman *template* tagihan via WhatsApp.
