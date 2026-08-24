<template>
  <div class="card warning-card">
    <h2 class="warning-title text-primary">
      <ClipboardList :size="24" /> To-Do Teknisi
    </h2>
    <div class="table-container table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Keterangan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton Loading -->
          <template v-if="isLoading">
            <tr v-for="i in 3" :key="'todo-skeleton-' + i">
              <td><SkeletonLoader width="80px" height="20px" /></td>
              <td><SkeletonLoader width="150px" height="20px" /></td>
              <td><SkeletonLoader width="60px" height="20px" borderRadius="10px" /></td>
            </tr>
          </template>

          <!-- Actual Data -->
          <template v-else>
            <tr v-if="!items || items.length === 0">
              <td colspan="3" class="text-center empty-state">Tidak ada tugas mendesak hari ini.</td>
            </tr>
            <tr
              v-for="todo in items"
              :key="todo.id"
              @click="$router.push('/services/' + todo.id)"
              class="clickable-row"
              title="Klik untuk Buka Detail"
            >
              <td class="ticket-col">{{ todo.ticket_number }}</td>
              <td>
                <strong>{{ todo.description }}</strong>
              </td>
              <td>
                <span v-if="todo.type === 'overdue'" class="badge badge-danger">Terlewat</span>
                <span v-else-if="todo.type === 'deadline_today'" class="badge badge-warning">Hari Ini</span>
                <span v-else class="badge badge-info">Menunggu</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'
import SkeletonLoader from '../SkeletonLoader.vue'
import type { TodoItem } from '../../../shared/types'
import { useRouter } from 'vue-router'

defineProps<{
  items: TodoItem[]
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
.clickable-row {
  cursor: pointer;
}
.ticket-col {
  color: var(--primary);
  font-weight: bold;
}
.text-center {
  text-align: center;
}
</style>
