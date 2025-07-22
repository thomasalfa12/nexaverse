/*
  Warnings:

  - You are about to drop the `Institution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SbtMint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `SbtMint` DROP FOREIGN KEY `SbtMint_institutionId_fkey`;

-- DropTable
DROP TABLE `Institution`;

-- DropTable
DROP TABLE `SbtMint`;

-- CreateTable
CREATE TABLE `VerifiedEntity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `primaryUrl` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `entityType` INTEGER NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,
    `registrationDate` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'REGISTERED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `VerifiedEntity_walletAddress_key`(`walletAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifiedSbtClaimProcess` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` INTEGER NOT NULL,
    `status` ENUM('NOT_REQUESTED', 'REQUESTED', 'APPROVED', 'CLAIMED') NOT NULL DEFAULT 'NOT_REQUESTED',
    `cid` VARCHAR(191) NULL,
    `tokenId` INTEGER NULL,
    `requestTxHash` VARCHAR(191) NULL,
    `approvalTxHash` VARCHAR(191) NULL,
    `claimTxHash` VARCHAR(191) NULL,

    UNIQUE INDEX `VerifiedSbtClaimProcess_entityId_key`(`entityId`),
    UNIQUE INDEX `VerifiedSbtClaimProcess_tokenId_key`(`tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(191) NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,

    UNIQUE INDEX `Profile_walletAddress_key`(`walletAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CredentialTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `contractAddress` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,

    UNIQUE INDEX `CredentialTemplate_contractAddress_key`(`contractAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EligibilityRecord` (
    `id` VARCHAR(191) NOT NULL,
    `userWalletAddress` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ELIGIBLE',
    `templateId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EligibilityRecord_templateId_userWalletAddress_key`(`templateId`, `userWalletAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuratedCredential` (
    `id` VARCHAR(191) NOT NULL,
    `tokenId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `ownerProfileId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `issuerId` INTEGER NOT NULL,

    UNIQUE INDEX `CuratedCredential_templateId_tokenId_key`(`templateId`, `tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerifiedSbtClaimProcess` ADD CONSTRAINT `VerifiedSbtClaimProcess_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CredentialTemplate` ADD CONSTRAINT `CredentialTemplate_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EligibilityRecord` ADD CONSTRAINT `EligibilityRecord_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CredentialTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuratedCredential` ADD CONSTRAINT `CuratedCredential_ownerProfileId_fkey` FOREIGN KEY (`ownerProfileId`) REFERENCES `Profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuratedCredential` ADD CONSTRAINT `CuratedCredential_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CredentialTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuratedCredential` ADD CONSTRAINT `CuratedCredential_issuerId_fkey` FOREIGN KEY (`issuerId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
