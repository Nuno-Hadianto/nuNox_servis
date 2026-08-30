import { z } from 'zod'

export const CustomerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi.').max(100, 'Nama terlalu panjang.'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const SparepartSchema = z.object({
  part_code: z.string().optional().nullable(),
  name: z.string().min(1, 'Nama sparepart wajib diisi.').max(150, 'Nama terlalu panjang.'),
  category: z.string().optional().nullable(),
  stock: z.number().int('Stok harus berupa bilangan bulat.').min(0, 'Stok tidak boleh negatif.'),
  buy_price: z.number().min(0, 'Harga beli tidak boleh negatif.').optional().default(0),
  sell_price: z.number().min(0, 'Harga jual tidak boleh negatif.').optional().default(0),
  unit: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const DeviceSchema = z.object({
  customer_id: z.number().int('ID Pelanggan tidak valid.'),
  device_type: z.string().min(1, 'Jenis perangkat wajib diisi.'),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serial_number: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  physical_condition: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const ServiceOrderSchema = z.object({
  customer_id: z.number().int('ID Pelanggan tidak valid.'),
  device_id: z.number().int('ID Perangkat tidak valid.'),
  estimated_completion_date: z.string().optional().nullable(),
  technician: z.string().optional().nullable(),
  customer_complaint: z.string().optional().nullable(),
  diagnosis_result: z.string().optional().nullable(),
  actions_taken: z.string().optional().nullable(),
  technician_notes: z.string().optional().nullable(),
  estimated_cost: z.number().min(0, 'Estimasi biaya tidak boleh negatif.').default(0)
})

export const ServiceItemSchema = z.object({
  service_order_id: z.number().int('ID Servis tidak valid.'),
  item_type: z.enum(['Jasa', 'Sparepart', 'Biaya lainnya', 'Diskon', 'Part Luar'] as const, {
    message: 'Jenis item tidak valid.'
  }),
  spare_part_id: z.number().int().optional().nullable(),
  description: z.string().min(1, 'Deskripsi wajib diisi.'),
  quantity: z.number().int('Kuantitas harus berupa bilangan bulat.').min(1, 'Kuantitas minimal 1.'),
  price: z.number().min(0, 'Harga tidak boleh negatif.'),
  cost_price: z.number().min(0, 'Harga beli (modal) tidak boleh negatif.').optional()
})

export const PaymentSchema = z.object({
  service_order_id: z.number().int('ID Servis tidak valid.'),
  amount: z.number().min(1, 'Jumlah pembayaran minimal 1.'),
  payment_method: z.string().min(1, 'Metode pembayaran wajib diisi.'),
  notes: z.string().optional().nullable()
})

export const UserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter.').max(50, 'Username terlalu panjang.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  role: z.enum(['admin', 'kasir', 'teknisi']).default('kasir')
})


export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      // Flatten error messages to a single readable string
      const errMessages = error.issues.map((err) => err.message).join(' | ')
      throw new Error(`Validasi Gagal: ${errMessages}`)
    }
    throw error
  }
}
