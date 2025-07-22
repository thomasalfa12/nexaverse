/*
  Warnings:

  - You are about to drop the column `registrationDate` on the `VerifiedEntity` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `CredentialTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CuratedCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EligibilityRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VerifiedEntity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VerifiedSbtClaimProcess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CredentialTemplate` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `CuratedCredential` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `EligibilityRecord` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `VerifiedEntity` DROP COLUMN `registrationDate`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `registeredAt` DATETIME(3) NULL,
    ADD COLUMN `registrationTxHash` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `VerifiedSbtClaimProcess` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
