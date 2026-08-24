CREATE TABLE `clientWorkspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`workspaceCode` varchar(64) NOT NULL,
	`classification` enum('synthetic','internal','restricted') NOT NULL DEFAULT 'synthetic',
	`status` enum('prospect','active','archived') NOT NULL DEFAULT 'active',
	`ownerUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientWorkspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientWorkspaces_workspaceCode_unique` UNIQUE(`workspaceCode`)
);
--> statement-breakpoint
CREATE TABLE `engagementNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`recipientUserId` int NOT NULL,
	`notificationType` enum('review-requested','governance-updated','report-approved','retest-signed-off','delivery-share-created') NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engagementNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagementTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`templateJson` json NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagementTemplates_id` PRIMARY KEY(`id`)
);
