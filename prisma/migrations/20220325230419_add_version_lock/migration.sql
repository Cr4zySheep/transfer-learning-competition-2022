/*
  Warnings:

  - Added the required column `version` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Evaluation` ADD COLUMN `version` INTEGER NOT NULL;
