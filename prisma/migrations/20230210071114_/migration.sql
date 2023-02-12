-- AddForeignKey
ALTER TABLE `Posting` ADD CONSTRAINT `Posting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
