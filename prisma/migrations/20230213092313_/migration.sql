/*
  Warnings:

  - You are about to drop the column `img` on the `Posting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Posting` DROP COLUMN `img`;

-- CreateTable
CREATE TABLE `PostingImg` (
    `id` INTEGER NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `postingId` INTEGER NULL,

    UNIQUE INDEX `PostingImg_location_key`(`location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PostingImg` ADD CONSTRAINT `PostingImg_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
