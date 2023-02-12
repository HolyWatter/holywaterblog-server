/*
  Warnings:

  - You are about to drop the column `markdwonId` on the `MarkdownComment` table. All the data in the column will be lost.
  - You are about to drop the `Markdwon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MarkdownComment` DROP FOREIGN KEY `MarkdownComment_markdwonId_fkey`;

-- DropForeignKey
ALTER TABLE `Markdwon` DROP FOREIGN KEY `Markdwon_user_id_fkey`;

-- AlterTable
ALTER TABLE `MarkdownComment` DROP COLUMN `markdwonId`,
    ADD COLUMN `markdownId` INTEGER NULL;

-- DropTable
DROP TABLE `Markdwon`;

-- CreateTable
CREATE TABLE `Markdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `created` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `Markdown_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Markdown` ADD CONSTRAINT `Markdown_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkdownComment` ADD CONSTRAINT `MarkdownComment_markdownId_fkey` FOREIGN KEY (`markdownId`) REFERENCES `Markdown`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
