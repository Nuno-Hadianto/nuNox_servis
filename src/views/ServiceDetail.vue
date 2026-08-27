<template>
  <div class="view-section" v-if="service">
    <ServiceActionBar
      @back="$router.push('/services')"
      @send-wa="sendWhatsApp"
      @export-pdf="exportPdfInvoice"
      @print-thermal="printThermal"
      @print-nota="printNota"
      @print-receipt="printReceipt"
    />

    <div class="dashboard-grid">
      <div class="card" style="padding: 25px">
        <ServiceInfo :service="service" />
        <ServiceStatusUpdate :service="service" @save="saveUpdate" />
        <ServiceHistory :history="history" />
        <ServicePhotos
          :photos="photos"
          @upload="handlePhotoUpload"
          @delete="deletePhoto"
        />
      </div>

      <div>
        <ServiceItems
          :items="items"
          :parts="parts"
          :total-cost="service.total_cost"
          @add="addItem"
          @delete="deleteItem"
        />
        <ServicePayments
          :payments="payments"
          :payment-status="service.payment_status"
          :total-paid="totalPaid"
          :remaining-bill="remainingBill"
          @add="addPayment"
          @delete="deletePayment"
        />
      </div>
    </div>
  </div>

  <ServiceWaModal
    :is-open="isWaModalOpen"
    :initial-message="waMessage"
    @close="isWaModalOpen = false"
    @send="confirmSendWa"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import type {
  ServiceOrder,
  ServiceHistory as ServiceHistoryType,
  ServiceItem as ServiceItemType,
  Payment,
  Part,
  Settings,
  Photo
} from '../../shared/types'
import { ServiceItemSchema, PaymentSchema } from '../utils/validators'
import {
  generateInvoiceHtml,
  generateNotaHtml,
  generateThermalNotaHtml,
  printHtml,
  exportHtmlToPdf
} from '../utils/printUtils.js'

import ServiceActionBar from '../components/ServiceDetail/ServiceActionBar.vue'
import ServiceInfo from '../components/ServiceDetail/ServiceInfo.vue'
import ServiceStatusUpdate from '../components/ServiceDetail/ServiceStatusUpdate.vue'
import ServiceHistory from '../components/ServiceDetail/ServiceHistory.vue'
import ServicePhotos from '../components/ServiceDetail/ServicePhotos.vue'
import ServiceItems from '../components/ServiceDetail/ServiceItems.vue'
import ServicePayments from '../components/ServiceDetail/ServicePayments.vue'
import ServiceWaModal from '../components/ServiceDetail/ServiceWaModal.vue'

const route = useRoute()
const service = ref<ServiceOrder | null>(null)

const history = ref<ServiceHistoryType[]>([])
const items = ref<ServiceItemType[]>([])
const payments = ref<Payment[]>([])
const parts = ref<Part[]>([])
const photos = ref<Photo[]>([])

const isWaModalOpen = ref<boolean>(false)
const waMessage = ref<string>('')

const totalPaid = computed(() => {
  return payments.value.reduce((acc, p) => acc + p.amount, 0)
})

const remainingBill = computed(() => {
  if (!service.value) return 0
  const rem = service.value.total_cost - totalPaid.value
  return rem > 0 ? rem : 0
})

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const loadServiceDetail = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getService) {
    try {
      const detail = (await window.api.getService(Number(id))) as ServiceOrder
      if (detail) {
        service.value = detail
      }
    } catch (error) {
      console.error(error)
    }
  }
}

const loadHistory = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getServiceHistory) {
    history.value = (await window.api.getServiceHistory(Number(id))) as ServiceHistoryType[]
  }
}

const loadItems = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getServiceItems) {
    items.value = (await window.api.getServiceItems(Number(id))) as ServiceItemType[]
  }
}

const loadPayments = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getPayments) {
    payments.value = (await window.api.getPayments(Number(id))) as Payment[]
  }
}

const loadParts = async () => {
  if (window.api && window.api.getParts) {
    parts.value = (await window.api.getParts('')) as Part[]
  }
}

const loadPhotos = async () => {
  const id = route.params.id as string
  if (window.api && window.api.getPhotos) {
    try {
      const res = await window.api.getPhotos(Number(id))
      photos.value = res as Photo[]
    } catch (e) {
      console.error(e)
    }
  }
}

const waTemplate = ref<string>('')
const loadSettings = async () => {
  if (window.api && window.api.getSettings) {
    try {
      const settings = await window.api.getSettings()
      if (settings && settings.wa_template_status) {
        waTemplate.value = settings.wa_template_status
      }
    } catch (e) {
      console.error(e)
    }
  }
}

