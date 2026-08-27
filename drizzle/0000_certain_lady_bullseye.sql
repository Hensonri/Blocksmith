CREATE TABLE `usage_counts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_type` text NOT NULL,
	`platform` text NOT NULL,
	`variant` text DEFAULT '' NOT NULL,
	`event_date` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usage_counts_event_platform_variant_date` ON `usage_counts` (`event_type`,`platform`,`variant`,`event_date`);