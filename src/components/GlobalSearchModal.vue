<template>
  <div v-if="isOpen" class="global-search-overlay" @click.self="close">
    <div class="global-search-modal fade-in-up">
      <div class="search-header">
        <Search class="search-icon" :size="20" />
        <input 
          ref="searchInput"
          v-model="query"
          @input="debounceSearch"
          @keydown.down.prevent="moveDown"
          @keydown.up.prevent="moveUp"
          @keydown.enter.prevent="selectCurrent"
          @keydown.esc.prevent="close"
          type="text" 
          placeholder="Cari menu, tiket, pelanggan, atau sparepart..." 
          class="search-input"
        />
        <button class="close-btn" @click="close">
          <span style="font-size: 0.8rem; font-weight: 600;">ESC</span>
        </button>
      </div>

      <div class="search-results">
        <div v-if="isLoading" class="loading-state">Mencari...</div>
        <div v-else-if="query && groupedResults.length === 0" class="empty-state">
          Tidak ada hasil untuk "{{ query }}"
        </div>
        <div v-else>
          <div v-for="(group, gIdx) in groupedResults" :key="group.title" class="result-group">
            <div class="group-title">{{ group.title }}</div>
            <div 
              v-for="(item, iIdx) in group.items" 
              :key="item.id + item.type"
              class="result-item"
              :class="{ 'is-selected': isSelected(gIdx, iIdx) }"
              @mouseover="setSelection(gIdx, iIdx)"
              @click="selectItem(item)"
            >
              <component :is="item.icon" class="item-icon" :size="16" />
              <div class="item-content">
                <div class="item-title">{{ item.title }}</div>
                <div v-if="item.subtitle" class="item-subtitle">{{ item.subtitle }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Wrench, Users, Package, Settings, Monitor, FileText, ShoppingCart } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['update:isOpen'])

const router = useRouter()
const searchInput = ref<HTMLInputElement | null>(null)
const query = ref('')
const isLoading = ref(false)
const selectedGroupIndex = ref(0)
const selectedItemIndex = ref(0)

// Quick navigation links
const staticMenus = [
  { type: 'menu', title: 'Dasbor', route: '/', icon: Monitor, keywords: ['dasbor', 'home', 'beranda', 'awal'] },
  { type: 'menu', title: 'Servis / Tiket', route: '/services', icon: Wrench, keywords: ['servis', 'service', 'tiket', 'perbaikan'] },
  { type: 'menu', title: 'Kasir / POS', route: '/pos', icon: ShoppingCart, keywords: ['kasir', 'pos', 'jual', 'penjualan'] },
  { type: 'menu', title: 'Data Pelanggan', route: '/customers', icon: Users, keywords: ['pelanggan', 'customer', 'klien', 'orang'] },
  { type: 'menu', title: 'Inventaris / Sparepart', route: '/parts', icon: Package, keywords: ['stok', 'inventaris', 'sparepart', 'part', 'barang'] },
  { type: 'menu', title: 'Laporan', route: '/reports', icon: FileText, keywords: ['laporan', 'report', 'keuangan'] },
  { type: 'menu', title: 'Pengaturan', route: '/settings', icon: Settings, keywords: ['pengaturan', 'setting', 'konfigurasi'] }
]

type SearchResultItem = {
  id: string | number
  type: 'menu' | 'service' | 'customer' | 'part'
  title: string
  subtitle?: string
  route: string
  icon: any
}

const rawResults = ref<SearchResultItem[]>([])

const groupedResults = computed(() => {
  const groups: { title: string, items: SearchResultItem[] }[] = []
  
  const menus = rawResults.value.filter(r => r.type === 'menu')
  if (menus.length > 0) groups.push({ title: 'Menu / Halaman', items: menus })
  
  const services = rawResults.value.filter(r => r.type === 'service')
  if (services.length > 0) groups.push({ title: 'Tiket Servis', items: services })
  
  const customers = rawResults.value.filter(r => r.type === 'customer')
  if (customers.length > 0) groups.push({ title: 'Pelanggan', items: customers })
  
  const parts = rawResults.value.filter(r => r.type === 'part')
  if (parts.length > 0) groups.push({ title: 'Sparepart', items: parts })
    
  return groups
})

