/*
  Warnings:

  - A unique constraint covering the columns `[templateId]` on the table `Pricing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CredentialTemplate` ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX `Pricing_templateId_key` ON `Pricing`(`templateId`);
