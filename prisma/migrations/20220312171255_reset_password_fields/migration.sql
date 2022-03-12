-- AlterTable
ALTER TABLE `Team` ADD COLUMN `resetPasswordConsentToken` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TeamMember` ADD COLUMN `isResetPasswordAuthor` BOOLEAN NOT NULL DEFAULT false;
