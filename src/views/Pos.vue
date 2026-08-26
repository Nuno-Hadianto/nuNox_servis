<template>
  <div class="view-section">
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px">
      <!-- Left: Product Selection -->
      <div class="card" style="padding: 25px">
        <h2
          style="
            margin-bottom: 20px;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <Package :size="20" /> Pilih Barang
        </h2>

        <div class="search-bar" style="position: relative; margin-bottom: 20px">
          <Search class="search-icon" :size="18" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);" />
          <input
            ref="searchInput"
            type="text"
            v-model="searchQuery"
            placeholder="Cari nama atau kode sparepart... [F2]"
            @input="handleSearch"
            class="form-control"
            style="border-radius: 20px; padding: 10px 15px 10px 40px; width: 100%"
          />
        </div>

        <div style="max-height: 500px; overflow-y: auto; padding-right: 10px">
          <div
            v-if="parts.length === 0"
            style="text-align: center; color: var(--text-muted); padding: 20px"
          >
            Tidak ada barang ditemukan.
          </div>
          <div
            v-for="part in parts"
            :key="part.id"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px;
              border: 1px solid var(--border-color);
              border-radius: var(--radius-md);
              margin-bottom: 15px;
              background: var(--bg-color);
            "
          >
            <div>
              <div style="font-weight: 600">{{ part.name }}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted)">
                {{ part.part_code }} | Stok:
                <span
                  :style="{ color: part.stock <= 3 ? '#ef4444' : 'inherit', fontWeight: 'bold' }"
                  >{{ part.stock }} {{ part.unit }}</span
                >
              </div>
              <div style="color: var(--primary-color); font-weight: 700; margin-top: 5px">
                {{ formatCurrency(part.sell_price) }}
              </div>
            </div>
            <button
              @click="addToCart(part)"
              class="btn btn-primary"
              :disabled="part.stock <= 0"
              style="border-radius: 20px; padding: 8px 16px"
            >
              {{ part.stock <= 0 ? 'Habis' : 'Tambah' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Cart & Payment -->
      <div class="card" style="padding: 25px; display: flex; flex-direction: column">
        <h2
          style="
            margin-bottom: 20px;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <ShoppingCart :size="20" /> Keranjang Belanja
        </h2>

        <div class="form-group">
          <input
            type="text"
            v-model="customerName"
            placeholder="Nama Pelanggan (Opsional)"
            class="form-control"
            style="border-radius: var(--radius-md)"
          />
        </div>

        <div
          style="
            flex: 1;
            overflow-y: auto;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            padding: 15px 0;
            margin-bottom: 20px;
          "
        >
          <div
            v-if="cart.length === 0"
            style="text-align: center; color: var(--text-muted); padding: 20px"
          >
            Keranjang masih kosong.
          </div>
          <div
            v-for="(item, index) in cart"
            :key="index"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            "
          >
            <div style="flex: 1">
              <div
                style="font-weight: 500; font-size: 0.95rem; line-height: 1.2; margin-bottom: 4px"
              >
                {{ item.name }}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted)">
                {{ formatCurrency(item.price) }}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  background: var(--bg-color);
                  border-radius: 20px;
                  border: 1px solid var(--border-color);
                  overflow: hidden;
                "
              >
                <button
                  @click="decreaseQty(index)"
                  style="
                    border: none;
                    background: transparent;
                    padding: 4px 8px;
                    cursor: pointer;
                    color: var(--text-primary);
                  "
                >
                  -
                </button>
                <span style="font-size: 0.9rem; min-width: 20px; text-align: center">{{
                  item.qty
                }}</span>
                <button
                  @click="increaseQty(index)"
                  style="
                    border: none;
                    background: transparent;
                    padding: 4px 8px;
                    cursor: pointer;
                    color: var(--text-primary);
                  "
                >
                  +
                </button>
              </div>
              <div style="font-weight: 600; width: 80px; text-align: right">
                {{ formatCurrency(item.price * item.qty) }}
              </div>
              <button
                @click="removeFromCart(index)"
                style="
                  background: none;
                  border: none;
                  color: #ef4444;
                  cursor: pointer;
                  padding: 4px;
                "
              >
                <X :size="16" />
              </button>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px">
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 1.1rem;
              margin-bottom: 10px;
            "
          >
            <span style="color: var(--text-muted)">Total Belanja:</span>
            <strong style="color: var(--text-primary); font-size: 1.3rem">{{
              formatCurrency(totalAmount)
            }}</strong>
          </div>
          <div class="form-group" style="margin-bottom: 10px">
            <label style="font-size: 0.85rem">Metode Pembayaran</label>
            <select
              v-model="paymentMethod"
              class="form-control"
              style="border-radius: var(--radius-sm)"
            >
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>
          <div class="form-group" v-if="paymentMethod === 'Tunai'">
            <label style="font-size: 0.85rem">Nominal Dibayar</label>
            <input
              ref="cashInput"
              type="number"
              v-model="cashGiven"
              placeholder="[F4]"
              class="form-control"
              style="border-radius: var(--radius-sm); font-size: 1.1rem; font-weight: bold"
            />
          </div>
          <div
            v-if="paymentMethod === 'Tunai' && Number(cashGiven) > 0"
            style="
              display: flex;
              justify-content: space-between;
              font-size: 1rem;
              margin-top: 10px;
              color: var(--text-muted);
            "
          >
            <span>Kembalian:</span>
            <strong :style="{ color: changeAmount >= 0 ? '#10b981' : '#ef4444' }">{{
              formatCurrency(changeAmount)
            }}</strong>
          </div>
        </div>

        <button
          @click="processSale"
          class="btn btn-primary"
          :disabled="cart.length === 0 || (paymentMethod === 'Tunai' && changeAmount < 0)"
          style="
            width: 100%;
            padding: 12px;
            border-radius: 20px;
            font-size: 1.1rem;
            font-weight: 600;
            display: flex;
            justify-content: center;
            gap: 8px;
          "
        >
          <CheckCircle :size="20" /> Proses Transaksi [F8]
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Package, Search, ShoppingCart, X, CheckCircle } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { usePosStore } from '../stores/pos'
import type { Part } from '../../shared/types'
import { generateSaleReceiptHtml, printHtml } from '../utils/printUtils'

