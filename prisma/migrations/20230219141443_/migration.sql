/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_refreshToken_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `refreshToken`,
    MODIFY `thumbnail_url` VARCHAR(191) NOT NULL DEFAULT 'https://holywater-blog.s3.ap-northeast-1.amazonaws.com/userProfile.png';

-- CreateTable
CREATE TABLE `GuestBook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `GuestBook_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GuestBook` ADD CONSTRAINT `GuestBook_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
