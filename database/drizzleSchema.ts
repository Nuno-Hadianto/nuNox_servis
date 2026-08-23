import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('admin'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  notes: text('notes'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const devices = sqliteTable('devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  device_type: text('device_type').notNull(),
  brand: text('brand'),
  model: text('model'),
  serial_number: text('serial_number'),
  color: text('color'),
  accessories: text('accessories'),
  physical_condition: text('physical_condition'),
  notes: text('notes'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const serviceOrders = sqliteTable('service_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticket_number: text('ticket_number').notNull().unique(),
  customer_id: integer('customer_id').notNull().references(() => customers.id),
  device_id: integer('device_id').notNull().references(() => devices.id),
  received_date: text('received_date').default(sql`CURRENT_TIMESTAMP`),
  estimated_completion_date: text('estimated_completion_date'),
  technician: text('technician'),
  customer_complaint: text('customer_complaint'),
  diagnosis_result: text('diagnosis_result'),
  actions_taken: text('actions_taken'),
  technician_notes: text('technician_notes'),
  estimated_cost: real('estimated_cost').default(0),
  total_cost: real('total_cost').default(0),
  service_status: text('service_status').default('Diterima'),
  payment_status: text('payment_status').default('Belum Bayar'),
  completed_date: text('completed_date'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const serviceStatusHistory = sqliteTable('service_status_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  service_order_id: integer('service_order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  notes: text('notes'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const spareParts = sqliteTable('spare_parts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  part_code: text('part_code').unique(),
  name: text('name').notNull(),
  category: text('category'),
  stock: integer('stock').default(0),
  buy_price: real('buy_price').default(0),
  sell_price: real('sell_price').default(0),
  unit: text('unit'),
  notes: text('notes'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const serviceItems = sqliteTable('service_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  service_order_id: integer('service_order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  item_type: text('item_type').notNull(),
  spare_part_id: integer('spare_part_id').references(() => spareParts.id),
  description: text('description').notNull(),
  quantity: integer('quantity').default(1),
  price: real('price').notNull(),
  cost_price: real('cost_price').default(0),
  total: real('total').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  service_order_id: integer('service_order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  payment_number: text('payment_number').notNull().unique(),
  payment_date: text('payment_date').default(sql`CURRENT_TIMESTAMP`),
  amount: real('amount').notNull(),
  payment_method: text('payment_method').notNull(),
  notes: text('notes'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const receipts = sqliteTable('receipts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  service_order_id: integer('service_order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  receipt_number: text('receipt_number').notNull().unique(),
  receipt_date: text('receipt_date').default(sql`CURRENT_TIMESTAMP`),
  total_amount: real('total_amount').notNull(),
  pdf_path: text('pdf_path'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_number: text('invoice_number').notNull().unique(),
  customer_name: text('customer_name'),
  total_amount: real('total_amount').notNull().default(0),
  payment_method: text('payment_method').default('Tunai'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const saleItems = sqliteTable('sale_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sale_id: integer('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  spare_part_id: integer('spare_part_id').notNull().references(() => spareParts.id),
  quantity: integer('quantity').default(1),
  price: real('price').notNull(),
  total: real('total').notNull()
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const servicePhotos = sqliteTable('service_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  service_order_id: integer('service_order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  photo_type: text('photo_type').notNull(),
  filepath: text('filepath').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
