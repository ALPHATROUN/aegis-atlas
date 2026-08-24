CREATE TABLE `assessmentAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`stableId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`assetType` enum('domain','host','service','site','cloud','provider','custom') NOT NULL,
	`status` enum('observed','validated','watch','excluded','quarantined') NOT NULL DEFAULT 'observed',
	`confidence` enum('confirmed','high','medium','inferred') NOT NULL DEFAULT 'medium',
	`geometryJson` json,
	`provenance` text NOT NULL,
	`rawReference` varchar(512),
	`lastObservedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessmentAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentAuditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`actorUserId` int,
	`eventType` varchar(128) NOT NULL,
	`summary` text NOT NULL,
	`detailsJson` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentAuditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessmentFindings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`assetId` int NOT NULL,
	`stableId` varchar(128) NOT NULL,
	`title` varchar(512) NOT NULL,
	`severity` enum('critical','high','medium','low','informational') NOT NULL,
	`confidence` enum('confirmed','high','medium','inferred') NOT NULL,
	`status` enum('open','in-progress','accepted','resolved') NOT NULL DEFAULT 'open',
	`riskFactorsJson` json NOT NULL,
	`remediation` text NOT NULL,
	`owner` varchar(255),
	`retestStatus` enum('pending','scheduled','verified','not-required') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessmentFindings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`authorizationStatus` enum('draft','authorized','expired','closed') NOT NULL DEFAULT 'draft',
	`safetyPosture` enum('enforced','review','blocked') NOT NULL DEFAULT 'enforced',
	`scopeJson` json NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagements_id` PRIMARY KEY(`id`),
	CONSTRAINT `engagements_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `evidenceArtifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`findingId` int,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(768) NOT NULL,
	`originalName` varchar(512) NOT NULL,
	`mediaType` varchar(255) NOT NULL,
	`byteSize` int NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`classification` enum('synthetic','internal','confidential','restricted') NOT NULL DEFAULT 'synthetic',
	`sourceMetadataJson` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidenceArtifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedAtlasViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`stateJson` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedAtlasViews_id` PRIMARY KEY(`id`)
);
