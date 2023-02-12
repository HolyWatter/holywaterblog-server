/*
  Warnings:

  - You are about to alter the column `created` on the `Posting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `postingId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Posting` MODIFY `created` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(191) NOT NULL,
    `postingId` INTEGER NULL,

    UNIQUE INDEX `Tags_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tags` ADD CONSTRAINT `Tags_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
