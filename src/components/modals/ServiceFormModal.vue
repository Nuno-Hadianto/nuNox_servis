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
            <CustomSelect
              v-model="form.customer_id"
              :options="customerOptions"
              placeholder="-- Pilih Pelanggan --"
              @change="onCustomerChange"
            />
          </div>
          <div class="form-group">
            <label>Perangkat</label>
            <CustomSelect
              v-model="form.device_id"
              :options="deviceOptions"
              placeholder="-- Pilih Perangkat --"
              @change="onDeviceChange"
              :disabled="!form.customer_id"
            />
          </div>
          <div class="form-group">
            <label>Keluhan / Kerusakan (Diisi berdasarkan laporan pelanggan)</label>
            <textarea
              v-model="form.customer_complaint"
              rows="3"
              required
              class="form-control textarea-resize"
              placeholder="Contoh: Mati total, layar bergaris..."
            ></textarea>
          </div>
          <div class="form-group" v-if="isAddMode">
            <label>Kelengkapan & Kondisi Fisik (Opsional)</label>
            <textarea
              v-model="form.physical_condition"
              rows="2"
              class="form-control textarea-resize"
              placeholder="Contoh: Bawa charger dan tas. Bodi bawah lecet pemakaian."
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
import { ref, reactive, watch, computed } from 'vue'
import { X, Save } from 'lucide-vue-next'
import CustomSelect from '../common/CustomSelect.vue'
import type { Customer, Device } from '../../../shared/types'
import { DeviceService } from '@/services/DeviceService'
import { ServiceOrderService } from '@/services/ServiceOrderService'
import { AppAlert } from '@/utils/alert'

const props = defineProps<{
  isOpen: boolean
  title: string
  customers: Customer[]
  isAddMode: boolean
  initialData?: {
    customer_id?: string | number
    device_id?: string | number
    customer_complaint?: string
    physical_condition?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: {
    customer_id: number
    device_id: number
    customer_complaint: string
    physical_condition: string
  }): void
}>()

const customerDevices = ref<Device[]>([])

const customerOptions = computed(() => {
  return props.customers.map(c => ({
    value: c.id,
    label: `${c.name} (${c.phone || '-'})`
  }))
})

const deviceOptions = computed(() => {
  return customerDevices.value.map(d => ({
    value: d.id,
    label: `${d.brand || ''} ${d.model || ''} - ${d.device_type} (SN: ${d.serial_number || '-'})`
  }))
})

const form = reactive({
  customer_id: '' as string | number,
  device_id: '' as string | number,
  customer_complaint: '',
  physical_condition: ''
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    form.customer_id = props.initialData?.customer_id || ''
    form.device_id = props.initialData?.device_id || ''
    form.customer_complaint = props.initialData?.customer_complaint || ''
    form.physical_condition = props.initialData?.physical_condition || ''

    if (form.customer_id) {
      await loadCustomerDevices(Number(form.customer_id))
    } else {
      customerDevices.value = []
    }
  }
})

const loadCustomerDevices = async (customerId: number) => {
  try {
    customerDevices.value = (await DeviceService.getByCustomer(customerId)) as Device[]
  } catch (error) {
    console.error('Failed to load devices for customer:', error)
  }
}

const onCustomerChange = async () => {
  customerDevices.value = []
  form.device_id = ''
  if (form.customer_id) {
    await loadCustomerDevices(Number(form.customer_id))
  }
}

const onDeviceChange = async () => {
  if (form.device_id) {
    try {
      const warranty = await ServiceOrderService.checkWarranty(Number(form.device_id))
      if (warranty && warranty.status === 'valid') {
        const dateStr = new Date(warranty.warranty_end_date as string).toLocaleDateString('id-ID')
        AppAlert.fire({
          icon: 'warning',
          title: 'Perhatian!',
          html: `Perangkat ini <b>masih dalam masa garansi</b> dari tiket <b>${warranty.ticket_number}</b> hingga tanggal <b>${dateStr}</b>.`
        })
      }
    } catch (error) {
      console.error('Gagal mengecek garansi', error)
    }

    const selectedDev = customerDevices.value.find((d) => d.id === Number(form.device_id))
    if (selectedDev) {
      const cond = []
      if (selectedDev.accessories) cond.push(selectedDev.accessories)
      form.physical_condition = cond.join('. ')
    }
  }
}

const close = () => {
  emit('close')
}

const submitForm = () => {
  emit('save', {
    customer_id: Number(form.customer_id),
    device_id: Number(form.device_id),
    customer_complaint: form.customer_complaint,
    physical_condition: form.physical_condition
  })
}
</script>

<style scoped>
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
