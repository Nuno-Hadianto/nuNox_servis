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
      
      <!-- Notifications -->
      <div style="position: relative;" ref="notificationRef">
        <button 
          @click="toggleNotifications" 
          class="btn btn-secondary" 
          style="position: relative; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: var(--text-primary); cursor: pointer;"
        >
          <Bell style="width: 18px; height: 18px;" />
          <span 
            v-if="alerts.length > 0" 
            style="position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 0.7rem; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
          >
            {{ alerts.length }}
          </span>
        </button>
        
        <!-- Dropdown -->
        <div 
          v-if="isNotificationOpen" 
          style="position: absolute; top: 50px; right: 0; width: 320px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 100; overflow: hidden;"
        >
          <div style="padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
            <span>Notifikasi Servis</span>
            <span style="font-size: 0.8rem; background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 12px;">{{ alerts.length }} Baru</span>
          </div>
          <div style="max-height: 350px; overflow-y: auto;">
            <div v-if="alerts.length === 0" style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
              Tidak ada peringatan.
            </div>
            <div 
              v-else
              v-for="alert in alerts" 
              :key="alert.id"
              @click="goToService(alert.ticket_number)"
              style="padding: 12px 15px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;"
              onmouseover="this.style.background='var(--surface-light)'"
              onmouseout="this.style.background='transparent'"
            >
              <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; color: var(--text-primary);">
                {{ alert.ticket_number }} - {{ alert.customer_name }}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
                <span v-if="alert.service_status === 'Menunggu Sparepart'">
                  Menunggu sparepart selama <strong style="color: #ef4444">{{ alert.days_pending }} hari</strong>.
                </span>
                <span v-else>
                  Selesai tapi belum diambil selama <strong style="color: #f59e0b">{{ alert.days_pending }} hari</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="toggleTheme" class="btn btn-secondary" style="padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: var(--text-primary); cursor: pointer;">
        <Moon v-if="!isDark" style="width: 18px; height: 18px;" />
        <Sun v-else style="width: 18px; height: 18px;" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Clock, Sun, Moon, Bell } from 'lucide-vue-next'
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

defineProps<{
  title?: string
}>()


const currentDateTime = ref<string>('')
let timer: ReturnType<typeof setInterval> | null = null

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

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


const router = useRouter()

const alerts = ref<any[]>([])
const isNotificationOpen = ref(false)
const notificationRef = ref<HTMLElement | null>(null)
let alertTimer: ReturnType<typeof setInterval> | null = null

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value
}

const goToService = (ticket: string) => {
  isNotificationOpen.value = false
  router.push(`/service/${ticket}`)
}

const loadAlerts = async () => {
  if (window.api && window.api.getAlerts) {
    try {
      alerts.value = await window.api.getAlerts()
    } catch (e) {
      console.error('Failed to load alerts', e)
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target as Node)) {
    isNotificationOpen.value = false
  }
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  
  loadAlerts()
  alertTimer = setInterval(loadAlerts, 60000) // update every minute
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (alertTimer) clearInterval(alertTimer)
  document.removeEventListener('click', handleClickOutside)
})
</script>
