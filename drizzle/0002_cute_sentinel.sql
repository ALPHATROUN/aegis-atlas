CREATE TABLE `assessmentTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`findingId` int,
	`title` varchar(512) NOT NULL,
	`taskStatus` enum('open','in-progress','blocked','done') NOT NULL DEFAULT 'open',
	`priority` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`assignedUserId` int,
	`dueAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessmentTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagementMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`userId` int NOT NULL,
	`workspaceRole` enum('manager','analyst','reviewer','read-only') NOT NULL DEFAULT 'analyst',
	`membershipStatus` enum('invited','active','suspended') NOT NULL DEFAULT 'invited',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagementMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `geospatialArtifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`artifactType` enum('geojson','kml','gpx','stac-item','imagery-annotation','floor-plan','offline-pack','aoi') NOT NULL,
	`reviewStatus` enum('draft','approved','quarantined','archived') NOT NULL DEFAULT 'draft',
	`coordinatePrecision` enum('exact','rounded','inferred','synthetic') NOT NULL DEFAULT 'synthetic',
	`sourceReference` varchar(768),
	`metadataJson` json NOT NULL,
	`geometryJson` json,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `geospatialArtifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportDeliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`reportType` enum('executive','technical','geographic','evidence','retest') NOT NULL,
	`deliveryStatus` enum('draft','review','approved','shared','superseded') NOT NULL DEFAULT 'draft',
	`redactionProfile` enum('synthetic-demo','internal','client','restricted') NOT NULL DEFAULT 'synthetic-demo',
	`storageKey` varchar(512),
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportDeliveries_id` PRIMARY KEY(`id`)
);
