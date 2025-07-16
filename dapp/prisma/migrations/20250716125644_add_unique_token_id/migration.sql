/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `SBTRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SBTRequest_tokenId_key` ON `SBTRequest`(`tokenId`);
