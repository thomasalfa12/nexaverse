/*
  Warnings:

  - You are about to drop the column `templateId` on the `CourseModule` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `CuratedCredential` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `EligibilityRecord` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `approvalTxHash` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the column `claimTxHash` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the column `claimedAt` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the column `requestTxHash` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VerifiedSbtClaimProcess` table. All the data in the column will be lost.
  - You are about to drop the `CredentialTemplate` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[credentialId,tokenId]` on the table `CuratedCredential` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[credentialId,userWalletAddress]` on the table `EligibilityRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId]` on the table `Pricing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `CourseModule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialId` to the `CuratedCredential` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `CuratedCredential` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `credentialId` to the `EligibilityRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Enrollment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `courseId` to the `Pricing` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `CourseModule` DROP FOREIGN KEY `CourseModule_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `CredentialTemplate` DROP FOREIGN KEY `CredentialTemplate_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `CuratedCredential` DROP FOREIGN KEY `CuratedCredential_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `CuratedCredential` DROP FOREIGN KEY `CuratedCredential_userId_fkey`;

-- DropForeignKey
ALTER TABLE `EligibilityRecord` DROP FOREIGN KEY `EligibilityRecord_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `Enrollment` DROP FOREIGN KEY `Enrollment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Pricing` DROP FOREIGN KEY `Pricing_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `Submission` DROP FOREIGN KEY `Submission_userId_fkey`;

-- DropIndex
DROP INDEX `CourseModule_templateId_fkey` ON `CourseModule`;

-- DropIndex
DROP INDEX `CuratedCredential_templateId_tokenId_key` ON `CuratedCredential`;

-- DropIndex
DROP INDEX `CuratedCredential_userId_fkey` ON `CuratedCredential`;

-- DropIndex
DROP INDEX `EligibilityRecord_templateId_userWalletAddress_key` ON `EligibilityRecord`;

-- DropIndex
DROP INDEX `Enrollment_templateId_fkey` ON `Enrollment`;

-- DropIndex
DROP INDEX `Enrollment_userId_templateId_key` ON `Enrollment`;

-- DropIndex
DROP INDEX `Pricing_templateId_key` ON `Pricing`;

-- DropIndex
DROP INDEX `Submission_userId_fkey` ON `Submission`;

-- AlterTable
ALTER TABLE `CourseModule` DROP COLUMN `templateId`,
    ADD COLUMN `courseId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CuratedCredential` DROP COLUMN `templateId`,
    ADD COLUMN `credentialId` VARCHAR(191) NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `EligibilityRecord` DROP COLUMN `templateId`,
    ADD COLUMN `credentialId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Enrollment` DROP COLUMN `templateId`,
    ADD COLUMN `courseId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Pricing` DROP COLUMN `templateId`,
    ADD COLUMN `courseId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Submission` MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `bio` TEXT NULL;

-- AlterTable
ALTER TABLE `VerifiedSbtClaimProcess` DROP COLUMN `approvalTxHash`,
    DROP COLUMN `approvedAt`,
    DROP COLUMN `claimTxHash`,
    DROP COLUMN `claimedAt`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `requestTxHash`,
    DROP COLUMN `updatedAt`;

-- DropTable
DROP TABLE `CredentialTemplate`;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `contractAddress` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `category` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `creatorId` INTEGER NOT NULL,

    UNIQUE INDEX `Course_contractAddress_key`(`contractAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Credential` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `contractAddress` VARCHAR(191) NOT NULL,
    `merkleRoot` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `creatorId` INTEGER NOT NULL,

    UNIQUE INDEX `Credential_contractAddress_key`(`contractAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CuratedCredential_credentialId_tokenId_key` ON `CuratedCredential`(`credentialId`, `tokenId`);

-- CreateIndex
CREATE UNIQUE INDEX `EligibilityRecord_credentialId_userWalletAddress_key` ON `EligibilityRecord`(`credentialId`, `userWalletAddress`);

-- CreateIndex
CREATE UNIQUE INDEX `Enrollment_userId_courseId_key` ON `Enrollment`(`userId`, `courseId`);

-- CreateIndex
CREATE UNIQUE INDEX `Pricing_courseId_key` ON `Pricing`(`courseId`);

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseModule` ADD CONSTRAINT `CourseModule_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pricing` ADD CONSTRAINT `Pricing_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Credential` ADD CONSTRAINT `Credential_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EligibilityRecord` ADD CONSTRAINT `EligibilityRecord_credentialId_fkey` FOREIGN KEY (`credentialId`) REFERENCES `Credential`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuratedCredential` ADD CONSTRAINT `CuratedCredential_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuratedCredential` ADD CONSTRAINT `CuratedCredential_credentialId_fkey` FOREIGN KEY (`credentialId`) REFERENCES `Credential`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
