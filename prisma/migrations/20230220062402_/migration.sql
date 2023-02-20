-- DropForeignKey
ALTER TABLE `GuestBook` DROP FOREIGN KEY `GuestBook_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Markdown` DROP FOREIGN KEY `Markdown_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `MarkdownComment` DROP FOREIGN KEY `MarkdownComment_markdownId_fkey`;

-- DropForeignKey
ALTER TABLE `MarkdownComment` DROP FOREIGN KEY `MarkdownComment_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `MarkdownImg` DROP FOREIGN KEY `MarkdownImg_MarkdownId_fkey`;

-- DropForeignKey
ALTER TABLE `MarkdownTag` DROP FOREIGN KEY `MarkdownTag_markdownId_fkey`;

-- DropForeignKey
ALTER TABLE `Posting` DROP FOREIGN KEY `Posting_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PostingComment` DROP FOREIGN KEY `PostingComment_postingId_fkey`;

-- DropForeignKey
ALTER TABLE `PostingComment` DROP FOREIGN KEY `PostingComment_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PostingImg` DROP FOREIGN KEY `PostingImg_postingId_fkey`;

-- DropForeignKey
ALTER TABLE `PostingTags` DROP FOREIGN KEY `PostingTags_postingId_fkey`;

-- AddForeignKey
ALTER TABLE `PostingTags` ADD CONSTRAINT `PostingTags_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkdownTag` ADD CONSTRAINT `MarkdownTag_markdownId_fkey` FOREIGN KEY (`markdownId`) REFERENCES `Markdown`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posting` ADD CONSTRAINT `Posting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostingImg` ADD CONSTRAINT `PostingImg_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkdownImg` ADD CONSTRAINT `MarkdownImg_MarkdownId_fkey` FOREIGN KEY (`MarkdownId`) REFERENCES `Markdown`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Markdown` ADD CONSTRAINT `Markdown_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostingComment` ADD CONSTRAINT `PostingComment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostingComment` ADD CONSTRAINT `PostingComment_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `Posting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkdownComment` ADD CONSTRAINT `MarkdownComment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkdownComment` ADD CONSTRAINT `MarkdownComment_markdownId_fkey` FOREIGN KEY (`markdownId`) REFERENCES `Markdown`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBook` ADD CONSTRAINT `GuestBook_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
