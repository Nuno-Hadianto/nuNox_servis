<div align="center">
  <img src="public/img/logo.png" alt="nuNox Servis Logo" height="120" />
  <h1>nuNox Servis</h1>
  <p><strong>Aplikasi Point of Sales (POS) & Manajemen Layanan Servis Komputer/Laptop Offline</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Vue](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
  [![Electron](https://img.shields.io/badge/Electron-Latest-47848F?logo=electron)](https://www.electronjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 📖 Tentang Aplikasi

**nuNox Servis** adalah perangkat lunak desktop *offline* yang dirancang secara khusus untuk memfasilitasi kebutuhan manajemen operasional pada pusat layanan perbaikan (servis) perangkat elektronik, seperti komputer, laptop, dan ponsel pintar. 

Aplikasi ini dikembangkan untuk memberikan solusi terhadap kendala stabilitas konektivitas internet di lapangan. Dengan arsitektur yang beroperasi secara sepenuhnya *offline*, seluruh data pelanggan, riwayat servis, serta laporan keuangan dicatat dan disimpan dengan aman secara lokal di dalam perangkat pengguna. 

## ✨ Fitur Utama

- 📊 **Dashboard Analitik**: Menyediakan ringkasan eksekutif secara *real-time* mengenai status perbaikan, estimasi pendapatan bulanan, serta peringatan otomatis untuk antrean yang tertunda atau peringatan kekurangan ketersediaan suku cadang (*spareparts*).
- 👥 **Manajemen Pelanggan & Integrasi WhatsApp**: Sistem pencatatan basis data pelanggan yang terstruktur. Dilengkapi dengan fungsionalitas untuk mengirim nota tagihan atau pembaruan status servis secara instan melalui WhatsApp Web.
- 🔧 **Pelacakan Siklus Servis (Service Tracking)**: Memantau setiap tahapan operasional secara mendetail, mulai dari *Penerimaan*, *Proses Pengerjaan*, *Selesai*, hingga terminasi pembayaran (uang muka ataupun pelunasan).
- 📦 **Manajemen Inventaris**: Fitur otomatisasi pengurangan stok suku cadang saat digunakan dalam sesi perbaikan. Terintegrasi dengan fitur analitik untuk mengidentifikasi suku cadang yang paling sering digunakan.
- 🖨️ **Pencetakan Bukti Transaksi & Pelaporan**: Fasilitas pencetakan nota cetak (*struk*) untuk pelanggan, serta fitur ekspor laporan keuangan bulanan secara komprehensif ke dalam format dokumen PDF.
- 🔐 **Keamanan & Pencadangan Data**: Menggunakan sistem autentikasi pengguna (Login) dan menyediakan antarmuka pencadangan (*backup*) basis data SQLite yang praktis dan efisien.

## 🚀 Panduan Instalasi (Untuk Pengembang)

Bagi pengembang yang ingin menjalankan, memodifikasi, atau berkontribusi pada basis kode:

### Persyaratan Sistem
- [Node.js](https://nodejs.org/) (Versi 18 atau yang lebih baru)
- Package Manager: `npm` atau `yarn`

### Langkah Instalasi

1. **Kloning Repositori**
   ```bash
   git clone https://github.com/Nuno-Hadianto/nuNox_servis.git
   cd nuNox_servis
   ```

2. **Instalasi Dependensi**
   ```bash
   npm install
   ```

3. **Menjalankan Aplikasi (Mode Development)**
   Aplikasi ini menggunakan kombinasi ekosistem Vite untuk modul antarmuka (Frontend) dan Electron untuk modul sistem inti (Backend). Eksekusi perintah berikut untuk memuat kedua servis secara paralel:
   ```bash
   npm run dev:all
   ```

## 📦 Distribusi Produksi (Build .exe)

Untuk memaketkan kode sumber menjadi aplikasi distribusi mandiri *installer* Windows (`.exe`) yang siap digunakan pada perangkat tanpa dependensi:

```bash
npm run build
```
Berkas eksekusi hasil *build* akan di-generate dan diletakkan di dalam direktori `dist/`.

## 🛠️ Stack Teknologi (Tech Stack)

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Node.js](https://nodejs.org/) + [Electron](https://www.electronjs.org/)
- **Database**: [SQLite](https://sqlite.org/) (mengimplementasikan modul `better-sqlite3`). Dipilih karena kinerjanya yang ringan, terisolasi secara lokal, serta tidak memerlukan konfigurasi peladen khusus.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) untuk standarisasi skema database, migrasi asinkron, dan keamanan tipe data (*type-safety*).

## 📄 Lisensi

Proyek ini didistribusikan di bawah [MIT License](LICENSE). Anda diperbolehkan untuk menggunakan, mendistribusikan ulang, memodifikasi, dan mengimplementasikan proyek ini secara bebas untuk tujuan personal maupun komersial.
