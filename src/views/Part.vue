<template>
  <div class="view-section" style="position: relative;">
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
          placeholder="Cari item di katalog (Kode / Nama)..."
          class="form-control"
          style="width: 100%; padding-left: 38px; border-radius: 20px"
        />
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <select
          v-model="sortBy"
          @change="loadParts(1)"
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
          style="display: flex; align-items: center; gap: 6px; border-radius: 20px"
        >
          <Plus :size="18" /> Tambah Item
        </button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Item</th>
            <th>Kategori</th>
            <th>Harga Modal</th>
            <th>Harga Jual</th>
            <th>Margin/Pcs</th>
            <th style="text-align: center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="parts.length === 0">
            <td colspan="6" style="text-align: center; padding: 20px">Belum ada data sparepart.</td>
          </tr>
          <tr v-for="p in parts" :key="p.id">
            <td>{{ p.part_code || '-' }}</td>
            <td>{{ p.name }}</td>
            <td>{{ p.category || '-' }}</td>
            <td>{{ formatCurrency(p.buy_price) }}</td>
            <td>{{ formatCurrency(p.sell_price) }}</td>
            <td :style="{ color: p.sell_price > p.buy_price ? '#10b981' : (p.sell_price < p.buy_price ? '#ef4444' : 'inherit'), fontWeight: 'bold' }">
              {{ formatCurrency((p.sell_price || 0) - (p.buy_price || 0)) }}
              <span v-if="p.buy_price > 0" style="font-size: 0.8em; opacity: 0.8">
                ({{ Math.round(((p.sell_price - p.buy_price) / p.buy_price) * 100) }}%)
              </span>
            </td>
            <td>
              <div style="display: flex; justify-content: center; gap: 8px;">
                <button
                  class="btn btn-secondary btn-sm"
                  @click="editPart(p)"
                  style="display: inline-flex; align-items: center; gap: 6px"
                >
                  <Edit :size="14" /> Edit
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="deletePart(p.id)"
                  style="display: inline-flex; align-items: center; gap: 6px"
                >
                  <Trash2 :size="14" /> Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Custom Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1" 
        @click="prevPage"
      >
        <ChevronLeft :size="18" />
      </button>
      <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages" 
        @click="nextPage"
      >
        <ChevronRight :size="18" />
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
          <form @submit.prevent="savePart">
            <div style="display: flex; gap: 15px">
              <div class="form-group" style="flex: 1">
                <label>Kode Barang (Opsional)</label>
                <input
                  type="text"
                  v-model="form.part_code"
                  placeholder="Contoh: LCD-IP-11"
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
              <div class="form-group" style="flex: 1">
                <label>Kategori</label>
                <input
                  type="text"
                  v-model="form.category"
                  placeholder="Contoh: LCD, Baterai..."
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
            </div>
            <div class="form-group">
              <label>Nama Item</label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Nama barang / jasa"
                style="
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  width: 100%;
                "
              />
            </div>
            <div style="display: flex; gap: 15px">
              <div class="form-group" style="flex: 1">
                <label>Satuan (Opsional)</label>
                <input
                  type="text"
                  v-model="form.unit"
                  placeholder="Pcs, Unit..."
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
            </div>
            <div style="display: flex; gap: 15px">
              <div class="form-group" style="flex: 1">
                <label>Harga Beli / Modal (Rp)</label>
                <input
                  type="number"
                  v-model.number="form.buy_price"
                  required
                  min="0"
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
              <div class="form-group" style="flex: 1">
                <label>Harga Jual (Rp)</label>
                <input
                  type="number"
                  v-model.number="form.sell_price"
                  required
                  min="0"
                  style="
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 10px;
                    width: 100%;
                  "
                />
              </div>
            </div>
            <div class="form-group">
              <label>Catatan Tambahan</label>
              <textarea
                v-model="form.notes"
                rows="2"
                style="
                  border: 1px solid var(--border-color);
                  border-radius: var(--radius-sm);
                  padding: 10px;
                  width: 100%;
                  resize: vertical;
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Part } from '../../shared/types'


const route = useRoute()
const parts = ref<Part[]>([])
const sortBy = ref<string>('name_asc')
const searchQuery = ref<string>((route.query.search as string) || '')
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 15

watch(
  () => route.query.search,
  (newSearch) => {
    if (newSearch !== undefined) {
      searchQuery.value = newSearch as string
      loadParts()
    }
  }
)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // Reset to first page on search
    loadParts()
  }, 300)
}

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const loadParts = async (page?: number) => {
  if (page) {
    currentPage.value = page
  }
  if (window.api && window.api.getParts) {
    try {
      const response = await window.api.getParts(searchQuery.value, currentPage.value, limit, sortBy.value) as { data: Part[], total: number };
      parts.value = response.data;
      totalPages.value = Math.ceil(response.total / limit) || 1;
    } catch (error) {
      console.error('Failed to load parts:', error)
    }
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadParts()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadParts()
  }
}


// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Item')
const formId = ref<number | null>(null)
const form = reactive({
  part_code: '',
  name: '',
  category: '',
  buy_price: 0,
  sell_price: 0,
  unit: 'Pcs',
  notes: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Item'
  formId.value = null
  form.part_code = ''
  form.name = ''
  form.category = ''
  form.buy_price = 0
  form.sell_price = 0
  form.unit = 'Pcs'
  form.notes = ''
  isModalOpen.value = true
}

// History Logic removed

const editPart = async (p: Part) => {
  try {
    const detail = (await window.api.getPart(p.id)) as Part
    if (detail) {
      modalTitle.value = 'Edit Item'
      formId.value = detail.id || null
      form.part_code = detail.part_code || ''
      form.name = detail.name || ''
      form.category = detail.category || ''
      form.buy_price = detail.buy_price || 0
      form.sell_price = detail.sell_price || 0
      form.unit = detail.unit || ''
      form.notes = detail.notes || ''
      isModalOpen.value = true
    }
  } catch (error) {
    console.error(error)
    window.Swal.fire('Error', 'Gagal memuat detail sparepart.', 'error')
  }
}

const savePart = async () => {
  try {
    if (formId.value) {
      await window.api.updatePart(formId.value, { ...form })
    } else {
      await window.api.addPart({ ...form })
    }
    isModalOpen.value = false
    loadParts()
    window.Swal.fire({
      icon: 'success',
      title: 'Tersimpan!',
      text: 'Data sparepart berhasil disimpan.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal menyimpan data.', 'error')
  }
}

const deletePart = async (id: number) => {
  const result = await window.Swal.fire({
    title: 'Hapus Sparepart?',
    text: 'Data yang dihapus tidak bisa dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await window.api.deletePart(id)
      window.Swal.fire('Terhapus!', 'Sparepart berhasil dihapus.', 'success')
      loadParts()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      window.Swal.fire('Error', msg || 'Gagal menghapus.', 'error')
    }
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
  loadParts()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
