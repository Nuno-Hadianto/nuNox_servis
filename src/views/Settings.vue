<template>
  <div class="view-section">
    <div style="display: flex; gap: 25px; flex-wrap: wrap">
      <!-- Pengaturan Identitas -->
      <div class="card" style="flex: 1; min-width: 300px; padding: 25px">
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
            <label style="font-weight: 500; font-size: 0.9rem">Nama Usaha / Toko</label>
            <input
              type="text"
              v-model="form.business_name"
              class="form-control"
            />
          </div>
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

          <div class="form-group">
            <label style="font-weight: 500; font-size: 0.9rem">Template Pesan WhatsApp</label>
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
          <div class="form-group">
            <label style="font-weight: 500; font-size: 0.9rem">Tema Warna Utama (Primary Color)</label>
            <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px;">
              <input
                type="color"
                v-model="form.primary_color"
                class="form-control"
                style="width: 50px; height: 40px; padding: 0; cursor: pointer;"
              />
              <span style="font-family: monospace; padding: 5px 10px; background: rgba(0,0,0,0.05); border-radius: 4px;">{{ form.primary_color }}</span>
              <button
                type="button"
                @click="form.primary_color = '#6366f1'"
                class="btn btn-secondary"
                style="padding: 5px 10px; border-radius: 4px; font-size: 0.8rem;"
              >Reset Default</button>
            </div>
            <!-- Preset Colors -->
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button type="button" class="color-swatch" style="background: #6366f1;" @click="form.primary_color = '#6366f1'" title="Indigo"></button>
              <button type="button" class="color-swatch" style="background: #10b981;" @click="form.primary_color = '#10b981'" title="Emerald"></button>
              <button type="button" class="color-swatch" style="background: #f43f5e;" @click="form.primary_color = '#f43f5e'" title="Rose"></button>
              <button type="button" class="color-swatch" style="background: #f59e0b;" @click="form.primary_color = '#f59e0b'" title="Amber"></button>
              <button type="button" class="color-swatch" style="background: #3b82f6;" @click="form.primary_color = '#3b82f6'" title="Blue"></button>
              <button type="button" class="color-swatch" style="background: #8b5cf6;" @click="form.primary_color = '#8b5cf6'" title="Purple"></button>
            </div>
            <small style="color: var(--text-muted); display: block; margin-top: 6px">
              Pilih warna identitas toko Anda. Membutuhkan <i>restart</i> aplikasi agar sempurna diterapkan.
            </small>
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
              💾 Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>



      <!-- Backup & Restore -->
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
            <p
              style="
                color: var(--text-muted);
                font-size: 0.9rem;
                line-height: 1.5;
                margin-bottom: 15px;
              "
            >
              Pilih folder <strong>Google Drive</strong>, <strong>OneDrive</strong>, atau folder
              aman lainnya di komputer Anda. Aplikasi akan otomatis melakukan pencadangan setiap
              kali Anda menutup aplikasi.
            </p>
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
            


            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border-color);">
              <h4 style="margin: 0 0 10px 0; font-size: 1rem; color: var(--primary-color);">✨ Asisten AI (Gemini)</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Dapatkan bantuan AI untuk memprediksi kerusakan dan estimasi biaya. Masukkan API Key dari Google AI Studio.</p>
              <div class="form-group">
                <label style="font-weight: 500; font-size: 0.85rem">Gemini API Key</label>
                <input
                  type="password"
                  v-model="form.gemini_api_key"
                  class="form-control"
                  placeholder="Ketik API Key Anda di sini..."
                  style="padding: 8px; font-size: 0.85rem; width: 100%; margin-top: 5px; border: 1px solid var(--border-color); border-radius: 4px;"
                />
              </div>
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

        <!-- Pembaruan Aplikasi -->
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
            🔄 Pembaruan Aplikasi
          </h2>
          <div
            style="
              background: rgba(245, 158, 11, 0.05);
              border: 1px solid rgba(245, 158, 11, 0.2);
              border-radius: var(--radius-md);
              padding: 20px;
              margin-bottom: 10px;
            "
          >
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                Periksa ketersediaan versi terbaru aplikasi. Pastikan komputer terhubung ke internet.
              </p>
              
              <div v-if="updateStatus" style="font-weight: bold; color: var(--primary-color); font-size: 0.95rem;">
                Status: {{ updateStatus }}
              </div>
              
              <div v-if="updateProgress > 0 && updateProgress < 100" style="width: 100%; background: #e2e8f0; border-radius: 10px; overflow: hidden; height: 10px;">
                <div :style="{ width: updateProgress + '%', background: 'var(--primary-color)', height: '100%', transition: 'width 0.3s' }"></div>
              </div>
              
              <button
                v-if="!updateReady"
                @click="checkForUpdates"
                class="btn btn-primary"
                :disabled="isCheckingUpdate"
                style="border-radius: 20px; padding: 10px 20px; justify-content: center; display: flex; align-items: center; gap: 8px;"
              >
                <span v-if="isCheckingUpdate">⏳ Sedang Mengecek...</span>
                <span v-else>🔍 Cek Pembaruan Manual</span>
              </button>
              
              <button
                v-if="updateReady"
                @click="installUpdate"
                class="btn"
                style="background: #10b981; color: white; border: none; border-radius: 20px; padding: 10px 20px; justify-content: center; display: flex; align-items: center; gap: 8px;"
              >
                🚀 Restart & Install Sekarang
              </button>
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

