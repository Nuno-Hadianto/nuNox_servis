<template>
  <div style="margin-top: 25px">
    <h3
      style="
        margin-bottom: 15px;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      📝 Update Status & Catatan
    </h3>
    <div style="display: flex; flex-direction: column; gap: 15px">
      <div class="form-group" style="margin: 0">
        <label style="font-size: 0.85rem">Ubah Status</label>
        <select
          v-model="form.status"
          class="form-control"
          style="padding: 10px; border-radius: var(--radius-sm);"
        >
          <option value="Diterima">Diterima</option>
          <option value="Pengecekan">Pengecekan</option>
          <option value="Menunggu Sparepart">Menunggu Sparepart</option>
          <option value="Proses Perbaikan">Proses Perbaikan</option>
          <option value="Selesai (Belum Diambil)">Selesai (Belum Diambil)</option>
          <option value="Selesai (Sudah Diambil)">Selesai (Sudah Diambil)</option>
          <option value="Batal">Batal</option>
        </select>
      </div>
      <div class="form-group" style="margin: 0">
        <label style="font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          Pemeriksaan & Perbaikan
          <button type="button" @click="askAiForDiagnosis" class="btn" style="padding: 2px 8px; font-size: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;" title="Minta AI memberikan saran diagnosis dan tindakan">✨ Analisis AI</button>
        </label>
        <div style="display: flex; gap: 15px; width: 100%;">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 5px">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">HASIL DIAGNOSIS</span>
            <textarea
              v-model="form.diagnosis_result"
              rows="3"
              class="form-control"
              placeholder="Jelaskan kerusakan..."
              style="padding: 10px; border-radius: var(--radius-sm); resize: vertical; width: 100%; box-sizing: border-box;"
            ></textarea>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 5px">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">TINDAKAN DILAKUKAN</span>
            <textarea
              v-model="form.actions_taken"
              rows="3"
              class="form-control"
              placeholder="Jelaskan tindakan perbaikan..."
              style="padding: 10px; border-radius: var(--radius-sm); resize: vertical; width: 100%; box-sizing: border-box;"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="form-group" style="margin: 0">
        <label style="font-size: 0.85rem">Catatan Internal (Teknisi)</label>
        <textarea
          v-model="form.technician_notes"
          rows="2"
          class="form-control"
          placeholder="Catatan ini tidak muncul di struk"
          style="padding: 10px; border-radius: var(--radius-sm); resize: vertical; width: 100%; box-sizing: border-box;"
        ></textarea>
      </div>
      <button
        class="btn btn-primary"
        @click="saveUpdate"
        style="align-self: flex-end; padding: 10px 24px; border-radius: 20px"
      >
        💾 Simpan Perubahan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ServiceOrder } from '../../../shared/types'

const props = defineProps<{
  service: ServiceOrder
}>()

const emit = defineEmits(['save'])

const form = reactive({
  status: '',
  diagnosis_result: '',
  actions_taken: '',
  technician_notes: ''
})

const askAiForDiagnosis = async () => {
  if (!props.service.customer_complaint) {
    return window.Swal.fire('Info', 'Tidak ada catatan keluhan pelanggan pada servis ini.', 'info')
  }
  
  const deviceStr = `${props.service.device_type} ${props.service.brand} ${props.service.model}`
  const prompt = `Anda adalah teknisi servis elektronik. Pelanggan membawa "${deviceStr}" dengan keluhan: "${props.service.customer_complaint}".
Berikan rekomendasi singkat mengenai Hasil Diagnosis dan Tindakan Perbaikan yang harus dilakukan.
PENTING: Anda WAJIB menjawab HANYA menggunakan format JSON valid seperti berikut tanpa penjelasan teks apa pun di luar JSON:
{
  "diagnosis": "Isi dengan kemungkinan kerusakan secara singkat...",
  "actions": "Isi dengan langkah perbaikan secara singkat..."
}`

  window.Swal.fire({
    title: '✨ Analisis AI...',
    text: 'Meminta diagnosis ke Google Gemini...',
    allowOutsideClick: false,
    didOpen: () => { window.Swal.showLoading() }
  })
  
  try {
    const res = await window.api.askAi(prompt)
    if (res.success && res.result) {
      let jsonStr = res.result.trim()
      // Hapus backticks markdown jika Gemini mengembalikannya
      jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim()
      
      try {
        const parsed = JSON.parse(jsonStr)
        const confirm = await window.Swal.fire({
          title: '✨ Saran AI',
          html: `<div style="text-align: left; font-size: 0.95rem; line-height: 1.5; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                   <strong style="color: #0f172a;">🔍 Hasil Diagnosis:</strong><br/>
                   <span style="color: #334155;">${parsed.diagnosis}</span><br/><br/>
                   <strong style="color: #0f172a;">🛠️ Tindakan Perbaikan:</strong><br/>
                   <span style="color: #334155;">${parsed.actions}</span>
                 </div>
                 <p style="font-size: 0.85rem; color: #64748b; margin-top: 15px;">Klik "Gunakan Saran" untuk langsung mengisi form.</p>`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: 'var(--primary-color)',
          confirmButtonText: '✅ Gunakan Saran',
          cancelButtonText: 'Tutup'
        })
        
        if (confirm.isConfirmed) {
          form.diagnosis_result = parsed.diagnosis
          form.actions_taken = parsed.actions
          // SweetAlert doesn't need another popup, just fill it smoothly
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        // Fallback jika format gagal
        window.Swal.fire({
          title: '✨ Saran AI',
          text: res.result,
          icon: 'info',
          confirmButtonText: 'Tutup'
        })
      }
    } else {
      window.Swal.fire('Error AI', res.error || 'Terjadi kesalahan.', 'error')
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg, 'error')
  }
}

// Initialize form when service data changes
watch(
  () => props.service,
  (newService) => {
    if (newService) {
      form.status = newService.service_status
      form.diagnosis_result = newService.diagnosis_result || ''
      form.actions_taken = newService.actions_taken || ''
      form.technician_notes = newService.technician_notes || ''
    }
  },
  { immediate: true }
)

const saveUpdate = () => {
  emit('save', { ...form })
}
</script>
