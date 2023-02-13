/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `PostingImg` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `PostingImg` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- CreateIndex
CREATE UNIQUE INDEX `PostingImg_id_key` ON `PostingImg`(`id`);
