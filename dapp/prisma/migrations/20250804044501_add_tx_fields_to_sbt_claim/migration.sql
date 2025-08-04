/*
  Warnings:

  - Added the required column `updatedAt` to the `VerifiedSbtClaimProcess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VerifiedSbtClaimProcess` ADD COLUMN `approvalTxHash` VARCHAR(191) NULL,
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `claimTxHash` VARCHAR(191) NULL,
    ADD COLUMN `claimedAt` DATETIME(3) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `requestTxHash` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
