<template>
  <div v-if="isOpen" class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <span class="close-modal" @click="close">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Pelanggan</label>
            <select
              v-model="form.customer_id"
              required
              class="form-control"
            >
              <option value="">-- Pilih Pelanggan --</option>
              <option v-for="c in customers" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.phone || '-' }})
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Merek (Brand)</label>
              <input
                type="text"
                v-model="form.brand"
                class="form-control"
                placeholder="Misal: Samsung, Asus"
              />
            </div>
            <div class="form-group flex-1">
              <label>Model</label>
              <input
                type="text"
                v-model="form.model"
                class="form-control"
                placeholder="Misal: Galaxy S21"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Tipe Perangkat</label>
              <input
                type="text"
                v-model="form.device_type"
                required
                class="form-control"
                placeholder="Misal: Smartphone, Laptop"
              />
            </div>
            <div class="form-group flex-1">
              <label>Serial Number (SN)</label>
              <input
                type="text"
                v-model="form.serial_number"
                class="form-control"
                placeholder="Opsional"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Warna</label>
              <input
                type="text"
                v-model="form.color"
                class="form-control"
                placeholder="Misal: Hitam, Putih"
              />
            </div>
            <div class="form-group flex-1">
              <label>Kelengkapan (Aksesoris)</label>
              <input
                type="text"
                v-model="form.accessories"
                class="form-control"
                placeholder="Misal: Charger, Tas"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Kondisi Fisik</label>
            <input
              type="text"
              v-model="form.physical_condition"
              class="form-control"
              placeholder="Misal: Mulus, Lecet pemakaian"
            />
          </div>

          <div class="form-group">
            <label>Catatan</label>
            <textarea
              v-model="form.notes"
              class="form-control textarea-resize"
              placeholder="Catatan tambahan (opsional)"
            ></textarea>
          </div>

          <div class="modal-footer action-footer">
            <button
              type="button"
              class="btn btn-cancel"
              @click="close"
            >
              <X :size="16" class="icon-spacing" /> Batal
            </button>
            <button type="submit" class="btn btn-primary">
              <Save :size="16" class="icon-spacing" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { X, Save } from 'lucide-vue-next'
import type { Customer } from '../../../shared/types'

const props = defineProps<{
  isOpen: boolean
  title: string
  customers: Customer[]
  initialData?: {
    customer_id?: string | number
    device_type?: string
    brand?: string
    model?: string
    serial_number?: string
    color?: string
    accessories?: string
    physical_condition?: string
    notes?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: {
    customer_id: number
    device_type: string
    brand: string
    model: string
    serial_number: string
    color: string
    accessories: string
    physical_condition: string
    notes: string
  }): void
}>()

const form = reactive({
  customer_id: '' as string | number,
  device_type: 'Laptop',
  brand: '',
  model: '',
  serial_number: '',
  color: '',
  accessories: '',
  physical_condition: '',
  notes: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.customer_id = props.initialData?.customer_id || ''
    form.device_type = props.initialData?.device_type || 'Laptop'
    form.brand = props.initialData?.brand || ''
    form.model = props.initialData?.model || ''
    form.serial_number = props.initialData?.serial_number || ''
    form.color = props.initialData?.color || ''
    form.accessories = props.initialData?.accessories || ''
    form.physical_condition = props.initialData?.physical_condition || ''
    form.notes = props.initialData?.notes || ''
  }
})

const close = () => {
  emit('close')
}

const submitForm = () => {
  emit('save', { 
    ...form, 
    customer_id: Number(form.customer_id) 
  })
}
</script>

<style scoped>
.form-row {
  display: flex;
  gap: 15px;
}
.flex-1 {
  flex: 1;
}
.textarea-resize {
  resize: vertical;
}
.action-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}
.action-footer .btn {
  padding: 8px 20px;
}
.icon-spacing {
  margin-right: 5px;
}
</style>
