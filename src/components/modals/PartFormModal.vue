<template>
  <div v-if="isOpen" class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <span class="close-modal" @click="close">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Kode Barang (Opsional)</label>
              <input
                type="text"
                v-model="form.part_code"
                class="form-control"
                placeholder="Contoh: LCD-IP-11"
              />
            </div>
            <div class="form-group flex-1">
              <label>Kategori</label>
              <input
                type="text"
                v-model="form.category"
                class="form-control"
                placeholder="Contoh: LCD, Baterai..."
              />
            </div>
          </div>
          <div class="form-group">
            <label>Nama Item</label>
            <input
              type="text"
              v-model="form.name"
              required
              class="form-control"
              placeholder="Nama barang / jasa"
            />
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Satuan (Opsional)</label>
              <input
                type="text"
                v-model="form.unit"
                class="form-control"
                placeholder="Pcs, Unit..."
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Harga Beli / Modal (Rp)</label>
              <input
                type="number"
                v-model.number="form.buy_price"
                required
                min="0"
                class="form-control"
              />
            </div>
            <div class="form-group flex-1">
              <label>Harga Jual (Rp)</label>
              <input
                type="number"
                v-model.number="form.sell_price"
                required
                min="0"
                class="form-control"
              />
            </div>
          </div>
          <div class="form-group">
            <label>Catatan Tambahan</label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="form-control textarea-resize"
              placeholder="Info tambahan (opsional)"
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

const props = defineProps<{
  isOpen: boolean
  title: string
  initialData?: {
    part_code?: string
    name?: string
    category?: string
    buy_price?: number
    sell_price?: number
    unit?: string
    notes?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: {
    part_code: string
    name: string
    category: string
    buy_price: number
    sell_price: number
    unit: string
    notes: string
  }): void
}>()

const form = reactive({
  part_code: '',
  name: '',
  category: '',
  buy_price: 0,
  sell_price: 0,
  unit: 'Pcs',
  notes: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.part_code = props.initialData?.part_code || ''
    form.name = props.initialData?.name || ''
    form.category = props.initialData?.category || ''
    form.buy_price = props.initialData?.buy_price || 0
    form.sell_price = props.initialData?.sell_price || 0
    form.unit = props.initialData?.unit || 'Pcs'
    form.notes = props.initialData?.notes || ''
  }
})

const close = () => {
  emit('close')
}

const submitForm = () => {
  emit('save', { ...form })
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
