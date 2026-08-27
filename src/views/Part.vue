<template>
  <div class="view-section" style="position: relative;">
    <div
      class="action-bar"
      style="
        display: flex;
        gap: 15px;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        justify-content: space-between;
      "
    >
      <div style="position: relative; flex: 1; min-width: 250px; max-width: 400px">
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
          placeholder="Cari sparepart (Kode / Nama)..."
          class="form-control"
          style="width: 100%; padding-left: 38px; border-radius: 20px"
        />
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <button
          @click="importExcel"
          class="btn btn-secondary"
          style="display: flex; align-items: center; gap: 6px; border-radius: 20px"
        >
          <span>📥</span> Import Excel
        </button>
        <button
          @click="exportExcel"
          class="btn"
          style="
            background-color: #10b981;
            color: white;
            display: flex; align-items: center; gap: 8px; border-radius: 20px;
          "
        >
          <FileSpreadsheet :size="18" /> Ekspor Excel
        </button>
        <button
          @click="openAddModal"
          class="btn btn-primary"
          style="display: flex; align-items: center; gap: 6px; border-radius: 20px"
        >
          <Plus :size="18" /> Tambah Sparepart
        </button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Sparepart</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Harga Modal</th>
            <th>Harga Jual</th>
            <th>Margin/Pcs</th>
            <th>Aksi</th>
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
            <td>
              <span
                v-if="p.stock <= 5"
                class="badge"
                style="
                  background: rgba(239, 68, 68, 0.1);
                  color: #ef4444;
                  border: 1px solid rgba(239, 68, 68, 0.2);
                "
              >
                ⚠️ {{ p.stock }} {{ p.unit || '' }}
              </span>
              <span v-else> {{ p.stock }} {{ p.unit || '' }} </span>
            </td>
            <td>{{ formatCurrency(p.buy_price) }}</td>
            <td>{{ formatCurrency(p.sell_price) }}</td>
            <td :style="{ color: p.sell_price > p.buy_price ? '#10b981' : (p.sell_price < p.buy_price ? '#ef4444' : 'inherit'), fontWeight: 'bold' }">
              {{ formatCurrency((p.sell_price || 0) - (p.buy_price || 0)) }}
              <span v-if="p.buy_price > 0" style="font-size: 0.8em; opacity: 0.8">
                ({{ Math.round(((p.sell_price - p.buy_price) / p.buy_price) * 100) }}%)
              </span>
            </td>
            <td>
              <button
                class="btn btn-secondary btn-sm"
                @click="openHistory(p)"
                style="display: inline-flex; align-items: center; gap: 6px; background: var(--surface-light);"
              >
                <History :size="14" /> Histori
              </button>
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
            </td>
          </tr>
        </tbody>
      </table>
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
              <label>Nama Sparepart</label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Nama barang"
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
                <label>Stok Awal</label>
                <input
                  type="number"
                  v-model.number="form.stock"
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
                <label>Satuan</label>
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
                class="btn btn-secondary close-modal"
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

    <!-- Modal Histori Stok -->
    <div v-if="isHistoryModalOpen" class="modal show">
      <div class="modal-content" style="max-width: 650px;">
        <div class="modal-header">
          <h2>Histori Stok: {{ selectedPartName }}</h2>
          <span class="close-modal" @click="isHistoryModalOpen = false">&times;</span>
        </div>
        <div class="modal-body">
          <div v-if="partLogs.length === 0" style="text-align: center; padding: 20px; color: var(--text-secondary);">
            Belum ada riwayat pergerakan stok untuk barang ini.
          </div>
          <table v-else class="data-table" style="font-size: 0.9em;">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Alasan</th>
                <th>Referensi</th>
                <th>Perubahan</th>
                <th>Stok Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in partLogs" :key="log.id">
                <td>{{ log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-' }}</td>
                <td>{{ log.reason }}</td>
                <td>{{ log.reference_id || '-' }}</td>
                <td :style="{ color: log.change_amount > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }">
                  {{ log.change_amount > 0 ? '+' : '' }}{{ log.change_amount }}
                </td>
                <td>{{ log.new_stock }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, Edit, Trash2, FileSpreadsheet, History } from 'lucide-vue-next'
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Part } from '../../shared/types'

const route = useRoute()
interface PartLog {
  id: number;
  created_at: string;
  reason: string;
  reference_id?: string;
  change_amount: number;
  new_stock: number;
}
const parts = ref<Part[]>([])
const searchQuery = ref<string>((route.query.search as string) || '')

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

const loadParts = async () => {
  if (window.api && window.api.getParts) {
    try {
      parts.value = (await window.api.getParts(searchQuery.value)) as Part[]
    } catch (error) {
      console.error('Failed to load parts:', error)
    }
  }
}

const importExcel = async () => {
  try {
    const res = await window.api.importPartsExcel()
    if (res.canceled) return

    if (res.success) {
      window.Swal.fire(
        'Berhasil',
        `Import: ${res.result.imported} baru, ${res.result.updated} diperbarui.`,
        'success'
      )
      loadParts()
    } else {
      window.Swal.fire('Gagal', res.error || 'Terjadi kesalahan saat import.', 'error')
    }
  } catch (err) {
    console.error(err)
    window.Swal.fire('Error', 'Gagal memproses file Excel.', 'error')
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Sparepart')
const formId = ref<number | null>(null)
const form = reactive({
  part_code: '',
  name: '',
  category: '',
  stock: 0,
  buy_price: 0,
  sell_price: 0,
  unit: 'Pcs',
  notes: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Sparepart'
  formId.value = null
  form.part_code = ''
  form.name = ''
  form.category = ''
  form.stock = 0
  form.buy_price = 0
  form.sell_price = 0
  form.unit = 'Pcs'
  form.notes = ''
  isModalOpen.value = true
}

// History Logic
const isHistoryModalOpen = ref(false)
const selectedPartName = ref('')
const partLogs = ref<PartLog[]>([])

const openHistory = async (p: Part) => {
  selectedPartName.value = p.name
  partLogs.value = []
  isHistoryModalOpen.value = true
  try {
    const logs = await window.api.getPartLogs(p.id)
    partLogs.value = logs as PartLog[]
  } catch (error) {
    console.error(error)
    window.Swal.fire('Error', 'Gagal memuat histori stok.', 'error')
  }
}

const editPart = async (p: Part) => {
  try {
    const detail = (await window.api.getPart(p.id)) as Part
    if (detail) {
      modalTitle.value = 'Edit Sparepart'
      formId.value = detail.id || null
      form.part_code = detail.part_code || ''
      form.name = detail.name || ''
      form.category = detail.category || ''
      form.stock = detail.stock || 0
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

const exportExcel = async () => {
  try {
    const result = await window.api.getParts(searchQuery.value)
    const data = result as Part[] || []
    
    if (data.length === 0) {
      return window.Swal.fire('Info', 'Tidak ada data sparepart untuk diekspor.', 'info')
    }

    const excelData = data.map((p) => ({
      'Kode Barang': p.part_code || '-',
      'Nama Sparepart': p.name,
      'Kategori': p.category || '-',
      'Stok': p.stock,
      'Satuan': p.unit || 'Pcs',
      'Harga Modal': p.buy_price,
      'Harga Jual': p.sell_price,
      'Catatan': p.notes || ''
    }))

    const exportResult = await window.api.exportExcel(excelData)
    if (exportResult.success) {
      window.Swal.fire({
        icon: 'success',
        title: 'Tersimpan',
        text: 'Data sparepart berhasil diekspor.',
        timer: 1500,
        showConfirmButton: false
      })
    } else if (!exportResult.canceled) {
      window.Swal.fire('Error', 'Gagal menyimpan file Excel: ' + exportResult.error, 'error')
    }
  } catch (error) {
    console.error(error)
    window.Swal.fire('Error', 'Terjadi kesalahan saat memproses ekspor Excel.', 'error')
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
