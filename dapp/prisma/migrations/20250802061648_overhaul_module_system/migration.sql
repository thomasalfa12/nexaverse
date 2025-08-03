/*
  Warnings:

  - You are about to drop the column `contentText` on the `CourseModule` table. All the data in the column will be lost.
  - You are about to drop the column `contentUrl` on the `CourseModule` table. All the data in the column will be lost.
  - You are about to drop the column `durationMinutes` on the `CourseModule` table. All the data in the column will be lost.
  - You are about to drop the column `quizData` on the `CourseModule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CourseModule` DROP COLUMN `contentText`,
    DROP COLUMN `contentUrl`,
    DROP COLUMN `durationMinutes`,
    DROP COLUMN `quizData`;

-- CreateTable
CREATE TABLE `ModuleText` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ModuleText_moduleId_key`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleVideo` (
    `id` VARCHAR(191) NOT NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `duration` INTEGER NULL,
    `moduleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ModuleVideo_moduleId_key`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleLiveSession` (
    `id` VARCHAR(191) NOT NULL,
    `meetingUrl` VARCHAR(191) NOT NULL,
    `sessionTime` DATETIME(3) NOT NULL,
    `description` TEXT NULL,
    `moduleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ModuleLiveSession_moduleId_key`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `instructions` TEXT NOT NULL,
    `deadline` DATETIME(3) NULL,
    `moduleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ModuleAssignment_moduleId_key`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleQuiz` (
    `id` VARCHAR(191) NOT NULL,
    `questions` JSON NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ModuleQuiz_moduleId_key`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ModuleText` ADD CONSTRAINT `ModuleText_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `CourseModule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleVideo` ADD CONSTRAINT `ModuleVideo_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `CourseModule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleLiveSession` ADD CONSTRAINT `ModuleLiveSession_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `CourseModule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleAssignment` ADD CONSTRAINT `ModuleAssignment_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `CourseModule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleQuiz` ADD CONSTRAINT `ModuleQuiz_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `CourseModule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
