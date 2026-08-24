CREATE TABLE `assessmentComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`taskId` int,
	`findingId` int,
	`reportDeliveryId` int,
	`body` text NOT NULL,
	`authorUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagementGovernance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`scopeApprovalStatus` enum('draft','pending-review','approved','expired','blocked') NOT NULL DEFAULT 'draft',
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`importGateStatus` enum('review-required','approved','blocked') NOT NULL DEFAULT 'review-required',
	`dataOriginLabel` varchar(255) NOT NULL DEFAULT 'synthetic-authorized-demo',
	`retentionProfile` enum('demo-session','engagement','legal-hold','restricted') NOT NULL DEFAULT 'engagement',
	`redactionProfile` enum('synthetic-demo','internal','client','restricted') NOT NULL DEFAULT 'synthetic-demo',
	`watermarkText` varchar(255) NOT NULL DEFAULT 'SYNTHETIC · AUTHORIZED DEMONSTRATION',
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagementGovernance_id` PRIMARY KEY(`id`),
	CONSTRAINT `engagementGovernance_engagementId_unique` UNIQUE(`engagementId`)
);
--> statement-breakpoint
CREATE TABLE `importDecisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`artifactName` varchar(512) NOT NULL,
	`artifactHash` varchar(64) NOT NULL,
	`disposition` enum('approved','quarantined','rejected') NOT NULL,
	`rationale` text NOT NULL,
	`decidedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `importDecisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportShareLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`reportDeliveryId` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`accessLevel` enum('read-only') NOT NULL DEFAULT 'read-only',
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportShareLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `reportShareLinks_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `taskReviewEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`taskId` int NOT NULL,
	`reviewState` enum('requested','approved','changes-requested','retest-signed-off') NOT NULL,
	`summary` text NOT NULL,
	`reviewerUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskReviewEvents_id` PRIMARY KEY(`id`)
);
