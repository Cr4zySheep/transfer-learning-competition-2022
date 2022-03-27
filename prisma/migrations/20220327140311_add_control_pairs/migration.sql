-- CreateTable
CREATE TABLE `ControlPairCandidate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `idTeamA` INTEGER NOT NULL,
    `idTeamB` INTEGER NOT NULL,
    `evaluationCriteria` ENUM('CRITERIA_0', 'CRITERIA_1', 'CRITERIA_2', 'ALL') NOT NULL,
    `nicolasChoice` BOOLEAN NULL,
    `julesChoice` BOOLEAN NULL,
    `version` INTEGER NOT NULL,
    `nicolasGoodCandidate` BOOLEAN NOT NULL,
    `julesGoodCandidate` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ControlPair` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `idTeamA` INTEGER NOT NULL,
    `idTeamB` INTEGER NOT NULL,
    `evaluationCriteria` ENUM('CRITERIA_0', 'CRITERIA_1', 'CRITERIA_2', 'ALL') NOT NULL,
    `criteria` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ControlPairCandidate` ADD CONSTRAINT `ControlPairCandidate_idTeamA_fkey` FOREIGN KEY (`idTeamA`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlPairCandidate` ADD CONSTRAINT `ControlPairCandidate_idTeamB_fkey` FOREIGN KEY (`idTeamB`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlPair` ADD CONSTRAINT `ControlPair_idTeamA_fkey` FOREIGN KEY (`idTeamA`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlPair` ADD CONSTRAINT `ControlPair_idTeamB_fkey` FOREIGN KEY (`idTeamB`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
