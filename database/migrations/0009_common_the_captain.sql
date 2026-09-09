ALTER TABLE `service_orders` ADD `accessories` text;--> statement-breakpoint
ALTER TABLE `service_orders` ADD `physical_condition` text;--> statement-breakpoint
ALTER TABLE `devices` DROP COLUMN `accessories`;--> statement-breakpoint
ALTER TABLE `devices` DROP COLUMN `physical_condition`;--> statement-breakpoint
ALTER TABLE `spare_parts` DROP COLUMN `unit`;--> statement-breakpoint
ALTER TABLE `spare_parts` DROP COLUMN `notes`;