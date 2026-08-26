<template>
  <header class="topbar">
    <div class="topbar-title" style="display: flex; align-items: center; gap: 20px">
      <h1>{{ title }}</h1>
    </div>
    <div class="topbar-actions" style="display: flex; align-items: center; gap: 15px">
      <div
        class="badge"
        style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.9rem;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <Clock style="width: 16px; height: 16px;" /> {{ currentDateTime }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Clock, Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'

defineProps<{
  title?: string
}>()

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const currentDateTime = ref<string>('')
let timer: ReturnType<typeof setInterval> | null = null

const updateDateTime = () => {
  const now = new Date()
  currentDateTime.value =
    now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) +
    ' ' +
    now.toLocaleTimeString('id-ID')
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
