/*
  Warnings:

  - You are about to drop the `InstitutionList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstitutionRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `InstitutionList`;

-- DropTable
DROP TABLE `InstitutionRequest`;

-- CreateTable
CREATE TABLE `Institution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `officialWebsite` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `institutionType` INTEGER NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'REGISTERED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `registrationTxHash` VARCHAR(191) NULL,
    `registeredAt` DATETIME(3) NULL,

    UNIQUE INDEX `Institution_walletAddress_key`(`walletAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
