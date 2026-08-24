CREATE TABLE `complianceEvidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`controlName` varchar(255) NOT NULL,
	`controlStatus` enum('planned','in-review','satisfied','exception') NOT NULL DEFAULT 'planned',
	`evidenceReference` varchar(768) NOT NULL,
	`accountableOwner` varchar(255) NOT NULL,
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceEvidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connectorReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`adapterType` enum('cmdb','cloud-identity','vulnerability-edr','ticketing-grc','gis-facilities') NOT NULL,
	`reviewStatus` enum('planned','security-review','approved','blocked','revoked') NOT NULL DEFAULT 'planned',
	`connectorOwner` varchar(255) NOT NULL,
	`dataResidency` varchar(255) NOT NULL,
	`evidenceJson` json NOT NULL,
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connectorReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryAttestations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`reportDeliveryId` int,
	`audience` enum('executive','technical','risk','client') NOT NULL,
	`attestationType` enum('delivery-approval','evidence-review','retest-sign-off','closure') NOT NULL,
	`attestationState` enum('pending','attested','declined') NOT NULL DEFAULT 'pending',
	`notes` text NOT NULL,
	`attestedByUserId` int,
	`attestedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveryAttestations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryExceptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`reportDeliveryId` int,
	`title` varchar(512) NOT NULL,
	`rationale` text NOT NULL,
	`exceptionStatus` enum('requested','approved','rejected','expired') NOT NULL DEFAULT 'requested',
	`expiresAt` timestamp,
	`requestedByUserId` int NOT NULL,
	`decidedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveryExceptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exposureValidations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`gisZone` varchar(255) NOT NULL,
	`evidenceReference` varchar(768) NOT NULL,
	`confidence` enum('none','inferred','medium','high') NOT NULL DEFAULT 'inferred',
	`validationState` enum('hypothesis','evidence-review','analyst-confirmed','rejected') NOT NULL DEFAULT 'hypothesis',
	`reviewerUserId` int,
	`reviewedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exposureValidations_id` PRIMARY KEY(`id`)
);
