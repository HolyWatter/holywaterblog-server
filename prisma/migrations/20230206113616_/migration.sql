-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nickname_key`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Posting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `img` VARCHAR(191) NULL,
    `created` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `Posting_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
