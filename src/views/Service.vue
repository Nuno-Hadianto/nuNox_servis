<template>
  <div class="view-section">
    <div
      class="action-bar"
      style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px"
    >
      <div style="position: relative; flex: 1; max-width: 400px">
        <Search
          class="search-icon"
          :size="18"
          style="
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.5;
            color: var(--text-primary);
          "
        />
        <input
          type="text"
          v-model="searchQuery"
          @input="debounceSearch"
          placeholder="Cari tiket, pelanggan, perangkat..."
          class="form-control"
          style="width: 100%; padding-left: 38px; border-radius: 20px"
        />
      </div>
      <button
        @click="exportExcel"
        class="btn"
        style="
          background-color: #10b981;
          color: white;
          display: flex; align-items: center; gap: 8px;
        "
      >
        <FileSpreadsheet :size="18" /> Ekspor Excel
      </button>
      <button
        @click="openAddModal"
        class="btn btn-primary"
        style="display: flex; align-items: center; gap: 8px"
      >
        <Plus :size="18" /> Buat Tiket Servis
      </button>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Pelanggan</th>
            <th>Perangkat</th>
            <th>Status</th>
            <th>Total Biaya</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="services.length === 0">
            <td colspan="6" style="text-align: center; padding: 20px">Belum ada data servis.</td>
          </tr>
          <tr v-for="s in services" :key="s.id">
            <td>
              <strong>{{ s.ticket_number }}</strong>
            </td>
            <td>{{ s.customer_name }}</td>
            <td>{{ s.brand || '' }} {{ s.model || '' }}</td>
            <td>
              <span class="badge" :style="getStatusColor(s.service_status)">
                {{ s.service_status }}
              </span>
              <span
                v-if="isWarrantyActive(s.warranty_end_date)"
                style="
                  display: inline-block;
                  margin-top: 4px;
                  padding: 2px 6px;
                  border-radius: 4px;
                  background: #10b981;
                  color: white;
                  font-size: 0.75rem;
                  font-weight: bold;
                "
              >
                🛡️ Garansi Aktif
              </span>
            </td>
            <td>{{ formatCurrency(s.total_cost) }}</td>
            <td>
              <button class="btn btn-primary btn-sm" @click="goToDetail(s.id)">Detail</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Custom Pagination -->
    <div
      class="pagination-controls"
      style="
        margin-top: 25px;
        display: flex;
        justify-content: center;
        gap: 15px;
        align-items: center;
      "
    >
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage === 1"
        @click="loadServices(currentPage - 1)"
        style="border-radius: 20px; padding: 6px 16px"
      >
        &larr; Sebelumnya
      </button>
      <span
        style="
          font-weight: 500;
          color: var(--text-muted);
          background: var(--card-bg);
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
        "
        >Halaman {{ currentPage }} dari {{ totalPages }}</span
      >
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage >= totalPages"
        @click="loadServices(currentPage + 1)"
        style="border-radius: 20px; padding: 6px 16px"
      >
        Selanjutnya &rarr;
      </button>
    </div>

    <!-- Modal Tambah Tiket -->
    <div v-if="isModalOpen" class="modal show">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Buat Tiket Servis Baru</h2>
          <span class="close-modal" @click="isModalOpen = false">&times;</span>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveService">
            <div class="form-group">
              <label>Pelanggan</label>
              <select
                v-model="form.customer_id"
                @change="onCustomerChange"
                required
                style="
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  width: 100%;
                "
              >
                <option value="">-- Pilih Pelanggan --</option>
                <option v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.name }} ({{ c.phone || '-' }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Perangkat</label>
              <select
                v-model="form.device_id"
                @change="onDeviceChange"
                required
                :disabled="!form.customer_id"
                style="
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  width: 100%;
                "
              >
                <option value="">-- Pilih Perangkat --</option>
                <option v-for="d in customerDevices" :key="d.id" :value="d.id">
                  {{ d.brand || '' }} {{ d.model || '' }} - {{ d.device_type }} (SN:
                  {{ d.serial_number || '-' }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Keluhan / Kerusakan (Diisi berdasarkan laporan pelanggan)</label>
              <textarea
                v-model="form.customer_complaint"
                rows="3"
                required
                placeholder="Contoh: Mati total, layar bergaris..."
                style="
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  resize: vertical;
                  width: 100%;
                "
              ></textarea>
            </div>
            <div style="display: flex; gap: 15px">
              <div class="form-group" style="flex: 1">
                <label>Teknisi (Opsional)</label>
                <input
                  type="text"
                  v-model="form.technician"
                  placeholder="Nama teknisi"
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
              <div class="form-group" style="flex: 1">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                  Estimasi Biaya Awal (Opsional)
                  <button type="button" @click="askAiForEstimate" class="btn" style="padding: 2px 8px; font-size: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;" title="Tanya AI untuk estimasi biaya berdasarkan keluhan">✨ Prediksi AI</button>
                </label>
                <input
                  type="number"
                  v-model="form.estimated_cost"
                  placeholder="Misal: 150000"
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
            </div>
            <div
              class="modal-footer"
              style="
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid var(--border-color);
              "
            >
              <button
                type="button"
                class="btn btn-secondary close-modal"
                @click="isModalOpen = false"
                style="padding: 8px 20px"
              >
                Batal
              </button>
              <button type="submit" class="btn btn-primary" style="padding: 8px 20px">
                💾 Buat Tiket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, FileSpreadsheet } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ServiceOrder, Customer, Device } from '../../shared/types'
import { ServiceOrderSchema } from '../utils/validators'
import { Toast } from '../utils/toast'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const router = useRouter()
const route = useRoute()
const services = ref<ServiceOrder[]>([])
const searchQuery = ref<string>('')
const currentPage = ref<number>(1)
const itemsPerPage = 50
const totalItems = ref<number>(0)
const totalPages = computed<number>(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

const customers = ref<Customer[]>([])
const customerDevices = ref<Device[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadServices(1)
  }, 300)
}

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const getStatusColor = (status: string) => {
  let bg = '#e2e8f0'
  let color = '#334155'
  if (status === 'Selesai (Sudah Diambil)') {
    bg = '#10b981'
    color = 'white'
  } else if (status === 'Selesai (Belum Diambil)') {
    bg = '#34d399'
    color = 'white'
  } else if (status === 'Proses Perbaikan') {
    bg = '#3b82f6'
    color = 'white'
  } else if (status === 'Menunggu Sparepart') {
    bg = '#f59e0b'
    color = 'white'
  } else if (status === 'Batal') {
    bg = '#ef4444'
    color = 'white'
  }

  return {
    padding: '4px 8px',
    borderRadius: '4px',
    background: bg,
    color: color,
    fontSize: '0.85rem',
    fontWeight: '500'
  }
}

const isWarrantyActive = (dateStr?: string) => {
  if (!dateStr) return false
  return new Date(dateStr) >= new Date()
}

const loadServices = async (page: number = 1) => {
  if (window.api && window.api.getServices) {
    try {
      const technicianFilter = authStore.currentUser?.role === 'teknisi' ? authStore.currentUser.username : undefined
      const result = await window.api.getServices(searchQuery.value, page, itemsPerPage, technicianFilter)
      services.value = (result.data as ServiceOrder[]) || []
      totalItems.value = result.total || 0
      currentPage.value = result.page || 1
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }
}

const loadCustomersDropdown = async () => {
  if (window.api && window.api.getCustomers) {
    const result = await window.api.getCustomers('', 1, 1000)
    customers.value = (result.data as Customer[]) || []
  }
}

const onCustomerChange = async () => {
  customerDevices.value = []
  form.device_id = ''
  if (form.customer_id && window.api && window.api.getDevicesByCustomer) {
    customerDevices.value = (await window.api.getDevicesByCustomer(
      Number(form.customer_id)
    )) as Device[]
  }
}

const onDeviceChange = async () => {
  if (form.device_id && window.api && window.api.checkWarranty) {
    try {
      const warranty = await window.api.checkWarranty(Number(form.device_id))
      if (warranty) {
        const dateStr = new Date(warranty.warranty_end_date as string).toLocaleDateString('id-ID')
        window.Swal.fire({
          icon: 'warning',
          title: 'Perhatian!',
          html: `Perangkat ini <b>masih dalam masa garansi</b> dari tiket <b>${warranty.ticket_number}</b> hingga tanggal <b>${dateStr}</b>.`,
          confirmButtonText: 'Tutup'
        })
      }
    } catch (error) {
      console.error('Gagal mengecek garansi', error)
    }
  }
}

const goToDetail = (id: number) => {
  router.push(`/services/${id}`)
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const form = reactive({
  customer_id: '',
  device_id: '',
  customer_complaint: '',
  technician: '',
  estimated_cost: ''
})

const openAddModal = async () => {
  form.customer_id = ''
  form.device_id = ''
  form.customer_complaint = ''
  form.technician = ''
  form.estimated_cost = ''
  customerDevices.value = []

  await loadCustomersDropdown()
  isModalOpen.value = true
}

const askAiForEstimate = async () => {
  if (!form.device_id || !form.customer_complaint) {
    return window.Swal.fire('Info', 'Harap isi Perangkat dan Keluhan terlebih dahulu agar AI bisa menganalisis.', 'info')
  }
  
  const device = customerDevices.value.find(d => d.id === Number(form.device_id))
  const deviceStr = device ? `${device.device_type} ${device.brand} ${device.model}` : 'Perangkat'
  
  const prompt = `Anda adalah asisten teknisi handal di Indonesia. Pelanggan membawa perangkat "${deviceStr}" dengan keluhan: "${form.customer_complaint}". 
Tolong berikan jawaban sangat singkat (maksimal 3 kalimat) mengenai kemungkinan kerusakan, tindakan servis, dan estimasi biaya (berupa rentang Rupiah). Jangan gunakan format markdown (seperti * atau #), cukup teks biasa.`
  
  window.Swal.fire({
    title: '✨ Menghubungi AI...',
    text: 'Meminta prediksi ke Google Gemini...',
    allowOutsideClick: false,
    didOpen: () => { window.Swal.showLoading() }
  })
  
  try {
    const res = await window.api.askAi(prompt)
    if (res.success && res.result) {
      window.Swal.fire({
        title: '✨ Prediksi AI',
        text: res.result,
        icon: 'info',
        confirmButtonText: 'Tutup'
      })
    } else {
      window.Swal.fire('Error AI', res.error || 'Terjadi kesalahan.', 'error')
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg, 'error')
  }
}

const saveService = async () => {
  try {
    // Validasi dengan Zod
    try {
      // parse estimated_cost if string
      const payload = {
        ...form,
        customer_id: Number(form.customer_id),
        device_id: Number(form.device_id),
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : 0
      }
      ServiceOrderSchema.parse(payload)
    } catch (validationError: unknown) {
      const err = validationError as { issues?: { message: string }[] }
      const errMsgs = err.issues?.map((e) => e.message).join('<br/>') || 'Validasi Gagal'
      window.Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        html: errMsgs
      })
      return
    }

    const finalPayload = {
      ...form,
      customer_id: Number(form.customer_id),
      device_id: Number(form.device_id),
      estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : 0
    }

    await window.api.addService(finalPayload)
    isModalOpen.value = false
    loadServices()
    window.Swal.fire({
      icon: 'success',
      title: 'Dibuat!',
      text: 'Tiket servis berhasil dibuat.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal membuat tiket servis.', 'error')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    if (!isModalOpen.value) {
      openAddModal()
    }
  }
}

const exportExcel = async () => {
  try {
    // Ambil data servis (maksimal 10.000 data untuk diekspor)
    const technicianFilter = authStore.currentUser?.role === 'teknisi' ? authStore.currentUser.username : undefined
    const result = await window.api.getServices(searchQuery.value, 1, 10000, technicianFilter)
    const data = result.data as ServiceOrder[] || []
    
    if (data.length === 0) {
      return window.Swal.fire('Info', 'Tidak ada data servis untuk diekspor.', 'info')
    }

    const excelData = data.map((s) => ({
      'No. Tiket': s.ticket_number,
      'Tanggal Masuk': new Date(s.received_date + 'Z').toLocaleDateString('id-ID'),
      'Pelanggan': s.customer_name || '-',
      'Perangkat': `${s.brand || ''} ${s.model || ''}`.trim(),
      'Status': s.service_status,
      'Total Biaya': s.total_cost || 0,
      'Teknisi': s.technician || '-'
    }))

    const exportResult = await window.api.exportExcel(excelData)
    if (exportResult.success) {
      Toast.fire({
        icon: 'success',
        title: 'Data servis berhasil disimpan'
      })
    } else if (!exportResult.canceled) {
      window.Swal.fire('Error', 'Gagal menyimpan file Excel: ' + exportResult.error, 'error')
    }
  } catch (error) {
    console.error(error)
    window.Swal.fire('Error', 'Terjadi kesalahan saat memproses ekspor Excel.', 'error')
  }
}

onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  loadServices()
  loadCustomersDropdown()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
