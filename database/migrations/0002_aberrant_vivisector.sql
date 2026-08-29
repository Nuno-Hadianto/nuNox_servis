DROP TABLE `sale_items`;--> statement-breakpoint
DROP TABLE `sales`;--> statement-breakpoint
CREATE INDEX `idx_customer_name` ON `customers` (`name`);--> statement-breakpoint
CREATE INDEX `idx_device_customer_id` ON `devices` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_so_ticket_number` ON `service_orders` (`ticket_number`);--> statement-breakpoint
CREATE INDEX `idx_so_customer_id` ON `service_orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_so_device_id` ON `service_orders` (`device_id`);--> statement-breakpoint
CREATE INDEX `idx_sparepart_code` ON `spare_parts` (`part_code`);