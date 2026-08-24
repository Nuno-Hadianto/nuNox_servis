<template>
  <div class="card warning-card">
    <h2 class="warning-title text-danger">
      <AlertOctagon :size="24" /> Peringatan Follow-up Pelanggan
    </h2>
    <div class="table-container table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Status</th>
            <th>Lama (Hari)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton Loading -->
          <template v-if="isLoading">
            <tr v-for="i in 3" :key="'abandoned-skeleton-' + i">
              <td><SkeletonLoader width="80px" height="20px" /></td>
              <td><SkeletonLoader width="100px" height="20px" borderRadius="10px" /></td>
              <td><SkeletonLoader width="60px" height="20px" borderRadius="10px" /></td>
              <td><SkeletonLoader width="40px" height="20px" borderRadius="12px" /></td>
            </tr>
          </template>

          <!-- Actual Data -->
          <template v-else>
            <tr v-if="!items || items.length === 0">
              <td colspan="4" class="text-center empty-state">
                Tidak ada barang tertunda/terlantar.
              </td>
            </tr>
            <tr
              v-for="srv in items"
              :key="srv.id"
              @click="$router.push('/services/' + srv.id)"
              class="clickable-row"
              title="Klik untuk Buka Detail"
            >
              <td class="ticket-col">{{ srv.ticket_number }}</td>
              <td>
                <span class="badge badge-warning">{{ srv.service_status }}</span>
              </td>
              <td>
                <span class="badge badge-danger"> {{ srv.days_pending }} Hari </span>
              </td>
              <td>
                <button @click.stop="$emit('send-wa', srv)" class="btn btn-sm btn-wa">
                  💬 WA
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
import { AlertOctagon } from 'lucide-vue-next'
import SkeletonLoader from '../SkeletonLoader.vue'
import type { AbandonedService } from '../../../shared/types'
import { useRouter } from 'vue-router'

defineProps<{
  items: AbandonedService[]
  isLoading: boolean
}>()

defineEmits(['send-wa'])

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
.clickable-row {
  cursor: pointer;
}
.ticket-col {
  color: var(--primary);
  font-weight: bold;
}
.btn-wa {
  background-color: #25d366;
  color: white;
  border: none;
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
