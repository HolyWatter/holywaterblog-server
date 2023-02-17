-- CreateTable
CREATE TABLE `MarkdownTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(191) NOT NULL,
    `markdownId` INTEGER NULL,

    UNIQUE INDEX `MarkdownTag_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarkdownImg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `location` VARCHAR(191) NOT NULL,
    `MarkdownId` INTEGER NULL,

    UNIQUE INDEX `MarkdownImg_id_key`(`id`),
    UNIQUE INDEX `MarkdownImg_location_key`(`location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MarkdownTag` ADD CONSTRAINT `MarkdownTag_markdownId_fkey` FOREIGN KEY (`markdownId`) REFERENCES `Markdown`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkdownImg` ADD CONSTRAINT `MarkdownImg_MarkdownId_fkey` FOREIGN KEY (`MarkdownId`) REFERENCES `Markdown`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
