/*
  Warnings:

  - You are about to drop the column `hasValidSubmission` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `isTop3` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `ControlPair` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ControlPairCandidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Jury` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ControlPair` DROP FOREIGN KEY `ControlPair_idTeamA_fkey`;

-- DropForeignKey
ALTER TABLE `ControlPair` DROP FOREIGN KEY `ControlPair_idTeamB_fkey`;

-- DropForeignKey
ALTER TABLE `ControlPairCandidate` DROP FOREIGN KEY `ControlPairCandidate_idTeamA_fkey`;

-- DropForeignKey
ALTER TABLE `ControlPairCandidate` DROP FOREIGN KEY `ControlPairCandidate_idTeamB_fkey`;

-- DropForeignKey
ALTER TABLE `Evaluation` DROP FOREIGN KEY `Evaluation_assignedJuryId_fkey`;

-- DropForeignKey
ALTER TABLE `Evaluation` DROP FOREIGN KEY `Evaluation_assignedTeamId_fkey`;

-- DropForeignKey
ALTER TABLE `Evaluation` DROP FOREIGN KEY `Evaluation_assignedTeamMemberId_fkey`;

-- DropForeignKey
ALTER TABLE `Evaluation` DROP FOREIGN KEY `Evaluation_idTeamA_fkey`;

-- DropForeignKey
ALTER TABLE `Evaluation` DROP FOREIGN KEY `Evaluation_idTeamB_fkey`;

-- AlterTable
ALTER TABLE `Team` DROP COLUMN `hasValidSubmission`,
    DROP COLUMN `isTop3`;

-- DropTable
DROP TABLE `ControlPair`;

-- DropTable
DROP TABLE `ControlPairCandidate`;

-- DropTable
DROP TABLE `Evaluation`;

-- DropTable
DROP TABLE `Jury`;
