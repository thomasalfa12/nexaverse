/*
  Warnings:

  - You are about to drop the column `onChainTokenId` on the `SBTApproval` table. All the data in the column will be lost.
  - You are about to alter the column `tokenId` on the `SBTApproval` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `SBTApproval` DROP COLUMN `onChainTokenId`,
    MODIFY `tokenId` INTEGER NOT NULL;
