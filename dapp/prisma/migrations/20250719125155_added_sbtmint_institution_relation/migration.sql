/*
  Warnings:

  - You are about to drop the `SBTApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SBTRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `SBTApproval`;

-- DropTable
DROP TABLE `SBTRequest`;

-- CreateTable
CREATE TABLE `SbtMint` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'CLAIMED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `tokenId` INTEGER NULL,
    `uri` VARCHAR(191) NULL,
    `approvalTxHash` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `claimTxHash` VARCHAR(191) NULL,
    `claimedAt` DATETIME(3) NULL,
    `requestTxHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SbtMint_institutionId_key`(`institutionId`),
    UNIQUE INDEX `SbtMint_tokenId_key`(`tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SbtMint` ADD CONSTRAINT `SbtMint_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