const close = () => {
  emit('update:isOpen', false)
  query.value = ''
  rawResults.value = []
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    rawResults.value = []
    return
  }

  isLoading.value = true
  const results: SearchResultItem[] = []

  // 1. Search Menus
  staticMenus.forEach(menu => {
    if (menu.title.toLowerCase().includes(q) || menu.keywords.some(k => k.includes(q))) {
      results.push({
        id: menu.route,
        type: 'menu',
        title: menu.title,
        route: menu.route,
        icon: menu.icon
      })
    }
  })

  // 2. Database Searches (if API available)
  if (window.api) {
    try {
      const [servicesRes, customersRes, partsRes] = await Promise.all([
        window.api.getServices ? window.api.getServices(q, 1, 5) : Promise.resolve({ data: [] }),
        window.api.getCustomers ? window.api.getCustomers(q, 1, 5) : Promise.resolve({ data: [] }),
        window.api.getParts ? window.api.getParts(q) : Promise.resolve([])
      ])

      // Mapping Services
      if (servicesRes && servicesRes.data) {
        servicesRes.data.forEach((s: any) => {
          results.push({
            id: s.id,
            type: 'service',
            title: `Tiket #${s.ticket_number}`,
            subtitle: `${s.customer_name} - ${s.device_type} ${s.device_brand} (${s.service_status})`,
            route: `/services/${s.id}`,
            icon: Wrench
          })
        })
      }

      // Mapping Customers
      if (customersRes && customersRes.data) {
        customersRes.data.forEach((c: any) => {
          results.push({
            id: c.id,
            type: 'customer',
            title: c.name,
            subtitle: `${c.phone || '-'} | ${c.address || '-'}`,
            route: `/customers?search=${encodeURIComponent(c.name)}`, // Just filter customers page
            icon: Users
          })
        })
      }

      // Mapping Parts
      if (Array.isArray(partsRes)) {
        partsRes.slice(0, 5).forEach((p: any) => {
          results.push({
            id: p.id,
            type: 'part',
            title: p.name,
            subtitle: `Stok: ${p.stock} | Harga: Rp ${parseInt(p.sell_price).toLocaleString('id-ID')}`,
            route: `/parts?search=${encodeURIComponent(p.name)}`,
            icon: Package
          })
        })
      }

    } catch (err) {
      console.error('Search error:', err)
    }
  }

  rawResults.value = results
  selectedGroupIndex.value = 0
  selectedItemIndex.value = 0
  isLoading.value = false
}

// Keyboard Navigation
const isSelected = (gIdx: number, iIdx: number) => {
  return selectedGroupIndex.value === gIdx && selectedItemIndex.value === iIdx
}

const setSelection = (gIdx: number, iIdx: number) => {
  selectedGroupIndex.value = gIdx
  selectedItemIndex.value = iIdx
}

const moveDown = () => {
  if (groupedResults.value.length === 0) return
  
  const currentGroup = groupedResults.value[selectedGroupIndex.value]
  if (selectedItemIndex.value < currentGroup.items.length - 1) {
    selectedItemIndex.value++
  } else if (selectedGroupIndex.value < groupedResults.value.length - 1) {
    selectedGroupIndex.value++
    selectedItemIndex.value = 0
  }
}

const moveUp = () => {
  if (groupedResults.value.length === 0) return

  if (selectedItemIndex.value > 0) {
    selectedItemIndex.value--
  } else if (selectedGroupIndex.value > 0) {
    selectedGroupIndex.value--
    selectedItemIndex.value = groupedResults.value[selectedGroupIndex.value].items.length - 1
  }
}

const selectCurrent = () => {
  if (groupedResults.value.length === 0) return
  const currentGroup = groupedResults.value[selectedGroupIndex.value]
  if (currentGroup && currentGroup.items[selectedItemIndex.value]) {
    selectItem(currentGroup.items[selectedItemIndex.value])
  }
}

const selectItem = (item: SearchResultItem) => {
  router.push(item.route)
  close()
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    query.value = ''
    rawResults.value = []
    selectedGroupIndex.value = 0
    selectedItemIndex.value = 0
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

// Listen for Ctrl+K / Cmd+K globally
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('update:isOpen', !props.isOpen)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.global-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
}

.global-search-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 600px;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}

.search-icon {
  color: var(--text-muted);
  margin-right: 15px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1.1rem;
  outline: none;
}

.close-btn {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.loading-state, .empty-state {
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
}

.group-title {
  padding: 8px 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.1s;
}

.result-item.is-selected {
  background: rgba(99, 102, 241, 0.1);
  border-left-color: #6366f1;
}

.item-icon {
  color: var(--text-muted);
  margin-right: 15px;
}

.result-item.is-selected .item-icon {
  color: #6366f1;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.item-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Animations */
.fade-in-up {
  animation: fadeInUp 0.2s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
