CREATE TABLE `analysis_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`payload` mediumtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysis_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `analysis_reports_session_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `analysis_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`language` varchar(32) NOT NULL,
	`changeIntent` text NOT NULL,
	`status` enum('draft','analyzing','ready','failed') NOT NULL DEFAULT 'draft',
	`model` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysis_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` mediumtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `code_artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`filename` varchar(240) NOT NULL,
	`language` varchar(32) NOT NULL,
	`content` mediumtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `code_artifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analysis_reports` ADD CONSTRAINT `analysis_reports_sessionId_analysis_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `analysis_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analysis_sessions` ADD CONSTRAINT `analysis_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sessionId_analysis_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `analysis_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `code_artifacts` ADD CONSTRAINT `code_artifacts_sessionId_analysis_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `analysis_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `analysis_sessions_user_created_idx` ON `analysis_sessions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `chat_messages_session_created_idx` ON `chat_messages` (`sessionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `code_artifacts_session_idx` ON `code_artifacts` (`sessionId`);