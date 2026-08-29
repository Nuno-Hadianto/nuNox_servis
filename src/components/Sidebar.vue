<template>
  <aside class="sidebar">
    <div class="sidebar-header sidebar-header-custom">
      <img src="/img/logo.png" alt="nuNox_servis" class="sidebar-logo" />
      <div class="sidebar-brand">nuNox_<span class="brand-accent">servis</span></div>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li v-if="currentUser?.role !== 'teknisi'" :class="{ active: $route.name === 'Dashboard' }">
          <router-link to="/"> <LayoutDashboard class="menu-icon" /> Dashboard </router-link>
        </li>
        <li class="nav-header">OPERASIONAL</li>

        <li :class="{ active: $route.name === 'Customers' }">
          <router-link to="/customers"><Users class="menu-icon" /> Pelanggan</router-link>
        </li>
        <li :class="{ active: $route.name === 'Devices' }">
          <router-link to="/devices"><Smartphone class="menu-icon" /> Perangkat</router-link>
        </li>
        <li :class="{ active: $route.name === 'Services' || $route.name === 'ServiceDetail' }">
          <router-link to="/services"><Wrench class="menu-icon" /> Servis</router-link>
        </li>
        <li :class="{ active: $route.name === 'Parts' }">
          <router-link to="/parts"><Package class="menu-icon" /> Sparepart</router-link>
        </li>

        <li v-if="currentUser?.role === 'admin'" class="nav-header">KEUANGAN</li>
        <li v-if="currentUser?.role === 'admin'" :class="{ active: $route.name === 'Reports' }">
          <router-link to="/reports"><BarChart3 class="menu-icon" /> Laporan</router-link>
        </li>

        <li v-if="currentUser?.role === 'admin'" class="nav-header">SISTEM</li>
        <li v-if="currentUser?.role === 'admin'" :class="{ active: $route.name === 'Users' }">
          <router-link to="/users"><UserCog class="menu-icon" /> Karyawan</router-link>
        </li>
        <li v-if="currentUser?.role === 'admin'" :class="{ active: $route.name === 'Settings' }">
          <router-link to="/settings"
            ><Settings class="menu-icon" /> Pengaturan & Backup</router-link
          >
        </li>
      </ul>
      <div class="sidebar-footer">
        <div class="user-info-row" style="justify-content: center;">
          <div>
            Login sebagai:
            <strong class="user-name">{{ currentUser ? currentUser.username : '-' }}</strong>
          </div>
        </div>
        <button @click="handleLogout" class="btn btn-danger logout-btn">
          <LogOut style="width: 18px; height: 18px;" /> Logout
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Users,
  Smartphone,
  Wrench,
  Package,
  BarChart3,
  UserCog,
  Settings,
  LogOut
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)



const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  stroke-width: 2.2px;
  opacity: 0.8;
  transition: all 0.3s ease;
}
.sidebar-nav li.active .menu-icon {
  opacity: 1;
  stroke: white;
}
.sidebar-nav a:hover .menu-icon {
  opacity: 1;
  stroke: var(--primary);
}
.sidebar-header-custom {
  justify-content: center;
  flex-direction: column;
  padding: 20px 10px 10px;
  gap: 5px;
}
.sidebar-logo {
  max-height: 80px;
  width: auto;
  object-fit: contain;
}
.sidebar-brand {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}
.brand-accent {
  color: var(--primary);
}
.sidebar-footer {
  margin-top: auto;
  padding: 20px;
}
.user-info-row {
  margin-bottom: 15px;
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-name {
  color: var(--text-primary);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
