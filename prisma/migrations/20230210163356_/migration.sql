-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_posting_id_fkey`;

-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `postingId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
