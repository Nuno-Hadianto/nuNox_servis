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
