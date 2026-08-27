<template>
  <div class="chart-wrapper-sub">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
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

const renderChart = () => {
  if (chartInstance) chartInstance.destroy()
  if (!chartCanvas.value) return
  if (!props.data || !props.data.labels) return

  chartInstance = new window.Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          data: props.data.values,
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

watch(() => props.data, () => {
  renderChart()
}, { deep: true })

watch(isDark, () => {
  if (chartInstance) {
    chartInstance.options.plugins.legend.labels.color = getTextColor()
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
