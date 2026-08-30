<template>
  <div class="card" style="margin-bottom: 20px; padding: 25px">
    <h2
      style="
        font-size: 1.2rem;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
      "
    >
      💰 Rincian Biaya & Sparepart
    </h2>

    <div
      style="
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        background: var(--bg-color);
        padding: 10px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
      "
    >
      <select
        v-model="form.type"
        @change="onItemTypeChange"
        style="
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: white;
        "
      >
        <option value="Jasa">Jasa</option>
        <option value="Sparepart">Sparepart (Gudang)</option>
        <option value="Part Luar">Part Luar (Non-Stok)</option>
        <option value="Biaya lainnya">Lainnya</option>
        <option value="Diskon">Diskon</option>
      </select>

      <select
        v-if="form.type === 'Sparepart'"
        v-model="form.partId"
        @change="onPartChange"
        style="
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: white;
          flex: 1;
        "
      >
        <option value="">-- Pilih Sparepart --</option>
        <option v-for="p in parts" :key="p.id" :value="p.id" :disabled="p.stock <= 0">
          {{ p.name }} (Stok: {{ p.stock }})
        </option>
      </select>

      <input
        v-else
        type="text"
        v-model="form.desc"
        placeholder="Keterangan"
        style="
          flex: 1;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        "
      />

      <input
        type="number"
        v-model.number="form.qty"
        placeholder="Qty"
        min="1"
        style="
          width: 60px;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        "
      />
      <input
        v-if="form.type === 'Part Luar'"
        type="number"
        v-model.number="form.costPrice"
        placeholder="Harga Beli (Modal)"
        style="
          width: 140px;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        "
      />
      <input
        type="number"
        v-model.number="form.price"
        :placeholder="form.type === 'Part Luar' ? 'Harga Jual' : 'Harga'"
        style="
          width: 130px;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        "
      />
      <button
        @click="addItem"
        class="btn btn-primary"
        style="padding: 8px 16px; border-radius: var(--radius-sm)"
      >
        ➕
      </button>
    </div>

    <div
      style="
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
      "
    >
      <ul style="list-style: none; padding: 0; margin: 0">
        <li
          v-for="item in items"
          :key="item.id"
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
          "
        >
          <div>
            <div style="font-weight: 600; color: var(--text-color)">
              {{ item.item_type }}
              <span style="font-weight: normal; color: var(--text-muted)">
                - {{ item.description }}</span
              >
            </div>
            <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px">
              {{ item.quantity }} x {{ formatCurrency(item.price) }}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 15px">
            <span style="font-weight: 700; color: var(--primary-color)">{{
              formatCurrency(item.subtotal)
            }}</span>
            <button
              @click="$emit('delete', item.id)"
              class="btn btn-danger"
              style="
                padding: 4px 8px;
                font-size: 0.75rem;
                border-radius: 4px;
                opacity: 0.8;
                display: inline-flex;
                align-items: center;
                gap: 6px;
              "
            >
              <Trash2 :size="14" /> Hapus
            </button>
          </div>
        </li>
      </ul>
    </div>
    <div
      style="
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        font-weight: 800;
        padding: 15px 20px;
        background: rgba(99, 102, 241, 0.05);
        border-radius: var(--radius-md);
        margin-top: 15px;
        color: var(--primary-color);
      "
    >
      <span>Total Biaya:</span>
      <span>{{ formatCurrency(totalCost) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import type { ServiceItem, Part } from '../../../shared/types'

const props = defineProps<{
  items: ServiceItem[]
  parts: Part[]
  totalCost: number
}>()

const emit = defineEmits(['add', 'delete'])

const form = reactive({
  type: 'Jasa',
  partId: '' as string | number,
  desc: '',
  qty: 1,
  costPrice: 0,
  price: 0
})

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const onItemTypeChange = () => {
  form.desc = ''
  form.partId = ''
  form.costPrice = 0
  form.price = 0
}

const onPartChange = () => {
  const part = props.parts.find((p) => p.id === form.partId)
  if (part) {
    form.price = part.sell_price
  }
}

const addItem = () => {
  emit('add', { ...form })
  
  // reset form after emit
  form.desc = ''
  form.partId = ''
  form.costPrice = 0
  form.price = 0
  form.qty = 1
}
</script>
