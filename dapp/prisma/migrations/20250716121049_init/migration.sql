/*
  Warnings:

  - You are about to drop the column `email` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `wallet` on the `SBTRequest` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `SBTRequest` table. All the data in the column will be lost.
  - Added the required column `deadline` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uri` to the `SBTRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SBTRequest` DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `type`,
    DROP COLUMN `wallet`,
    DROP COLUMN `website`,
    ADD COLUMN `deadline` BIGINT NOT NULL,
    ADD COLUMN `to` CHAR(42) NOT NULL,
    ADD COLUMN `tokenId` VARCHAR(191) NOT NULL,
    ADD COLUMN `uri` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SBTSignature` MODIFY `to` CHAR(42) NOT NULL,
    MODIFY `tokenId` VARCHAR(191) NOT NULL,
    MODIFY `signature` TEXT NOT NULL;
