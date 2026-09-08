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
            <label>Nama Pelanggan</label>
            <input
              type="text"
              v-model="form.name"
              required
              placeholder="Contoh: Budi Santoso"
              class="form-control"
              :class="{ 'is-invalid': formErrors.name }"
            />
            <small v-if="formErrors.name" class="error-text">{{ formErrors.name }}</small>
          </div>
          <div class="form-group">
            <label>No. HP/WhatsApp</label>
            <input
              type="text"
              v-model="form.phone"
              required
              placeholder="Contoh: 08123456789"
              class="form-control"
              :class="{ 'is-invalid': formErrors.phone }"
            />
            <small v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</small>
          </div>
          <div class="form-group">
            <label>Alamat (Opsional)</label>
            <textarea
              v-model="form.address"
              rows="3"
              placeholder="Alamat lengkap"
              class="form-control"
              style="resize: vertical;"
              :class="{ 'is-invalid': formErrors.address }"
            ></textarea>
            <small v-if="formErrors.address" class="error-text">{{ formErrors.address }}</small>
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
import { CustomerSchema } from '@/utils/validators'

const props = defineProps<{
  isOpen: boolean
  title: string
  initialData?: {
    name?: string
    phone?: string
    address?: string
    notes?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { name: string; phone: string; address: string; notes: string }): void
}>()

const form = reactive({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const formErrors = reactive<Record<string, string>>({})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    Object.keys(formErrors).forEach(key => delete formErrors[key])
    form.name = props.initialData?.name || ''
    form.phone = props.initialData?.phone || ''
    form.address = props.initialData?.address || ''
    form.notes = props.initialData?.notes || ''
  }
})

const close = () => {
  emit('close')
}

const submitForm = () => {
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  
  const validation = CustomerSchema.safeParse(form)
  if (!validation.success) {
    validation.error.issues.forEach(issue => {
      if (issue.path[0]) {
        formErrors[issue.path[0].toString()] = issue.message
      }
    })
    return
  }

  emit('save', { ...form })
}
</script>

<style scoped>
.error-text {
  color: #ef4444;
  margin-top: 4px;
  display: block;
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
