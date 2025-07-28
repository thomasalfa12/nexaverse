/*
  Warnings:

  - You are about to drop the `ClaimCampaign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ClaimCampaign` DROP FOREIGN KEY `ClaimCampaign_creatorId_fkey`;

-- AlterTable
ALTER TABLE `CredentialTemplate` ADD COLUMN `eligibleWallets` JSON NULL,
    ADD COLUMN `merkleRoot` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `ClaimCampaign`;
