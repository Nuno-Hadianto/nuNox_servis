<template>
  <div class="view-section">
    <div style="display: flex; gap: 25px; flex-wrap: wrap; align-items: flex-start;">
      <!-- Kolom Kiri -->
      <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px">
        <!-- Pengaturan Identitas -->
        <div class="card" style="padding: 25px; height: fit-content;">
          <h2
            style="
              font-size: 1.2rem;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--primary-color);
            "
          >
            🏢 Pengaturan Identitas Toko
          </h2>
          <form @submit.prevent="saveSettings">

            <div class="form-group">
              <label style="font-weight: 500; font-size: 0.9rem">No. Telp / WhatsApp</label>
              <input
                type="text"
                v-model="form.phone"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label style="font-weight: 500; font-size: 0.9rem">Alamat Lengkap</label>
              <textarea
                v-model="form.address"
                rows="3"
                class="form-control"
                style="resize: vertical;"
              ></textarea>
            </div>
            <div class="form-group">
              <label style="font-weight: 500; font-size: 0.9rem">Catatan Bawah Kwitansi</label>
              <textarea
                v-model="form.receipt_footer"
                rows="2"
                class="form-control"
                style="resize: vertical;"
              ></textarea>
            </div>
            <div style="margin-top: 25px; text-align: right">
              <button
                type="submit"
                class="btn btn-primary"
                style="
                  padding: 10px 24px;
                  border-radius: 20px;
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                💾 Simpan Identitas
              </button>
            </div>
          </form>
        </div>

        <!-- Template Pesan WhatsApp -->
        <div class="card" style="padding: 25px; height: fit-content;">
          <h2
            style="
              font-size: 1.2rem;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--primary-color);
            "
          >
            💬 Template Pesan WhatsApp
          </h2>
          <form @submit.prevent="saveSettings">
            <div class="form-group">
              <textarea
                v-model="form.wa_template_status"
                rows="3"
                class="form-control"
                style="resize: vertical;"
                placeholder="Halo Kak {nama}, tiket {tiket} status: {status}"
              ></textarea>
              <small style="color: var(--text-muted); display: block; margin-top: 4px">
                Gunakan kode otomatis: {nama}, {tiket}, {status}
              </small>
              <!-- WhatsApp Preview Box -->
              <div style="margin-top: 10px; background: rgba(37, 211, 102, 0.1); border-left: 3px solid #25D366; padding: 10px 15px; border-radius: 4px;">
                <div style="font-size: 0.8rem; font-weight: 600; color: #25D366; margin-bottom: 4px;">👁️ Pratinjau Pesan:</div>
                <div style="font-size: 0.9rem; color: var(--text-primary); white-space: pre-wrap; line-height: 1.4;">
                  {{ waPreviewText }}
                </div>
              </div>
            </div>
            <div style="margin-top: 25px; text-align: right">
              <button
                type="submit"
                class="btn btn-primary"
                style="
                  padding: 10px 24px;
                  border-radius: 20px;
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                💾 Simpan Template
              </button>
            </div>
          </form>
        </div>



      </div>

      <!-- Kolom Kanan -->
      <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px">
        
        <div class="card" style="padding: 25px">
          <h2
            style="
              font-size: 1.2rem;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--primary-color);
            "
          >
            ☁️ Auto-Backup (Cloud/Folder)
          </h2>
          <div
            style="
              background: rgba(16, 185, 129, 0.05);
              border: 1px solid rgba(16, 185, 129, 0.2);
              border-radius: var(--radius-md);
              padding: 20px;
              margin-bottom: 15px;
            "
          >
            <div style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
              Pilih lokasi folder untuk menyimpan cadangan data (seperti <strong>Google Drive</strong> atau <strong>OneDrive</strong>).
              
              <div style="margin-top: 10px; margin-bottom: 12px; color: var(--text-primary);">
                <strong>Jadwal Backup Otomatis:</strong>
                <ul style="margin-top: 4px; padding-left: 20px; margin-bottom: 0;">
                  <li>Setiap <b>2 Jam</b> sekali (selagi aplikasi terbuka).</li>
                  <li>Setiap kali Anda <b>menutup aplikasi</b>.</li>
                </ul>
              </div>

              <div style="font-size: 0.85rem; color: #047857; background: rgba(16, 185, 129, 0.15); padding: 10px 12px; border-radius: 6px; border-left: 3px solid #10b981; margin-top: 15px; line-height: 1.4;">
                💡 <b>Catatan:</b> Jika kolom di bawah dibiarkan kosong, sistem akan tetap bekerja dengan menyimpan file <i>backup</i> ke folder bawaan Windows Anda:<br>
                <code style="background: rgba(255,255,255,0.6); padding: 2px 6px; border-radius: 4px; margin-top: 6px; display: inline-block; font-weight: 600; color: #065f46;">Documents\nuNox_servis_Backups</code>
              </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center">
              <input
                type="text"
                v-model="form.auto_backup_path"
                readonly
                placeholder="Belum ada folder yang dipilih..."
                style="
                  flex: 1;
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  background: #f9fafb;
                "
              />
              <button
                @click="selectBackupDir"
                class="btn btn-primary"
                style="padding: 10px 15px; border-radius: var(--radius-sm)"
              >
                Pilih Folder
              </button>
            </div>
            




            <div style="margin-top: 15px; text-align: right">
              <button
                @click="saveSettings"
                class="btn btn-primary"
                style="padding: 8px 16px; border-radius: 20px"
              >
                💾 Simpan Pengaturan Backup
              </button>
            </div>
          </div>
        </div>

        <div class="card" style="padding: 25px">
          <h2
            style="
              font-size: 1.2rem;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--primary-color);
            "
          >
            🗄️ Manual Backup & Restore
          </h2>
          <div
            style="
              background: rgba(99, 102, 241, 0.05);
              border: 1px solid rgba(99, 102, 241, 0.2);
              border-radius: var(--radius-md);
              padding: 20px;
              margin-bottom: 20px;
            "
          >
            <button
              @click="backupData"
              class="btn btn-primary"
              style="
                display: flex;
                align-items: center;
                gap: 6px;
                border-radius: 20px;
                padding: 10px 20px;
                margin-bottom: 15px;
                width: 100%;
                justify-content: center;
              "
            >
              ⬇️ Backup Data Sekarang
            </button>
            <button
              @click="restoreData"
              class="btn"
              style="
                background-color: white;
                color: #ef4444;
                border: 1px solid #ef4444;
                display: flex;
                align-items: center;
                gap: 6px;
                border-radius: 20px;
                padding: 10px 20px;
                width: 100%;
                justify-content: center;
              "
            >
              🔄 Pulihkan Data (Restore)
            </button>
            <p
              style="
                color: var(--text-muted);
                font-size: 0.8rem;
                line-height: 1.4;
                margin-top: 10px;
                text-align: center;
              "
            >
              Restore akan menimpa seluruh data aplikasi.
            </p>
          </div>
        </div>

        <!-- Status Penyimpanan -->
        <div class="card" style="padding: 25px">
          <h2
            style="
              font-size: 1.2rem;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
              color: var(--primary-color);
            "
          >
            💽 Status Penyimpanan
          </h2>
          <div
            style="
              background: rgba(59, 130, 246, 0.05);
              border: 1px solid rgba(59, 130, 246, 0.2);
              border-radius: var(--radius-md);
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div>
              <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 5px;">Ukuran Database:</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">{{ dbSize }}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Format:</div>
              <div style="font-size: 1rem; font-weight: 600; color: #475569;">SQLite (.db)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import type { Settings } from '../../shared/types'

