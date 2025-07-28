/*
  Warnings:

  - You are about to drop the column `templateType` on the `CredentialTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[finalCredentialContract]` on the table `CredentialTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CredentialTemplate` DROP COLUMN `templateType`,
    ADD COLUMN `finalCredentialContract` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CredentialTemplate_finalCredentialContract_key` ON `CredentialTemplate`(`finalCredentialContract`);
