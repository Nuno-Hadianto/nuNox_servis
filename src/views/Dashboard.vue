<template>
  <div class="fade-in dashboard-page">
    <div class="stats-grid">
      <StatCard
        title="Servis Hari Ini"
        :value="stats.todayServices"
        variant="primary"
        clickable
        @click="$router.push('/services')"
      >
        <template #icon><Wrench :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Sedang Dikerjakan"
        :value="stats.inProgress"
        variant="warning"
        clickable
        @click="$router.push('/services?search=Proses')"
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
          <div class="chart-wrapper-main">
            <canvas id="income-chart"></canvas>
          </div>
        </div>
        <div class="chart-grid-2">
          <div class="card chart-container">
            <h2 class="chart-title">Distribusi Status Servis</h2>
            <div class="chart-wrapper-sub">
              <canvas id="status-chart"></canvas>
            </div>
          </div>
          <div class="card chart-container">
            <h2 class="chart-title">Top 5 Sparepart</h2>
            <div class="chart-wrapper-sub">
              <canvas id="top-parts-chart"></canvas>
            </div>
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench, Hourglass, CheckCircle, Wallet, TrendingUp } from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'
import StatCard from '../components/StatCard.vue'
import TodoWidget from '../components/dashboard/TodoWidget.vue'
import AbandonedWidget from '../components/dashboard/AbandonedWidget.vue'
import LowStockWidget from '../components/dashboard/LowStockWidget.vue'
import type { DashboardStats, AbandonedService } from '../../shared/types'
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'

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

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const waTemplate = ref<string>('')

let chartInstance: any = null
let statusChartInstance: any = null
let topPartsChartInstance: any = null

const getTextColor = () => isDark.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
const getGridColor = () => isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'

const formatCurrency = (amount: number | string | undefined | null) => {
  return 'Rp ' + parseInt(String(amount || 0)).toLocaleString('id-ID')
}

const sendWaDashboard = (srv: AbandonedService) => {
  if (!srv.customer_phone) {
    // @ts-ignore
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
  // @ts-ignore
  if (window.api && window.api.openExternalUrl) {
    // @ts-ignore
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
      renderChart(data.chartData)
      if (data.serviceStatusChart) renderStatusChart(data.serviceStatusChart)
      if (data.topPartsChart) renderTopPartsChart(data.topPartsChart)

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

const renderChart = (chartData: { labels: string[]; values: number[] }) => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = document.getElementById('income-chart') as HTMLCanvasElement
  if (!ctx) return

  chartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Pendapatan',
          data: chartData.values,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: {
            color: getTextColor(),
            callback: function (value: number | string) {
              return 'Rp ' + value.toLocaleString('id-ID')
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: getTextColor() }
        }
      }
    }
  })
}

const renderStatusChart = (chartData: { labels: string[]; values: number[] }) => {
  if (statusChartInstance) statusChartInstance.destroy()
  const ctx = document.getElementById('status-chart') as HTMLCanvasElement
  if (!ctx) return

  statusChartInstance = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.values,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom', 
          labels: { 
            color: getTextColor(),
            padding: 15,
            usePointStyle: true,
            font: { size: 10 },
            boxWidth: 8
          } 
        }
      },
      layout: {
        padding: { top: 10, bottom: 30, left: 10, right: 10 }
      },
      cutout: '70%'
    }
  })
}

const renderTopPartsChart = (chartData: { labels: string[]; values: number[] }) => {
  if (topPartsChartInstance) topPartsChartInstance.destroy()
  const ctx = document.getElementById('top-parts-chart') as HTMLCanvasElement
  if (!ctx) return

  topPartsChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Terjual',
          data: chartData.values,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: { color: getTextColor(), precision: 0 }
        },
        y: {
          grid: { display: false },
          ticks: { color: getTextColor() }
        }
      }
    }
  })
}

onMounted(() => {
  loadDashboard()
})

watch(isDark, () => {
  if (chartInstance) {
    chartInstance.options.scales.x.ticks.color = getTextColor()
    chartInstance.options.scales.y.ticks.color = getTextColor()
    chartInstance.options.scales.y.grid.color = getGridColor()
    chartInstance.update()
  }
  
  if (statusChartInstance) {
    statusChartInstance.options.plugins.legend.labels.color = getTextColor()
    statusChartInstance.update()
  }

  if (topPartsChartInstance) {
    topPartsChartInstance.options.scales.x.ticks.color = getTextColor()
    topPartsChartInstance.options.scales.x.grid.color = getGridColor()
    topPartsChartInstance.options.scales.y.ticks.color = getTextColor()
    topPartsChartInstance.update()
  }
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
.chart-wrapper-main {
  position: relative;
  height: 250px;
  width: 100%;
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
.chart-wrapper-sub {
  position: relative;
  height: 260px;
  width: 100%;
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}
</style>