const posStore = usePosStore()
const { cart, customerName, paymentMethod, cashGiven, totalAmount, changeAmount } =
  storeToRefs(posStore)
const { addToCart, increaseQty, decreaseQty, removeFromCart } = posStore

const parts = ref<Part[]>([])
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const cashInput = ref<HTMLInputElement | null>(null)

const formatCurrency = (val: number | string | undefined | null) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(val || 0))

const loadParts = async () => {
  if (window.api && window.api.getParts) {
    parts.value = (await window.api.getParts(searchQuery.value)) as Part[]
  }
}

let timeoutId: any = null
const handleSearch = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    loadParts()
  }, 300)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault()
    searchInput.value?.focus()
  } else if (e.key === 'F4') {
    e.preventDefault()
    if (paymentMethod.value === 'Tunai') {
      cashInput.value?.focus()
    }
  } else if (e.key === 'F8') {
    e.preventDefault()
    // processSale already has its own validation checks
    processSale()
  }
}

onMounted(() => {
  loadParts()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// State and cart logic extracted to posStore

const processSale = async () => {
  if (cart.value.length === 0) return
  if (paymentMethod.value === 'Tunai' && changeAmount.value < 0) {
    return window.Swal.fire('Info', 'Nominal bayar kurang dari total!', 'info')
  }

  const saleData = {
    customer_name: customerName.value,
    total_amount: totalAmount.value,
    payment_method: paymentMethod.value
  }

  const items = cart.value.map((item) => ({
    spare_part_id: item.id,
    quantity: item.qty,
    price: item.price,
    total: item.price * item.qty
  }))

  try {
    const res = await window.api.createSale(saleData, items)
    if (res.success) {
      window.Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil',
        text: 'Apakah Anda ingin mencetak struk?',
        showCancelButton: true,
        confirmButtonText: 'Ya, Cetak Struk',
        cancelButtonText: 'Tidak'
      }).then(async (result: any) => {
        if (result.isConfirmed) {
          try {
            const saleId = res.saleId!
            const saleData = await window.api.getSale(saleId)
            const saleItems = await window.api.getSaleItems(saleId)
            const settings = await window.api.getSettings()
            const logo = await window.api.getLogoBase64()

            const html = generateSaleReceiptHtml(
              settings,
              saleData,
              saleItems,
              logo,
              Number(cashGiven.value),
              changeAmount.value
            )
            await printHtml(html, false, true) // true = thermal printing
          } catch (err) {
            console.error('Print Error:', err)
            window.Swal.fire('Error', 'Gagal mencetak struk', 'error')
          }
        }
        // Reset
        posStore.resetCart()
        searchQuery.value = ''
        await loadParts()
      })
    } else {
      window.Swal.fire('Error', res.error, 'error')
    }
  } catch (error: any) {
    window.Swal.fire('Error', error.message, 'error')
  }
}
</script>

<style scoped>
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
