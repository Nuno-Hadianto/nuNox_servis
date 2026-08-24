<template>
  <div class="card warning-card">
    <h2 class="warning-title text-warning">
      <AlertTriangle :size="24" /> Peringatan Stok Sparepart Menipis
    </h2>
    <div class="table-container table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton Loading -->
          <template v-if="isLoading">
            <tr v-for="i in 3" :key="'lowstock-skeleton-' + i">
              <td><SkeletonLoader width="60px" height="20px" /></td>
              <td><SkeletonLoader width="120px" height="20px" /></td>
              <td><SkeletonLoader width="40px" height="20px" borderRadius="10px" /></td>
              <td><SkeletonLoader width="70px" height="20px" borderRadius="12px" /></td>
            </tr>
          </template>

          <!-- Actual Data -->
          <template v-else>
            <tr v-if="items.length === 0">
              <td colspan="4" class="text-center empty-state">Semua stok sparepart aman.</td>
            </tr>
            <tr v-for="part in items" :key="part.id">
              <td>{{ part.part_code || '-' }}</td>
              <td>
                <strong>{{ part.name }}</strong>
              </td>
              <td>
                <span class="badge badge-danger">
                  {{ part.stock }}
                </span>
              </td>
              <td>
                <button
                  @click="$router.push('/parts?search=' + (part.part_code || part.name))"
                  class="btn btn-sm btn-primary btn-action"
                >
                  + Isi Stok
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import SkeletonLoader from '../SkeletonLoader.vue'
import type { Part } from '../../../shared/types'
import { useRouter } from 'vue-router'

defineProps<{
  items: Part[]
  isLoading: boolean
}>()

const $router = useRouter()
</script>

<style scoped>
.warning-title {
  margin-bottom: 15px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.table-scroll {
  max-height: 250px;
}
.empty-state {
  padding: 20px;
  color: #64748b;
}
.btn-action {
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.text-center {
  text-align: center;
}
</style>