const form = reactive<Settings>({
  business_name: '',
  phone: '',
  address: '',
  receipt_footer: '',
  auto_backup_path: '',
  wa_template_status: '',
  default_printer: '',
  primary_color: '#6366f1',
  gemini_api_key: ''
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
      form.low_stock_threshold =
        settings.low_stock_threshold !== undefined ? Number(settings.low_stock_threshold) : 3
      form.default_printer = settings.default_printer || ''
      form.primary_color = settings.primary_color || '#6366f1'
      form.gemini_api_key = settings.gemini_api_key || ''
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
      wa_template_status: form.wa_template_status,
      low_stock_threshold: form.low_stock_threshold,
      default_printer: form.default_printer,
      primary_color: form.primary_color,
      gemini_api_key: form.gemini_api_key
    }
    await window.api.updateSettings(data)
    
    // Apply theme immediately
    document.documentElement.style.setProperty('--primary', form.primary_color || '#6366f1');
    
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

const isCheckingUpdate = ref(false)
const updateStatus = ref('')
const updateProgress = ref(0)
const updateReady = ref(false)

const checkForUpdates = async () => {
  if (window.api && window.api.checkForUpdates) {
    isCheckingUpdate.value = true
    updateStatus.value = 'Mengecek ketersediaan pembaruan...'
    updateProgress.value = 0
    try {
      await window.api.checkForUpdates()
    } catch (error: unknown) {
      isCheckingUpdate.value = false
      updateStatus.value = 'Gagal mengecek pembaruan.'
      console.error(error)
    }
  }
}

const installUpdate = () => {
  if (window.api && window.api.installUpdate) {
    window.api.installUpdate()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUpdaterEvent = (_event: unknown, data: any) => {
  if (data.type === 'checking') {
    isCheckingUpdate.value = true
    updateStatus.value = 'Mengecek ketersediaan pembaruan...'
  } else if (data.type === 'update-available') {
    updateStatus.value = `Pembaruan tersedia (v${data.info?.version || 'baru'}). Mulai mengunduh...`
  } else if (data.type === 'update-not-available') {
    isCheckingUpdate.value = false
    updateStatus.value = 'Aplikasi sudah dalam versi terbaru.'
  } else if (data.type === 'download-progress') {
    updateProgress.value = data.progress?.percent || 0
    updateStatus.value = `Mengunduh... ${Math.round(data.progress?.percent || 0)}%`
  } else if (data.type === 'update-downloaded') {
    isCheckingUpdate.value = false
    updateProgress.value = 100
    updateReady.value = true
    updateStatus.value = 'Pembaruan siap dipasang.'
  } else if (data.type === 'error') {
    isCheckingUpdate.value = false
    updateStatus.value = 'Terjadi kesalahan saat memperbarui.'
  }
}

onMounted(() => {
  loadSettings()
  if (window.api && window.api.onUpdaterEvent) {
    window.api.onUpdaterEvent(handleUpdaterEvent)
  }
})

onUnmounted(() => {
  if (window.api && window.api.removeUpdaterEvents) {
    window.api.removeUpdaterEvents()
  }
})
</script>

<style scoped>
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 0;
}
.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
}
</style>
