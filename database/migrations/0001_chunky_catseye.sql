CREATE TABLE `part_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spare_part_id` integer NOT NULL,
	`change_amount` integer NOT NULL,
	`new_stock` integer NOT NULL,
	`reason` text NOT NULL,
	`reference_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`spare_part_id`) REFERENCES `spare_parts`(`id`) ON UPDATE no action ON DELETE cascade
);
