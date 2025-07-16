/*
  Warnings:

  - You are about to drop the column `deadline` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the `SignedSBT` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `email` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SBTRequest` DROP COLUMN `deadline`,
    DROP COLUMN `to`,
    DROP COLUMN `tokenId`,
    DROP COLUMN `uri`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `wallet` VARCHAR(42) NOT NULL,
    ADD COLUMN `website` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `SignedSBT`;

-- CreateTable
CREATE TABLE `SBTSignature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `to` VARCHAR(42) NOT NULL,
    `tokenId` BIGINT NOT NULL,
    `uri` VARCHAR(191) NOT NULL,
    `deadline` BIGINT NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
