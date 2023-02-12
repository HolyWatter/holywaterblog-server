/*
  Warnings:

  - You are about to drop the column `Posting_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `postingId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `posting_id` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_postingId_fkey`;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `Posting_id`,
    DROP COLUMN `postingId`,
    ADD COLUMN `posting_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_posting_id_fkey` FOREIGN KEY (`posting_id`) REFERENCES `Posting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
