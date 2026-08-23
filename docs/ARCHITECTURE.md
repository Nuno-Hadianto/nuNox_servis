# Arsitektur nuNox Servis

Dokumen ini ditujukan untuk memandu _developer_ atau kontributor baru untuk memahami cara kerja aplikasi ini di bawah kap (_under the hood_).

## High-Level Architecture

nuNox Servis menggunakan arsitektur aplikasi hibrida desktop yang mengawinkan **Electron (Node.js)** sebagai _backend_ lokal dan **Vue 3 (Vite)** sebagai _frontend_.

1. **Frontend (Vue 3)**: Bertanggung jawab pada presentasi UI (antarmuka pengguna), _routing_, dan _state management_ (menggunakan Pinia).
2. **Backend (Electron Main Process)**: Bertanggung jawab pada operasi _file system_, eksekusi transaksi database, dan _bridging_ ke sistem operasi Windows/Linux.
3. **Database (SQLite)**: Menyimpan seluruh entitas (_Services_, _Customers_, _Parts_) dalam bentuk file tunggal secara lokal yang sangat ringan dan portabel.

## Alur Data (Data Flow & IPC)

Sistem ini sangat bergantung pada konsep komunikasi antar-proses (IPC - _Inter-Process Communication_) bawaan Electron:

```mermaid
sequenceDiagram
    participant Vue as Frontend (Vue 3)
    participant Preload as Preload Script (API)
    participant Electron as Electron (Main)
    participant DB as SQLite (better-sqlite3)

    Vue->>Preload: window.electron.getServices()
    Preload->>Electron: ipcRenderer.invoke('get-services')
    Electron->>DB: repository.getServices()
    DB-->>Electron: { data }
    Electron-->>Preload: { data }
    Preload-->>Vue: { data }
```

### 1. Lapisan Akses (Frontend)

Pada direktori `src/`, aplikasi Vue **tidak pernah** melakukan kontak langsung ke database. Vue hanya memanggil fungsionalitas yang terekspos di objek global: `window.electron`.
Contoh:

```javascript
const services = await window.electron.getServices()
```

### 2. Jembatan IPC (Preload Script)

Berada di `electron/preload.js`. Lapisan ini mendaftarkan fungsi keamanan (`contextBridge`) agar _Frontend_ tidak bisa mengeksekusi sembarang perintah _Node.js_.

### 3. Eksekusi Handler (Controllers)

Berada di `controllers/`. Di sini, Electron mendengarkan panggilan dari _Frontend_ (melalui `ipcMain.handle()`) dan meneruskannya ke fungsi repositori.

### 4. Lapisan Repositori (Drizzle ORM + better-sqlite3)

Berada di `repositories/`. Di lapisan ini, kita menggunakan [Drizzle ORM](https://orm.drizzle.team/) untuk melakukan kueri ke SQLite (via `better-sqlite3`). Penggunaan Drizzle memastikan operasi berbasis _Type-Safe_.

Contoh kueri Drizzle:

```typescript
db.drizzle.select().from(services).where(eq(services.status, 'Selesai')).all()
```

## Struktur Direktori Utama

- `public/` - Aset statis dan _styling_ dasar (`style.css`).
- `src/` - Seluruh komponen, halaman (views), dan logika _Frontend_ (Vue).
- `electron/` - _Main process_ Electron dan _preload script_.
- `database/` - Skema Drizzle ORM (`drizzleSchema.js`) dan inisialisasi koneksi `better-sqlite3`.
- `repositories/` - Modul khusus abstraksi _database_ (CRUD).
- `controllers/` - Pendaftaran _event-listener_ IPC yang menyambungkan _Frontend_ ke _repositories_.

## Mode Development

Saat menjalankan perintah `npm run dev:all`, ada dua entitas yang berjalan secara paralel:

1. **Vite Dev Server**: Melayani file Vue di `localhost` agar mendukung _Hot Module Replacement_ (HMR).
2. **Electron Watcher**: Mengawasi perubahan file TypeScript/JavaScript di _Backend_. Jika ada perubahan, server Electron akan memuat ulang (melalui _electron-reload_).
