<template>
  <div class="fade-in dashboard-page">
    <div class="stats-grid">
      <StatCard
        title="Servis Hari Ini"
        :value="stats.todayServices"
        variant="primary"
        clickable
        @click="$router.push('/services?search=Hari Ini')"
      >
        <template #icon><Wrench :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Sedang Dikerjakan"
        :value="stats.inProgress"
        variant="warning"
        clickable
        @click="$router.push('/services?search=Sedang Dikerjakan')"
      >
        <template #icon><Hourglass :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Selesai"
        :value="stats.completed"
        variant="success"
        clickable
        @click="$router.push('/services?search=Selesai')"
      >
        <template #icon><CheckCircle :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Pendapatan Bulan Ini"
        :value="formatCurrency(stats.incomeMonth)"
        variant="info"
      >
        <template #icon><Wallet :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Laba Bersih Bulan Ini"
        :value="formatCurrency(stats.labaBersih)"
        variant="success"
        :valueClass="stats.labaBersih >= 0 ? 'text-success' : 'text-danger'"
      >
        <template #icon><TrendingUp :size="28" :stroke-width="2" /></template>
      </StatCard>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-column">
        <div class="card chart-container">
          <h2>Tren Pendapatan (6 Bulan)</h2>
          <IncomeChart v-if="stats.chartData" :data="stats.chartData" />
        </div>
        <div class="chart-grid-2">
          <div class="card chart-container">
            <h2 class="chart-title">Distribusi Status Servis</h2>
            <StatusChart v-if="stats.serviceStatusChart" :data="stats.serviceStatusChart" />
          </div>
          <div class="card chart-container">
            <h2 class="chart-title">Top 5 Sparepart</h2>
            <TopPartsChart v-if="stats.topPartsChart" :data="stats.topPartsChart" />
          </div>
        </div>
      </div>

      <div class="dashboard-column">
        <TodoWidget :items="stats.todoItems" :isLoading="isLoading" />
        <AbandonedWidget
          :items="stats.abandonedServices"
          :isLoading="isLoading"
          @send-wa="sendWaDashboard"
        />
        <LowStockWidget :items="stats.lowStockParts" :isLoading="isLoading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { Wrench, Hourglass, CheckCircle, Wallet, TrendingUp } from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import TodoWidget from '../components/dashboard/TodoWidget.vue'
import AbandonedWidget from '../components/dashboard/AbandonedWidget.vue'
import LowStockWidget from '../components/dashboard/LowStockWidget.vue'
import IncomeChart from '../components/charts/IncomeChart.vue'
import StatusChart from '../components/charts/StatusChart.vue'
import TopPartsChart from '../components/charts/TopPartsChart.vue'
import type { DashboardStats, AbandonedService } from '../../shared/types'

const isLoading = ref(true)

const stats = ref<DashboardStats>({
  todayServices: 0,
  inProgress: 0,
  completed: 0,
  incomeMonth: 0,
  labaBersih: 0,
  chartData: { labels: [], values: [] },
  serviceStatusChart: { labels: [], values: [] },
  topPartsChart: { labels: [], values: [] },
  lowStockParts: [],
  abandonedServices: [],
  todoItems: []
})

const waTemplate = ref<string>('')

const formatCurrency = (amount: number | string | undefined | null) => {
  return 'Rp ' + parseInt(String(amount || 0)).toLocaleString('id-ID')
}

const sendWaDashboard = (srv: AbandonedService) => {
  if (!srv.customer_phone) {
    if (window.Swal) window.Swal.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
    return
  }

  const targetPhone = srv.customer_phone.replace(/^0/, '62')

  let text = `Halo Kak ${srv.customer_name},
Mengingatkan bahwa perangkat Anda dengan No Tiket *${srv.ticket_number}* saat ini berstatus: *${srv.service_status}*.
Mohon konfirmasinya. Terima kasih.`

  if (waTemplate.value) {
    text = waTemplate.value
      .replace(/{nama}/g, srv.customer_name)
      .replace(/{tiket}/g, srv.ticket_number)
      .replace(/{status}/g, srv.service_status)
  }

  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
  if (window.api && window.api.openExternalUrl) {
    window.api.openExternalUrl(url)
  } else {
    window.open(url, '_blank')
  }
}

const loadDashboard = async () => {
  isLoading.value = true
  if (window.api && window.api.getDashboardStats) {
    try {
      const data = await window.api.getDashboardStats()
      stats.value = data

      const settings = await window.api.getSettings()
      if (settings && settings.wa_template_status) {
        waTemplate.value = settings.wa_template_status
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      isLoading.value = false
    }
  } else {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.dashboard-page {
  padding-bottom: 20px;
}
.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.chart-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}
.chart-title {
  font-size: 1.1rem;
  text-align: center;
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}
</style>
