-- CreateTable
CREATE TABLE `Evaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'DONE') NOT NULL DEFAULT 'PENDING',
    `idTeamA` INTEGER NOT NULL,
    `idTeamB` INTEGER NOT NULL,
    `assignedTeamId` INTEGER NULL,
    `assignedTeamMemberId` INTEGER NULL,
    `assignedJuryId` INTEGER NULL,
    `evaluationCriteria` ENUM('CRITERIA_0', 'CRITERIA_1', 'CRITERIA_2', 'ALL') NOT NULL,
    `criteria0` BOOLEAN NULL,
    `criteria1` BOOLEAN NULL,
    `criteria2` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_idTeamA_fkey` FOREIGN KEY (`idTeamA`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_idTeamB_fkey` FOREIGN KEY (`idTeamB`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_assignedTeamId_fkey` FOREIGN KEY (`assignedTeamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_assignedTeamMemberId_fkey` FOREIGN KEY (`assignedTeamMemberId`) REFERENCES `TeamMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_assignedJuryId_fkey` FOREIGN KEY (`assignedJuryId`) REFERENCES `Jury`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
