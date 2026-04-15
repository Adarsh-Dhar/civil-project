-- CreateTable
CREATE TABLE "ProjectTaskTemplate" (
    "id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "accountable" TEXT NOT NULL,
    "consulted" TEXT NOT NULL,
    "informed" TEXT NOT NULL,
    "costCr" DOUBLE PRECISION NOT NULL,
    "timeDays" INTEGER NOT NULL,
    "costWeight" DOUBLE PRECISION NOT NULL,
    "timeWeight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT,
    "sequence" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "accountable" TEXT NOT NULL,
    "consulted" TEXT NOT NULL,
    "informed" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "costCr" DOUBLE PRECISION NOT NULL,
    "timeDays" INTEGER NOT NULL,
    "costWeight" DOUBLE PRECISION NOT NULL,
    "timeWeight" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskProof" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'document',
    "fileUrl" TEXT NOT NULL,
    "note" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,

    CONSTRAINT "TaskProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTaskTemplate_sequence_key" ON "ProjectTaskTemplate"("sequence");

-- CreateIndex
CREATE INDEX "ProjectTask_projectId_stage_idx" ON "ProjectTask"("projectId", "stage");

-- CreateIndex
CREATE INDEX "ProjectTask_projectId_status_idx" ON "ProjectTask"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTask_projectId_sequence_key" ON "ProjectTask"("projectId", "sequence");

-- CreateIndex
CREATE INDEX "TaskProof_projectId_uploadedAt_idx" ON "TaskProof"("projectId", "uploadedAt");

-- CreateIndex
CREATE INDEX "TaskProof_taskId_uploadedAt_idx" ON "TaskProof"("taskId", "uploadedAt");

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProjectTaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProof" ADD CONSTRAINT "TaskProof_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProof" ADD CONSTRAINT "TaskProof_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProof" ADD CONSTRAINT "TaskProof_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
