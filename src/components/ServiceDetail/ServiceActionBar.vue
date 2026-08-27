<template>
  <div
    class="action-bar"
    style="
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 25px;
    "
  >
    <button
      @click="$emit('back')"
      class="btn btn-secondary"
      style="display: flex; align-items: center; gap: 6px; border-radius: 20px; padding: 8px 16px"
    >
      <span>&larr;</span> Kembali
    </button>
    <div style="display: flex; gap: 10px; flex-wrap: wrap">
      <button
        @click="$emit('send-wa')"
        class="btn"
        style="
          background-color: #25d366;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 20px;
        "
      >
        💬 Kirim WA
      </button>
      <button
        @click="$emit('export-pdf')"
        class="btn"
        style="
          background-color: #ef4444;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 20px;
        "
      >
        📄 Unduh PDF
      </button>
      <button
        @click="$emit('print-thermal')"
        class="btn"
        style="
          background-color: #f59e0b;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 20px;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
        "
      >
        🖨️ Cetak Struk (Termal)
      </button>
      <button
        @click="$emit('print-nota')"
        class="btn btn-secondary"
        style="display: flex; align-items: center; gap: 6px; border-radius: 20px"
      >
        Cetak Tanda Terima
      </button>
      <button
        @click="$emit('print-receipt')"
        class="btn btn-primary"
        style="display: flex; align-items: center; gap: 6px; border-radius: 20px"
      >
        Cetak Invoice
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits([
  'back',
  'send-wa',
  'export-pdf',
  'print-thermal',
  'print-nota',
  'print-receipt'
])
</script>
