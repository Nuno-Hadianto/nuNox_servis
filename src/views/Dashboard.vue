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
        <!-- To-Do Teknisi -->
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
                <tr v-if="!stats.todoItems || stats.todoItems.length === 0">
                  <td colspan="3" class="text-center empty-state">Tidak ada tugas mendesak hari ini.</td>
                </tr>
                <tr
                  v-for="todo in stats.todoItems"
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
              </tbody>
            </table>
          </div>
        </div>

        <!-- Peringatan Barang Terlantar -->
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
                <tr v-if="!stats.abandonedServices || stats.abandonedServices.length === 0">
                  <td colspan="4" class="text-center empty-state">
                    Tidak ada barang tertunda/terlantar.
                  </td>
                </tr>
                <tr
                  v-for="srv in stats.abandonedServices"
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
                    <button @click.stop="sendWaDashboard(srv)" class="btn btn-sm btn-wa">
                      💬 WA
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Peringatan Stok -->
        <div class="card warning-card">
          <h2 class="warning-title text-warning">
            <AlertTriangle :size="24" /> Peringatan Stok Sparepart Menipis
          </h2>
          <div class="table-container table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="stats.lowStockParts.length === 0">
                  <td colspan="4" class="text-center empty-state">Semua stok sparepart aman.</td>
                </tr>
                <tr v-for="part in stats.lowStockParts" :key="part.id">
                  <td>{{ part.part_code || '-' }}</td>
                  <td>
                    <strong>{{ part.name }}</strong>
                  </td>
                  <td>
                    <span class="badge badge-danger">
                      {{ part.stock }}
                    </span>
                  </td>
                  <td>
                    <button
                      @click="$router.push('/parts?search=' + (part.part_code || part.name))"
                      class="btn btn-sm btn-primary btn-action"
                    >
                      + Isi Stok
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Wrench,
  Hourglass,
  CheckCircle,
  Wallet,
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  ClipboardList
} from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'
import StatCard from '../components/StatCard.vue'
import type { DashboardStats, AbandonedService } from '../../shared/types'

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

let chartInstance: any = null
let statusChartInstance: any = null
let topPartsChartInstance: any = null

const formatCurrency = (amount: number | string | undefined | null) => {
  return 'Rp ' + parseInt(String(amount || 0)).toLocaleString('id-ID')
}

const sendWaDashboard = (srv: AbandonedService) => {
  if (!srv.customer_phone) {
    // @ts-ignore
    if (window.Swal) window.Swal.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
    return
  }

  let targetPhone = srv.customer_phone.replace(/^0/, '62')
  
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
    }
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
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: function (value: number | string) {
              return 'Rp ' + value.toLocaleString('id-ID')
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255, 255, 255, 0.7)' }
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
        legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.8)' } }
      }
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
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: 'rgba(255, 255, 255, 0.7)', precision: 0 }
        },
        y: {
          grid: { display: false },
          ticks: { color: 'rgba(255, 255, 255, 0.8)' }
        }
      }
    }
  })
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
  height: 220px;
  width: 100%;
}
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
.btn-action {
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}
.text-warning {
  color: var(--warning);
}
.text-center {
  text-align: center;
}
</style>
