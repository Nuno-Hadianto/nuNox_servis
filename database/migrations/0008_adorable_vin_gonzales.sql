ALTER TABLE `customers` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `devices` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `service_orders` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `spare_parts` ADD `deleted_at` text;