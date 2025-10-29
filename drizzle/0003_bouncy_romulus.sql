CREATE TABLE `saved_therapists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`therapist_id` int NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_therapists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`activity_type` varchar(50) NOT NULL,
	`entity_type` varchar(50),
	`entity_id` int,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blog_posts` MODIFY COLUMN `isPublished` int;--> statement-breakpoint
ALTER TABLE `blog_posts` MODIFY COLUMN `isPublished` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `isApproved` int;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `isApproved` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `isActive` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `therapists` MODIFY COLUMN `isActive` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `photoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailNotifications` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `smsNotifications` int DEFAULT 0;