-- AlterTable
ALTER TABLE `CourseModule` ADD COLUMN `durationMinutes` INTEGER NULL;

-- AlterTable
ALTER TABLE `CredentialTemplate` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `promoVideoUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `VerifiedEntity` ADD COLUMN `bio` TEXT NULL;

-- CreateTable
CREATE TABLE `Pricing` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `type` ENUM('FREE', 'ONE_TIME', 'SUBSCRIPTION') NOT NULL DEFAULT 'ONE_TIME',
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'IN_PROGRESS',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Enrollment_profileId_templateId_key`(`profileId`, `templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pricing` ADD CONSTRAINT `Pricing_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CredentialTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CredentialTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
