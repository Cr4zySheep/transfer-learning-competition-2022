-- AlterTable
ALTER TABLE `TeamMember` ADD COLUMN `emailValidated` DATETIME(3) NULL,
    ADD COLUMN `emailValidationToken` VARCHAR(191) NULL;
