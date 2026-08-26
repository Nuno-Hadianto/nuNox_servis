CREATE TABLE IF NOT EXISTS `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`address` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`device_type` text NOT NULL,
	`brand` text,
	`model` text,
	`serial_number` text,
	`color` text,
	`accessories` text,
	`physical_condition` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_order_id` integer NOT NULL,
	`payment_number` text NOT NULL,
	`payment_date` text DEFAULT CURRENT_TIMESTAMP,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `payments_payment_number_unique` ON `payments` (`payment_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_order_id` integer NOT NULL,
	`receipt_number` text NOT NULL,
	`receipt_date` text DEFAULT CURRENT_TIMESTAMP,
	`total_amount` real NOT NULL,
	`pdf_path` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `receipts_receipt_number_unique` ON `receipts` (`receipt_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sale_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sale_id` integer NOT NULL,
	`spare_part_id` integer NOT NULL,
	`quantity` integer DEFAULT 1,
	`price` real NOT NULL,
	`total` real NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`spare_part_id`) REFERENCES `spare_parts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`customer_name` text,
	`total_amount` real DEFAULT 0 NOT NULL,
	`payment_method` text DEFAULT 'Tunai',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sales_invoice_number_unique` ON `sales` (`invoice_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_order_id` integer NOT NULL,
	`item_type` text NOT NULL,
	`spare_part_id` integer,
	`description` text NOT NULL,
	`quantity` integer DEFAULT 1,
	`price` real NOT NULL,
	`cost_price` real DEFAULT 0,
	`total` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`spare_part_id`) REFERENCES `spare_parts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_number` text NOT NULL,
	`customer_id` integer NOT NULL,
	`device_id` integer NOT NULL,
	`received_date` text DEFAULT CURRENT_TIMESTAMP,
	`estimated_completion_date` text,
	`technician` text,
	`customer_complaint` text,
	`diagnosis_result` text,
	`actions_taken` text,
	`technician_notes` text,
	`estimated_cost` real DEFAULT 0,
	`total_cost` real DEFAULT 0,
	`service_status` text DEFAULT 'Diterima',
	`payment_status` text DEFAULT 'Belum Bayar',
	`completed_date` text,
	`warranty_end_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `service_orders_ticket_number_unique` ON `service_orders` (`ticket_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_order_id` integer NOT NULL,
	`photo_type` text NOT NULL,
	`filepath` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_order_id` integer NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `spare_parts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`part_code` text,
	`name` text NOT NULL,
	`category` text,
	`stock` integer DEFAULT 0,
	`buy_price` real DEFAULT 0,
	`sell_price` real DEFAULT 0,
	`unit` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `spare_parts_part_code_unique` ON `spare_parts` (`part_code`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'admin',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_username_unique` ON `users` (`username`);
