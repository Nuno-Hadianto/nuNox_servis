<template>
  <div class="pagination-controls" v-if="totalPages > 1">
    <button
      class="btn btn-secondary btn-sm pagination-btn"
      :disabled="currentPage === 1"
      @click="$emit('change', currentPage - 1)"
    >
      <ChevronLeft :size="16" /> Sebelumnya
    </button>
    <span class="pagination-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
    <button
      class="btn btn-secondary btn-sm pagination-btn"
      :disabled="currentPage >= totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      Selanjutnya <ChevronRight :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  (e: 'change', page: number): void
}>()
</script>

<style scoped>
.pagination-controls {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}

.pagination-btn {
  border-radius: 20px;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.pagination-btn:not(:disabled):hover:first-child {
  transform: translateX(-3px);
}
.pagination-btn:not(:disabled):hover:last-child {
  transform: translateX(3px);
}

.pagination-info {
  font-weight: 500;
  color: var(--text-muted);
  background: var(--card-bg);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}
</style>
