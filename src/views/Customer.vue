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
          placeholder="Cari pelanggan (Nama / HP)..."
          class="form-control"
          style="width: 100%; padding-left: 38px; border-radius: 20px"
        />
      </div>

      <select
        v-model="sortBy"
        @change="loadCustomers(1)"
        class="form-control"
        style="width: auto; height: 38px; border-radius: 20px; cursor: pointer"
      >
        <option value="name_asc">Urutan: Nama (A-Z)</option>
        <option value="name_desc">Urutan: Nama (Z-A)</option>
        <option value="id_desc">Urutan: Terbaru Ditambah</option>
        <option value="id_asc">Urutan: Terlama Ditambah</option>
      </select>

      <button
        @click="openAddModal"
        class="btn btn-primary"
        style="display: flex; align-items: center; gap: 8px"
      >
        <Plus :size="18" /> Tambah Pelanggan
      </button>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>No. HP</th>
            <th>Alamat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="customers.length === 0">
            <td colspan="5" style="text-align: center; padding: 20px">Belum ada data pelanggan.</td>
          </tr>
          <tr v-for="c in customers" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.name }}</td>
            <td>{{ c.phone || '-' }}</td>
            <td>{{ c.address || '-' }}</td>
            <td>
              <button
                class="btn btn-secondary btn-sm"
                @click="editCustomer(c)"
                style="display: inline-flex; align-items: center; gap: 6px"
              >
                <Edit :size="14" /> Edit
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="deleteCustomer(c.id)"
                style="display: inline-flex; align-items: center; gap: 6px"
              >
                <Trash2 :size="14" /> Hapus
              </button>
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
        @click="loadCustomers(currentPage - 1)"
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
        @click="loadCustomers(currentPage + 1)"
        style="border-radius: 20px; padding: 6px 16px; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;"
        onmouseover="if(!this.disabled) this.style.transform='translateX(3px)'"
        onmouseout="if(!this.disabled) this.style.transform='translateX(0)'"
      >
        Selanjutnya <ChevronRight :size="16" />
      </button>
    </div>

    <!-- Modal Tambah/Edit -->
    <div v-if="isModalOpen" class="modal show">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <span class="close-modal" @click="isModalOpen = false">&times;</span>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCustomer">
            <div class="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Contoh: Budi Santoso"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>No. HP/WhatsApp</label>
              <input
                type="text"
                v-model="form.phone"
                required
                placeholder="Contoh: 08123456789"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Alamat (Opsional)</label>
              <textarea
                v-model="form.address"
                rows="3"
                placeholder="Alamat lengkap"
                class="form-control"
                style="resize: vertical;"
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
              <button type="submit" class="btn btn-primary" style="padding: 8px 20px">
                💾 Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted } from 'vue'
import type { Customer } from '../../shared/types'
import { CustomerSchema } from '../utils/validators'


const customers = ref<Customer[]>([])
const searchQuery = ref<string>('')
const sortBy = ref<string>('name_asc')
const currentPage = ref<number>(1)
const itemsPerPage = 50
const totalItems = ref<number>(0)
const totalPages = computed<number>(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCustomers(1)
  }, 300)
}

const loadCustomers = async (page: number = 1) => {
  if (window.api && window.api.getCustomers) {
    try {
      const result = await window.api.getCustomers(searchQuery.value, page, itemsPerPage, sortBy.value)
      customers.value = (result.data as Customer[]) || []
      totalItems.value = result.total || 0
      currentPage.value = result.page || 1
    } catch (error) {
      console.error('Failed to load customers:', error)
    }
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Pelanggan')
const formId = ref<number | null>(null)
const form = reactive({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Pelanggan'
  formId.value = null
  form.name = ''
  form.phone = ''
  form.address = ''
  form.notes = ''
  isModalOpen.value = true
}

const editCustomer = async (c: Customer) => {
  try {
    const detail = (await window.api.getCustomer(c.id)) as Customer
    if (detail) {
      modalTitle.value = 'Edit Pelanggan'
      formId.value = detail.id || null
      form.name = detail.name || ''
      form.phone = detail.phone || ''
      form.address = detail.address || ''
      form.notes = detail.notes || ''
      isModalOpen.value = true
    }
  } catch (error) {
    console.error(error)
    window.Swal.fire('Error', 'Gagal memuat detail pelanggan.', 'error')
  }
}

const saveCustomer = async () => {
  try {
    // Validasi dengan Zod
    try {
      CustomerSchema.parse(form)
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

    if (formId.value) {
      await window.api.updateCustomer(formId.value, { ...form })
    } else {
      await window.api.addCustomer({ ...form })
    }
    isModalOpen.value = false
    loadCustomers(currentPage.value)
    window.Swal.fire({
      icon: 'success',
      title: 'Tersimpan!',
      text: 'Data pelanggan berhasil disimpan.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal menyimpan data pelanggan.', 'error')
  }
}

const deleteCustomer = async (id: number) => {
  const result = await window.Swal.fire({
    title: 'Hapus Pelanggan?',
    text: 'Data tidak dapat dikembalikan! Semua perangkat terkait mungkin tidak bisa dihapus jika memiliki riwayat servis.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await window.api.deleteCustomer(id)
      window.Swal.fire('Terhapus!', 'Pelanggan berhasil dihapus.', 'success')
      loadCustomers(currentPage.value)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      window.Swal.fire('Error', msg || 'Gagal menghapus.', 'error')
    }
  }
}



onMounted(() => {
  loadCustomers()
})
</script>
