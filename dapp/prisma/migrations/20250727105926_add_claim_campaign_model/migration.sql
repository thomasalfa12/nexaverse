-- CreateTable
CREATE TABLE `ClaimCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `contractAddress` VARCHAR(191) NOT NULL,
    `merkleRoot` VARCHAR(191) NOT NULL,
    `metadataUri` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `eligibleWallets` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ClaimCampaign_contractAddress_key`(`contractAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClaimCampaign` ADD CONSTRAINT `ClaimCampaign_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
