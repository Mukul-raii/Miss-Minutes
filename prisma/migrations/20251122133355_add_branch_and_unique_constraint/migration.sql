/*
  Warnings:

  - A unique constraint covering the columns `[projectId,commitId,branch,filePath]` on the table `ActivityLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "branch" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_projectId_commitId_branch_filePath_key" ON "ActivityLog"("projectId", "commitId", "branch", "filePath");
