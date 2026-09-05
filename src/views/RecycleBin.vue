<template>
  <div class="view-section">
    <div
      class="action-bar"
      style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; justify-content: space-between;"
    >
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">Keranjang Sampah</h2>
      <button
        @click="loadDeletedItems"
        class="btn btn-secondary"
        style="display: flex; align-items: center; gap: 8px"
      >
        <RefreshCw :size="18" :class="{ 'spin-anim': loading }" /> Segarkan
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Jenis Data</th>
            <th>Nama / Deskripsi</th>
            <th>Tanggal Dihapus</th>
            <th style="width: 250px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="deletedItems.length === 0 && !loading">
            <td colspan="4" style="text-align: center; padding: 40px 20px">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.7;">
                <Trash2 :size="48" style="margin-bottom: 15px; color: var(--primary);" />
                <h3 style="margin: 0 0 10px; font-weight: 600; font-size: 1.2rem;">Keranjang Sampah Kosong</h3>
                <p style="margin: 0; font-size: 0.95rem;">Belum ada data yang dihapus saat ini.</p>
              </div>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="4" style="text-align: center; padding: 40px 20px">
               Memuat data...
            </td>
          </tr>
          <tr v-for="item in deletedItems" :key="`${item.type}-${item.id}`">
            <td>
              <span class="badge" :class="getBadgeClass(item.type)">
                {{ getTypeName(item.type) }}
              </span>
            </td>
            <td style="font-weight: 500;">{{ item.name }}</td>
            <td>{{ formatDate(item.deleted_at) }}</td>
            <td>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button
                  class="btn btn-primary btn-sm"
                  @click="restoreItem(item)"
                  style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 1; min-width: 110px; white-space: nowrap;"
                >
                  <RefreshCcw :size="14" /> Pulihkan
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="hardDeleteItem(item)"
                  style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 1; min-width: 140px; white-space: nowrap;"
                >
                  <Trash :size="14" /> Hapus Permanen
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RefreshCw, RefreshCcw, Trash, Trash2 } from 'lucide-vue-next';
import type { RecycleBinItem } from '../../shared/types';
import Swal from 'sweetalert2';

const deletedItems = ref<RecycleBinItem[]>([]);
const loading = ref(false);

const getTypeName = (type: string) => {
  switch (type) {
    case 'customer': return 'Pelanggan';
    case 'device': return 'Perangkat';
    case 'service': return 'Servis';
    case 'part': return 'Sparepart';
    default: return type;
  }
};

const getBadgeClass = (type: string) => {
  switch (type) {
    case 'customer': return 'badge-success';
    case 'device': return 'badge-primary';
    case 'service': return 'badge-warning';
    case 'part': return 'badge-info';
    default: return 'badge-secondary';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const loadDeletedItems = async () => {
  loading.value = true;
  try {
    const response = await window.api.getDeletedItems();
    if (response.success) {
      deletedItems.value = response.data;
    } else {
      console.error(response.error);
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const restoreItem = async (item: RecycleBinItem) => {
  const result = await Swal.fire({
    title: 'Pulihkan Data?',
    text: `Anda yakin ingin memulihkan ${getTypeName(item.type)} "${item.name}"? Data akan dikembalikan seperti semula.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Pulihkan',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    try {
      const res = await window.api.restoreItem(item.id, item.type);
      if (res.success) {
        Swal.fire('Berhasil!', 'Data telah dipulihkan.', 'success');
        loadDeletedItems();
      } else {
        Swal.fire('Gagal', res.error || 'Terjadi kesalahan', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
    }
  }
};

const hardDeleteItem = async (item: RecycleBinItem) => {
  const result = await Swal.fire({
    title: 'Hapus Permanen?',
    text: `PERINGATAN: ${getTypeName(item.type)} "${item.name}" akan dihapus SELAMANYA dari database dan tidak bisa dipulihkan kembali!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus Permanen',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    try {
      const res = await window.api.hardDeleteItem(item.id, item.type);
      if (res.success) {
        Swal.fire('Terhapus!', 'Data telah dihapus permanen.', 'success');
        loadDeletedItems();
      } else {
        Swal.fire('Gagal', res.error || 'Terjadi kesalahan', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
    }
  }
};

onMounted(() => {
  loadDeletedItems();
});
</script>

<style scoped>
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}
.badge-success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge-primary { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.badge-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.badge-info { background: rgba(14, 165, 233, 0.15); color: #0ea5e9; }
.badge-secondary { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

.spin-anim {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
