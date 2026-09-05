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
      
      <select
        v-model="sortBy"
        @change="loadServices(1)"
        class="form-control"
        style="width: max-content; min-width: 200px; padding: 8px 16px; border-radius: 20px; cursor: pointer"
      >
        <option value="name_asc">Urutan: Nama Pelanggan (A-Z)</option>
        <option value="name_desc">Urutan: Nama Pelanggan (Z-A)</option>
        <option value="id_desc">Urutan: Terbaru Dibuat</option>
        <option value="id_asc">Urutan: Terlama Dibuat</option>
      </select>

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
            <td colspan="6" style="text-align: center; padding: 40px 20px">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.7;">
                <Wrench :size="48" style="margin-bottom: 15px; color: var(--primary);" />
                <h3 style="margin: 0 0 10px; font-weight: 600; font-size: 1.2rem;">Belum Ada Data Servis</h3>
                <p style="margin: 0; font-size: 0.95rem;">Klik tombol "Buat Tiket Servis" di atas untuk menambahkan data pertama Anda.</p>
              </div>
            </td>
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
              <div style="display: flex; justify-content: center; gap: 8px;">
                <button class="btn btn-secondary btn-sm" @click="openEditModal(s)" style="display: inline-flex; align-items: center; gap: 6px;">
                  <Edit :size="14" /> Edit
                </button>
                <button class="btn btn-primary btn-sm" @click="goToDetail(s.id)" style="display: inline-flex; align-items: center; gap: 6px">
                  <Info :size="14" /> Detail
                </button>
                <button class="btn btn-danger btn-sm" @click="deleteService(s.id, s.ticket_number)" style="display: inline-flex; align-items: center; gap: 6px">
                  <Trash2 :size="14" /> Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Custom Pagination -->
    <div
      class="pagination-controls"
      v-if="totalPages > 1"
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
        style="border-radius: 20px; padding: 6px 16px; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;"
        onmouseover="if(!this.disabled) this.style.transform='translateX(-3px)'"
        onmouseout="if(!this.disabled) this.style.transform='translateX(0)'"
      >
        <ChevronLeft :size="16" /> Sebelumnya
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
        style="border-radius: 20px; padding: 6px 16px; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;"
        onmouseover="if(!this.disabled) this.style.transform='translateX(3px)'"
        onmouseout="if(!this.disabled) this.style.transform='translateX(0)'"
      >
        Selanjutnya <ChevronRight :size="16" />
      </button>
    </div>

    <!-- Modal Tambah Tiket -->
    <div v-if="isModalOpen" class="modal show">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editId ? 'Edit Tiket Servis' : 'Buat Tiket Servis Baru' }}</h2>
          <button class="btn-close" @click="isModalOpen = false"><X :size="20" /></button>
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
            <div class="form-group" v-if="!editId">
              <label>Kelengkapan & Kondisi Fisik (Opsional)</label>
              <textarea
                v-model="form.physical_condition"
                rows="2"
                placeholder="Contoh: Bawa charger dan tas. Bodi bawah lecet pemakaian."
                style="
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  resize: vertical;
                  width: 100%;
                "
              ></textarea>
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
                class="btn btn-cancel"
                @click="isModalOpen = false"
                style="padding: 8px 20px"
              >
                Batal
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                style="display: flex; align-items: center; gap: 5px"
                :disabled="!form.customer_id || !form.device_id"
              >
                <Save :size="16" /> {{ editId ? 'Simpan Perubahan' : 'Buat Tiket' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, ChevronLeft, ChevronRight, Edit, Trash2, Info, Wrench, Save } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ServiceOrder, Customer, Device, PaginatedResponse } from '../../shared/types'
import { ServiceStatus } from '../../shared/types'
import { ServiceOrderSchema } from '../utils/validators'

