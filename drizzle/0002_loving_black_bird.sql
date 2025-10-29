CREATE TABLE `ai_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`prompt_template` text NOT NULL,
	`system_message` text,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_prompts_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_prompts_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `ai_summary_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` int NOT NULL,
	`prompt_name` varchar(100) NOT NULL,
	`summary` text NOT NULL,
	`input_hash` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	CONSTRAINT `ai_summary_cache_id` PRIMARY KEY(`id`)
);
