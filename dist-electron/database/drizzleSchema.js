"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicePhotos = exports.settings = exports.saleItems = exports.sales = exports.receipts = exports.payments = exports.serviceItems = exports.partLogs = exports.spareParts = exports.serviceStatusHistory = exports.serviceOrders = exports.devices = exports.customers = exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    username: (0, sqlite_core_1.text)('username').notNull().unique(),
    password: (0, sqlite_core_1.text)('password').notNull(),
    role: (0, sqlite_core_1.text)('role').default('admin'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.customers = (0, sqlite_core_1.sqliteTable)('customers', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phone: (0, sqlite_core_1.text)('phone'),
    address: (0, sqlite_core_1.text)('address'),
    notes: (0, sqlite_core_1.text)('notes'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updated_at: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.devices = (0, sqlite_core_1.sqliteTable)('devices', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    customer_id: (0, sqlite_core_1.integer)('customer_id').notNull().references(() => exports.customers.id, { onDelete: 'cascade' }),
    device_type: (0, sqlite_core_1.text)('device_type').notNull(),
    brand: (0, sqlite_core_1.text)('brand'),
    model: (0, sqlite_core_1.text)('model'),
    serial_number: (0, sqlite_core_1.text)('serial_number'),
    color: (0, sqlite_core_1.text)('color'),
    accessories: (0, sqlite_core_1.text)('accessories'),
    physical_condition: (0, sqlite_core_1.text)('physical_condition'),
    notes: (0, sqlite_core_1.text)('notes'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updated_at: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.serviceOrders = (0, sqlite_core_1.sqliteTable)('service_orders', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    ticket_number: (0, sqlite_core_1.text)('ticket_number').notNull().unique(),
    customer_id: (0, sqlite_core_1.integer)('customer_id').notNull().references(() => exports.customers.id),
    device_id: (0, sqlite_core_1.integer)('device_id').notNull().references(() => exports.devices.id),
    received_date: (0, sqlite_core_1.text)('received_date').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    estimated_completion_date: (0, sqlite_core_1.text)('estimated_completion_date'),
    technician: (0, sqlite_core_1.text)('technician'),
    customer_complaint: (0, sqlite_core_1.text)('customer_complaint'),
    diagnosis_result: (0, sqlite_core_1.text)('diagnosis_result'),
    actions_taken: (0, sqlite_core_1.text)('actions_taken'),
    technician_notes: (0, sqlite_core_1.text)('technician_notes'),
    estimated_cost: (0, sqlite_core_1.real)('estimated_cost').default(0),
    total_cost: (0, sqlite_core_1.real)('total_cost').default(0),
    service_status: (0, sqlite_core_1.text)('service_status').default('Diterima'),
    payment_status: (0, sqlite_core_1.text)('payment_status').default('Belum Bayar'),
    completed_date: (0, sqlite_core_1.text)('completed_date'),
    warranty_end_date: (0, sqlite_core_1.text)('warranty_end_date'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updated_at: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.serviceStatusHistory = (0, sqlite_core_1.sqliteTable)('service_status_history', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    service_order_id: (0, sqlite_core_1.integer)('service_order_id').notNull().references(() => exports.serviceOrders.id, { onDelete: 'cascade' }),
    status: (0, sqlite_core_1.text)('status').notNull(),
    notes: (0, sqlite_core_1.text)('notes'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.spareParts = (0, sqlite_core_1.sqliteTable)('spare_parts', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    part_code: (0, sqlite_core_1.text)('part_code').unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    category: (0, sqlite_core_1.text)('category'),
    stock: (0, sqlite_core_1.integer)('stock').default(0),
    buy_price: (0, sqlite_core_1.real)('buy_price').default(0),
    sell_price: (0, sqlite_core_1.real)('sell_price').default(0),
    unit: (0, sqlite_core_1.text)('unit'),
    notes: (0, sqlite_core_1.text)('notes'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updated_at: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.partLogs = (0, sqlite_core_1.sqliteTable)('part_logs', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    spare_part_id: (0, sqlite_core_1.integer)('spare_part_id').notNull().references(() => exports.spareParts.id, { onDelete: 'cascade' }),
    change_amount: (0, sqlite_core_1.integer)('change_amount').notNull(),
    new_stock: (0, sqlite_core_1.integer)('new_stock').notNull(),
    reason: (0, sqlite_core_1.text)('reason').notNull(),
    reference_id: (0, sqlite_core_1.text)('reference_id'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.serviceItems = (0, sqlite_core_1.sqliteTable)('service_items', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    service_order_id: (0, sqlite_core_1.integer)('service_order_id').notNull().references(() => exports.serviceOrders.id, { onDelete: 'cascade' }),
    item_type: (0, sqlite_core_1.text)('item_type').notNull(),
    spare_part_id: (0, sqlite_core_1.integer)('spare_part_id').references(() => exports.spareParts.id),
    description: (0, sqlite_core_1.text)('description').notNull(),
    quantity: (0, sqlite_core_1.integer)('quantity').default(1),
    price: (0, sqlite_core_1.real)('price').notNull(),
    cost_price: (0, sqlite_core_1.real)('cost_price').default(0),
    total: (0, sqlite_core_1.real)('total').notNull(),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.payments = (0, sqlite_core_1.sqliteTable)('payments', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    service_order_id: (0, sqlite_core_1.integer)('service_order_id').notNull().references(() => exports.serviceOrders.id, { onDelete: 'cascade' }),
    payment_number: (0, sqlite_core_1.text)('payment_number').notNull().unique(),
    payment_date: (0, sqlite_core_1.text)('payment_date').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    amount: (0, sqlite_core_1.real)('amount').notNull(),
    payment_method: (0, sqlite_core_1.text)('payment_method').notNull(),
    notes: (0, sqlite_core_1.text)('notes'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.receipts = (0, sqlite_core_1.sqliteTable)('receipts', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    service_order_id: (0, sqlite_core_1.integer)('service_order_id').notNull().references(() => exports.serviceOrders.id, { onDelete: 'cascade' }),
    receipt_number: (0, sqlite_core_1.text)('receipt_number').notNull().unique(),
    receipt_date: (0, sqlite_core_1.text)('receipt_date').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    total_amount: (0, sqlite_core_1.real)('total_amount').notNull(),
    pdf_path: (0, sqlite_core_1.text)('pdf_path'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.sales = (0, sqlite_core_1.sqliteTable)('sales', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    invoice_number: (0, sqlite_core_1.text)('invoice_number').notNull().unique(),
    customer_name: (0, sqlite_core_1.text)('customer_name'),
    total_amount: (0, sqlite_core_1.real)('total_amount').notNull().default(0),
    payment_method: (0, sqlite_core_1.text)('payment_method').default('Tunai'),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.saleItems = (0, sqlite_core_1.sqliteTable)('sale_items', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    sale_id: (0, sqlite_core_1.integer)('sale_id').notNull().references(() => exports.sales.id, { onDelete: 'cascade' }),
    spare_part_id: (0, sqlite_core_1.integer)('spare_part_id').notNull().references(() => exports.spareParts.id),
    quantity: (0, sqlite_core_1.integer)('quantity').default(1),
    price: (0, sqlite_core_1.real)('price').notNull(),
    total: (0, sqlite_core_1.real)('total').notNull()
});
exports.settings = (0, sqlite_core_1.sqliteTable)('settings', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    key: (0, sqlite_core_1.text)('key').notNull().unique(),
    value: (0, sqlite_core_1.text)('value'),
    updated_at: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
exports.servicePhotos = (0, sqlite_core_1.sqliteTable)('service_photos', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    service_order_id: (0, sqlite_core_1.integer)('service_order_id').notNull().references(() => exports.serviceOrders.id, { onDelete: 'cascade' }),
    photo_type: (0, sqlite_core_1.text)('photo_type').notNull(),
    filepath: (0, sqlite_core_1.text)('filepath').notNull(),
    created_at: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
});
