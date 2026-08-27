<template>
  <div v-if="!isLoggedIn" class="login-screen fade-in">
    <div class="login-card">
      <div class="login-header">
        <img src="/img/logo.png" alt="nuNox_servis Logo" class="login-logo" />
        <h2 class="login-title">nuNox_<span class="brand-accent">servis</span></h2>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group text-left">
          <label>Username</label>
          <input
            type="text"
            class="form-control"
            v-model="loginForm.username"
            required
            autocomplete="off"
            placeholder="Masukkan username"
          />
        </div>
        <div class="form-group text-left">
          <label>Password</label>
          <input
            type="password"
            class="form-control"
            v-model="loginForm.password"
            required
            autocomplete="off"
            placeholder="Masukkan password"
          />
        </div>
        <button type="submit" class="btn btn-primary w-100 mt-2">Masuk</button>
      </form>
      <p class="login-hint">Default admin: admin / admin123</p>
    </div>
  </div>

  <div v-else class="app-container show">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
      <Topbar :title="pageTitle" />

      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </div>
    </main>

    <GlobalSearchModal v-model:isOpen="isGlobalSearchOpen" />
  </div>

  <div id="print-area"></div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { Toast } from './utils/toast'
import type { Settings } from '../shared/types'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import GlobalSearchModal from './components/GlobalSearchModal.vue'

const isGlobalSearchOpen = ref(false)
const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
const themeStore = useThemeStore()

let barcodeBuffer = ''
let barcodeTimeout: ReturnType<typeof setTimeout> | null = null

const handleGlobalKeydown = async (e: KeyboardEvent) => {
  // Abaikan jika mengetik di input, textarea, select
  const target = e.target as HTMLElement
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
    return
  }

  if (e.key === 'Escape') {
    const closeBtn = document.querySelector('.modal.show .close-modal') as HTMLElement
    if (closeBtn) closeBtn.click()
  }

  if (e.key === 'Enter') {
    if (barcodeBuffer.startsWith('NSV-')) {
      // Valid barcode format
      try {
        if (window.api && window.api.getServiceByTicket) {
          const svc = await window.api.getServiceByTicket(barcodeBuffer)
          if (svc && svc.id) {
            Toast.fire({ icon: 'success', title: 'Tiket ditemukan!' })
            router.push('/services/' + svc.id)
          } else {
            Toast.fire({ icon: 'error', title: 'Tiket tidak ditemukan' })
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    barcodeBuffer = ''
    return
  }

  // Hanya tangkap karakter alphanumeric dan dash
  if (/^[-a-zA-Z0-9]$/.test(e.key)) {
    barcodeBuffer += e.key

    if (barcodeTimeout) clearTimeout(barcodeTimeout)
    barcodeTimeout = setTimeout(() => {
      barcodeBuffer = ''
    }, 50) // Scanner ngetik sangat cepat (< 50ms)
  }
}

const loginForm = reactive({
  username: '',
  password: ''
})

const pageTitle = computed<string>(() => {
  return (route.meta.title as string) || 'nuNox_servis'
})

onMounted(() => {
  if (window.api && window.api.appReady) {
    window.api.appReady()
  }
  window.addEventListener('keydown', handleGlobalKeydown)

  themeStore.initTheme()
  loadGlobalSettings()
})

const loadGlobalSettings = async () => {
  if (window.api && window.api.getSettings) {
    try {
      const settings = await window.api.getSettings() as Settings
      if (settings && settings.primary_color) {
        document.documentElement.style.setProperty('--primary', settings.primary_color)
      }
    } catch (e) {
      console.error('Failed to load global settings', e)
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

const handleLogin = async () => {
  try {
    const res = await window.api.login(loginForm.username, loginForm.password)
    if (res.success && res.user) {
      authStore.login(res.user)

      // Auto-login SweetAlert
      Toast.fire({
        icon: 'success',
        title: `Selamat datang, ${res.user.username}!`
      })
      router.push('/')
    } else {
      window.Swal.fire('Error', res.error || 'Login gagal', 'error')
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Login gagal', 'error')
  }
}


</script>

<style>
/* Global styles handled by style.css */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(15px);
}

/* Login specific styles */
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 25px;
}
.login-logo {
  width: 100%;
  max-width: 280px;
  height: auto;
  object-fit: contain;
}
.login-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.login-hint {
  margin-top: 25px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.text-left {
  text-align: left;
}
.w-100 {
  width: 100%;
}
.mt-2 {
  margin-top: 10px;
}
</style>
