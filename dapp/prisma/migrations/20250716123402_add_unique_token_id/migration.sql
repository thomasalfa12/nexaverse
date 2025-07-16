/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `SBTSignature` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SBTSignature_tokenId_key` ON `SBTSignature`(`tokenId`);
