/*
  Warnings:

  - The primary key for the `SBTRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deadline` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `SBTRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Address]` on the table `SBTRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Address` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `SBTRequest_tokenId_key` ON `SBTRequest`;

-- AlterTable
ALTER TABLE `SBTRequest` DROP PRIMARY KEY,
    DROP COLUMN `deadline`,
    DROP COLUMN `to`,
    DROP COLUMN `tokenId`,
    DROP COLUMN `uri`,
    ADD COLUMN `Address` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `SBTRequest_Address_key` ON `SBTRequest`(`Address`);
