<template>
  <div class="service-info">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
      "
    >
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 5px; color: var(--primary-color)">
          {{ service.ticket_number }}
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem">Masuk: {{ formattedDate }}</p>
      </div>
      <span
        :style="statusStyle(service.service_status)"
        style="
          font-size: 0.9rem;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        "
      >
        {{ service.service_status.toUpperCase() }}
      </span>
    </div>

    <div
      style="
        background: rgba(248, 250, 252, 0.5);
        padding: 15px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        margin-bottom: 20px;
      "
    >
      <h3
        style="
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        "
      >
        Info Pelanggan & Perangkat
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px">
        <div>
          <p style="margin-bottom: 5px"><strong>Nama:</strong> {{ service.customer_name }}</p>
          <p><strong>No. HP:</strong> {{ service.customer_phone || '-' }}</p>
        </div>
        <div>
          <p style="margin-bottom: 5px">
            <strong>Tipe:</strong> {{ service.brand || '' }} {{ service.model || '' }} -
            {{ service.device_type }}
          </p>
          <p><strong>SN:</strong> {{ service.serial_number || '-' }}</p>
        </div>
      </div>
      <div
        style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color)"
      >
        <p>
          <strong>Keluhan:</strong>
          <span style="color: #ef4444; font-weight: 500">{{ service.customer_complaint }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceOrder } from '../../../shared/types'

const props = defineProps<{
  service: ServiceOrder
}>()

const formattedDate = computed(() => {
  if (!props.service) return ''
  return new Date(props.service.received_date + 'Z').toLocaleDateString('id-ID')
})

const statusStyle = (status: string) => {
  let bg = '#e2e8f0'
  let color = '#334155'
  if (status === 'Selesai (Sudah Diambil)') {
    bg = '#10b981'
    color = 'white'
  } else if (status === 'Proses Perbaikan') {
    bg = '#3b82f6'
    color = 'white'
  } else if (status === 'Menunggu Sparepart') {
    bg = '#f59e0b'
    color = 'white'
  } else if (status === 'Batal') {
    bg = '#ef4444'
    color = 'white'
  }

  return {
    padding: '5px 10px',
    borderRadius: '4px',
    background: bg,
    color: color,
    fontWeight: 'bold'
  }
}
</script>
