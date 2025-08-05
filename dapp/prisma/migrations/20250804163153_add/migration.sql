-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `VerifiedEntity`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