const handlePhotoUpload = async (e: Event, type: string) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]

  // Convert to ArrayBuffer
  const buffer = await file.arrayBuffer()

  try {
    const result = await window.api.uploadPhoto(service.value!.id as number, type, buffer, file.name)
    if (result.success) {
      await loadPhotos()
    } else {
      window.Swal.fire('Error', 'Gagal mengunggah foto.', 'error')
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Terjadi kesalahan.', 'error')
  }
  target.value = '' // reset input
}

const deletePhoto = async (id: number) => {
  const result = await window.Swal.fire({
    title: 'Hapus foto ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    await window.api.deletePhoto(id)
    await loadPhotos()
  }
}

const saveUpdate = async (updateForm: { diagnosis_result: string; actions_taken: string; technician_notes: string; status: string }) => {
  if (!service.value) return
  try {
    const data = {
      diagnosis_result: updateForm.diagnosis_result,
      actions_taken: updateForm.actions_taken,
      technician_notes: updateForm.technician_notes
    }
    await window.api.updateServiceDetails(service.value.id as number, data)

    if (updateForm.status !== service.value.service_status) {
      let warrantyDays = 0
      if (updateForm.status.includes('Selesai')) {
        const { value: days } = await window.Swal.fire({
          title: 'Atur Garansi',
          text: 'Berapa hari garansi untuk servis ini? (Isi 0 jika tidak ada)',
          input: 'number',
          inputValue: 0,
          showCancelButton: true,
          confirmButtonText: 'Simpan',
          cancelButtonText: 'Batal'
        })
        if (days) {
          warrantyDays = parseInt(days)
        }
      }
      await window.api.updateServiceStatus(
        service.value.id as number,
        updateForm.status,
        updateForm.actions_taken || 'Status diupdate',
        warrantyDays
      )
    }

    window.Swal.fire({
      icon: 'success',
      title: 'Tersimpan',
      text: 'Detail servis berhasil diperbarui',
      timer: 1500,
      showConfirmButton: false
    })
    await loadServiceDetail()
    await loadHistory()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal menyimpan.', 'error')
  }
}

const addItem = async (itemForm: { desc: string; type: string; partId?: string | number; qty: number; price: number }) => {
  if (!service.value) return
  let desc = itemForm.desc
  let partId = null

  if (itemForm.type === 'Sparepart') {
    partId = itemForm.partId
    if (!partId) return window.Swal.fire('Info', 'Pilih sparepart!', 'info')
    desc = 'Sparepart ID: ' + partId
  } else {
    if (!desc) return window.Swal.fire('Info', 'Keterangan wajib diisi!', 'info')
  }

  const data = {
    service_order_id: service.value.id,
    item_type: itemForm.type,
    spare_part_id: partId ? Number(partId) : null,
    description: desc,
    quantity: Number(itemForm.qty),
    price: Number(itemForm.price)
  }

  try {
    ServiceItemSchema.parse(data)
  } catch (validationError: unknown) {
    const err = validationError as { issues: { message: string }[] }
    const errMsgs = err.issues?.map((e) => e.message).join('<br/>') || 'Validasi Gagal'
    return window.Swal.fire({ icon: 'error', title: 'Validasi Gagal', html: errMsgs })
  }

  const finalData = {
    ...data,
    subtotal: data.quantity * data.price
  }

  try {
    await window.api.addServiceItem(finalData)

    await loadItems()
    await loadServiceDetail()
    if (itemForm.type === 'Sparepart') await loadParts()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal menambah item.', 'error')
  }
}

const deleteItem = async (itemId: number) => {
  const result = await window.Swal.fire({
    title: 'Hapus item ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    await window.api.deleteServiceItem(itemId)
    await loadItems()
    await loadServiceDetail()
    await loadParts()
  }
}

const addPayment = async (paymentForm: { amount: number; method: string }) => {
  if (!service.value) return
  if (paymentForm.amount <= 0) return window.Swal.fire('Info', 'Nominal harus lebih dari 0', 'info')
  if (paymentForm.amount > remainingBill.value) {
    const confirm = await window.Swal.fire({
      title: 'Nominal Berlebih',
      text: `Nominal yang dimasukkan (${formatCurrency(paymentForm.amount)}) lebih besar dari sisa tagihan (${formatCurrency(remainingBill.value)}). Tetap lanjutkan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan'
    })
    if (!confirm.isConfirmed) return
  }

  const data = {
    service_order_id: service.value.id,
    amount: Number(paymentForm.amount),
    payment_method: paymentForm.method,
    notes: ''
  }

  try {
    PaymentSchema.parse(data)
  } catch (validationError: unknown) {
    const err = validationError as { issues: { message: string }[] }
    const errMsgs = err.issues?.map((e) => e.message).join('<br/>') || 'Validasi Gagal'
    return window.Swal.fire({ icon: 'error', title: 'Validasi Gagal', html: errMsgs })
  }

  try {
    await window.api.addPayment(data as Payment)
    await loadPayments()
    await loadServiceDetail()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal memproses pembayaran.', 'error')
  }
}

const deletePayment = async (paymentId: number) => {
  if (!service.value) return
  const result = await window.Swal.fire({
    title: 'Hapus pembayaran?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    await window.api.deletePayment(paymentId)
    await loadPayments()
    await loadServiceDetail()
  }
}

const getCommonData = async () => {
  const settings = (await window.api.getSettings()) as Settings
  const logoBase64 = window.api.getLogoBase64 ? await window.api.getLogoBase64() : ''
  return { settings, logoBase64 }
}

const sendWhatsApp = () => {
  if (!service.value) return
  const phone = service.value.customer_phone
  if (!phone) {
    return window.Swal.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
  }

  let text = `Halo Kak ${service.value.customer_name},
Perangkat ${service.value.brand || ''} ${service.value.model || ''} dengan No Tiket *${service.value.ticket_number}* saat ini berstatus: *${service.value.service_status}*.
Sisa Tagihan: *${formatCurrency(remainingBill.value)}*.
Terima kasih telah mempercayakan perbaikan kepada kami.`

  if (waTemplate.value) {
    text = waTemplate.value
      .replace(/{nama}/g, service.value.customer_name || '')
      .replace(/{tiket}/g, service.value.ticket_number || '')
      .replace(/{status}/g, service.value.service_status || '')
  }

  waMessage.value = text
  isWaModalOpen.value = true
}

const confirmSendWa = (finalMessage: string) => {
  if (!service.value) return
  const phone = service.value.customer_phone || ''
  const targetPhone = phone.replace(/^0/, '62')

  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(finalMessage)}`
  if (window.api && window.api.openExternalUrl) {
    window.api.openExternalUrl(url)
  } else {
    window.open(url, '_blank')
  }
  isWaModalOpen.value = false
}

const exportPdfInvoice = async () => {
  if (!service.value) return
  try {
    const { settings, logoBase64 } = await getCommonData()
    const html = generateInvoiceHtml(
      settings,
      service.value,
      items.value,
      payments.value,
      logoBase64
    )
    const filename = `Invoice_${service.value.ticket_number}_${(service.value.customer_name || '').replace(/\s+/g, '_')}.pdf`

    const result = await exportHtmlToPdf(html, filename)
    if (result && result.success) {
      window.Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'PDF berhasil disimpan!',
        timer: 1500,
        showConfirmButton: false
      })
    } else if (result && !result.canceled) {
      window.Swal.fire('Error', 'Gagal menyimpan PDF: ' + (result.error || ''), 'error')
    }
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Terjadi kesalahan saat memproses PDF.', 'error')
  }
}

const printNota = async () => {
  if (!service.value) return
  try {
    const { settings, logoBase64 } = await getCommonData()
    let qrBase64 = null
    try {
      qrBase64 = await QRCode.toDataURL(service.value.ticket_number)
    } catch (e) {
      console.error('QR Code Error:', e)
    }
    const html = generateNotaHtml(settings, service.value, logoBase64, qrBase64)
    await printHtml(html, true) // landscape for nota
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal mencetak tanda terima.', 'error')
  }
}

const printThermal = async () => {
  if (!service.value) return
  try {
    const { settings, logoBase64 } = await getCommonData()
    let qrBase64 = null
    try {
      qrBase64 = await QRCode.toDataURL(service.value.ticket_number)
    } catch (e) {
      console.error('QR Code Error:', e)
    }
    const html = generateThermalNotaHtml(settings, service.value, logoBase64, qrBase64)
    await printHtml(html, false, true) // portrait for thermal, isThermal = true
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal mencetak struk thermal.', 'error')
  }
}

const printReceipt = async () => {
  if (!service.value) return
  try {
    const { settings, logoBase64 } = await getCommonData()
    const html = generateInvoiceHtml(
      settings,
      service.value,
      items.value,
      payments.value,
      logoBase64
    )
    await printHtml(html, false) // portrait for invoice
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    window.Swal.fire('Error', msg || 'Gagal mencetak invoice.', 'error')
  }
}

onMounted(async () => {
  await loadServiceDetail()
  await loadHistory()
  await loadItems()
  await loadPayments()
  await loadParts()
  await loadPhotos()
  await loadSettings()

  window.addEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault()
    printReceipt()
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