const dbSize = ref<string>('0 KB')

const form = reactive<Settings>({
  business_name: '',
  phone: '',
  address: '',
  receipt_footer: '',
  auto_backup_path: '',
  wa_template_status: ''
})



const waPreviewText = computed(() => {
  if (!form.wa_template_status) return 'Silakan isi template...'
  let text = form.wa_template_status
  text = text.replace(/{nama}/g, 'Budi')
  text = text.replace(/{tiket}/g, 'NSV-001')
  text = text.replace(/{status}/g, 'Selesai')
  return text
})



const loadSettings = async () => {
  if (window.api && window.api.getSettings) {
    try {
      const settings = (await window.api.getSettings()) as Settings
      form.business_name = settings.business_name || ''
      form.phone = settings.phone || settings.whatsapp || ''
      form.address = settings.address || ''
      form.receipt_footer = settings.receipt_footer || ''
      form.auto_backup_path = settings.auto_backup_path || ''
      form.wa_template_status =
        settings.wa_template_status ||
        'Halo Kak {nama}, perangkat Anda dengan No Tiket *{tiket}* saat ini berstatus: *{status}*. Mohon konfirmasinya. Terima kasih.'
      
      // Load DB Size
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window.api as any).getDbSize) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bytes = await (window.api as any).getDbSize()
        if (bytes > 1024 * 1024) {
          dbSize.value = (bytes / (1024 * 1024)).toFixed(2) + ' MB'
        } else {
          dbSize.value = (bytes / 1024).toFixed(2) + ' KB'
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

const saveSettings = async () => {
  try {
    const data = {
      business_name: form.business_name,
      phone: form.phone,
      whatsapp: form.phone,
      address: form.address,
      receipt_footer: form.receipt_footer,
      auto_backup_path: form.auto_backup_path,
      wa_template_status: form.wa_template_status
    }
    await window.api.updateSettings(data)
    
    window.Swal.fire({
      icon: 'success',
      title: 'Tersimpan',
      text: 'Pengaturan berhasil disimpan.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal menyimpan pengaturan.', 'error')
  }
}

const backupData = async () => {
  try {
    const success = await window.api.backupDatabase()
    if (success) {
      window.Swal.fire('Berhasil', 'Backup database berhasil!', 'success')
    }
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal backup database.', 'error')
  }
}

const selectBackupDir = async () => {
  try {
    const path = await window.api.selectDirectory()
    if (path) {
      form.auto_backup_path = path
    }
  } catch (e: unknown) {
    console.error(e)
  }
}

const restoreData = async () => {
  const result = await window.Swal.fire({
    title: 'Peringatan',
    text: 'Restore akan menimpa semua data saat ini. Aplikasi akan ditutup dan dibuka ulang. Yakin ingin melanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Restore'
  })

  if (result.isConfirmed) {
    try {
      const success = await window.api.restoreDatabase()
      if (success) {
        window.Swal.fire({
          icon: 'success',
          title: 'Restore Berhasil!',
          text: 'Aplikasi akan dimuat ulang secara otomatis untuk menerapkan data baru...',
          showConfirmButton: false,
          timer: 2500
        })
      }
    } catch (error: unknown) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      window.Swal.fire('Error', msg || 'Gagal restore database.', 'error')
    }
  }
}

onMounted(() => {
  loadSettings()
})

onUnmounted(() => {
})
</script>


