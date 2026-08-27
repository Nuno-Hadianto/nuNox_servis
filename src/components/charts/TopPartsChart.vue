<template>
  <div class="chart-wrapper-sub">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart } from 'chart.js'
import { useThemeStore } from '../../stores/theme'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  data: { labels: string[]; values: number[] }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const getTextColor = () => isDark.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
const getGridColor = () => isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'

const renderChart = () => {
  if (chartInstance) chartInstance.destroy()
  if (!chartCanvas.value) return
  if (!props.data || !props.data.labels) return

  chartInstance = new window.Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          label: 'Terjual',
          data: props.data.values,
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

watch(() => props.data, () => {
  renderChart()
}, { deep: true })

watch(isDark, () => {
  if (chartInstance) {
    chartInstance.options.scales.x.ticks.color = getTextColor()
    chartInstance.options.scales.x.grid.color = getGridColor()
    chartInstance.options.scales.y.ticks.color = getTextColor()
    chartInstance.update()
  }
})

onMounted(() => {
  renderChart()
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.chart-wrapper-sub {
  position: relative;
  height: 260px;
  width: 100%;
}
</style>