const router = useRouter()
const route = useRoute()
const customerDevices = ref<Device[]>([])
const searchQuery = ref<string>('')
const sortBy = ref<string>('id_desc')
const currentPage = ref<number>(1)
const itemsPerPage = 50
const totalItems = ref<number>(0)
const totalPages = computed<number>(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

const services = ref<ServiceOrder[]>([])
const customers = ref<Customer[]>([])

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
  if (status === ServiceStatus.SELESAI_SUDAH_DIAMBIL) {
    bg = '#10b981'
    color = 'white'
  } else if (status === ServiceStatus.SELESAI_BELUM_DIAMBIL) {
    bg = '#34d399'
    color = 'white'
  } else if (status === ServiceStatus.PROSES_PERBAIKAN) {
    bg = '#3b82f6'
    color = 'white'
  } else if (status === ServiceStatus.MENUNGGU_SPAREPART) {
    bg = '#f59e0b'
    color = 'white'
  } else if (status === ServiceStatus.BATAL || status === 'Dibatalkan') {
    bg = '#ef4444'
    color = 'white'
  }

  return {
    padding: '4px 8px',
    borderRadius: '4px',
    background: bg,
    color: color,
    fontSize: '0.85rem',
    fontWeight: '500',
    boxShadow: `0 0 10px ${bg}66`,
    border: `1px solid ${bg}`
  }
}

const isWarrantyActive = (dateStr?: string) => {
  if (!dateStr) return false
  return new Date(dateStr) >= new Date()
}

const loadServices = async (page: number = 1) => {
  if (window.api && window.api.getServices) {
    try {
      const result = await window.api.getServices(searchQuery.value, page, itemsPerPage, undefined, sortBy.value) as PaginatedResponse<ServiceOrder>
      services.value = result.data || []
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

const deleteService = async (id: number, ticketNo: string) => {
  const result = await window.Swal.fire({
    title: 'Hapus Tiket Servis?',
    text: `Anda yakin ingin menghapus tiket ${ticketNo}? Tindakan ini tidak bisa dibatalkan!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await window.api.deleteService(id)
      window.Swal.fire('Terhapus!', 'Tiket servis berhasil dihapus.', 'success')
      loadServices(currentPage.value)
    } catch (error: unknown) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      window.Swal.fire('Gagal', msg || 'Gagal menghapus tiket servis.', 'error')
    }
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const editId = ref<number | null>(null)
const form = reactive({
  customer_id: '',
  device_id: '',
  customer_complaint: '',
  physical_condition: ''
})

const openAddModal = async () => {
  editId.value = null
  form.customer_id = ''
  form.device_id = ''
  form.customer_complaint = ''
  form.physical_condition = ''
  customerDevices.value = []

  await loadCustomersDropdown()
  isModalOpen.value = true
}

const openEditModal = async (s: ServiceOrder) => {
  editId.value = s.id
  await loadCustomersDropdown()
  
  form.customer_id = String(s.customer_id)
  await onCustomerChange()
  
  form.device_id = String(s.device_id)
  form.customer_complaint = s.customer_complaint
  form.physical_condition = '' // Tidak dipakai saat edit karena sudah digabung
  
  isModalOpen.value = true
}


const saveService = async () => {
  try {
    const finalComplaint = form.physical_condition 
      ? `${form.customer_complaint}\n\n[Kelengkapan & Kondisi Fisik]:\n${form.physical_condition}` 
      : form.customer_complaint;

    // Validasi dengan Zod
    try {
      // parse estimated_cost if string
      const payload = {
        ...form,
        customer_complaint: finalComplaint,
        customer_id: Number(form.customer_id),
        device_id: Number(form.device_id)
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
      customer_complaint: finalComplaint,
      customer_id: Number(form.customer_id),
      device_id: Number(form.device_id)
    }

    if (editId.value) {
      await window.api.updateServiceDetails(editId.value, finalPayload)
    } else {
      await window.api.addService(finalPayload)
    }
    
    isModalOpen.value = false
    loadServices()
    window.Swal.fire({
      icon: 'success',
      title: editId.value ? 'Tersimpan!' : 'Dibuat!',
      text: editId.value ? 'Perubahan berhasil disimpan.' : 'Tiket servis berhasil dibuat.',
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
