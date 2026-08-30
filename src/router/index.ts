import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Customer from '../views/Customer.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard', roles: ['admin', 'kasir'] }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customer,
    meta: { title: 'Daftar Pelanggan', roles: ['admin', 'kasir', 'teknisi'] }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: () => import('../views/Device.vue'),
    meta: { title: 'Daftar Perangkat', roles: ['admin', 'kasir', 'teknisi'] }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/Service.vue'),
    meta: { title: 'Daftar Servis', roles: ['admin', 'kasir', 'teknisi'] }
  },
  {
    path: '/services/:id',
    name: 'ServiceDetail',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { title: 'Detail Servis', roles: ['admin', 'kasir', 'teknisi'] }
  },
  {
    path: '/parts',
    name: 'Parts',
    component: () => import('../views/Part.vue'),
    meta: { title: 'Katalog Harga Servis', roles: ['admin', 'kasir', 'teknisi'] }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Report.vue'),
    meta: { title: 'Laporan Keuangan', roles: ['admin'] }
  },

  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/User.vue'),
    meta: { title: 'Manajemen Karyawan', roles: ['admin'] }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: 'Pengaturan & Backup', roles: ['admin'] }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    return next() // Biarkan App.vue yang menghandle layar login (v-if="!isLoggedIn")
  }

  const userRole = authStore.currentUser?.role || 'admin'
  const requiredRoles = to.meta.roles as string[] | undefined

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    // Redirect ke halaman yang diizinkan berdasarkan role
    if (userRole === 'teknisi') {
      return next({ name: 'Services' })
    }
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
