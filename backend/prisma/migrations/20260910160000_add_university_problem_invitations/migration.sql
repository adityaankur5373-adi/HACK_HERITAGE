-- CreateTable
CREATE TABLE "UniversityProblemInvitation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "invitedByGovernmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UniversityProblemInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityNotification" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UniversityNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UniversityProblemInvitation_reportId_universityId_key" ON "UniversityProblemInvitation"("reportId", "universityId");
CREATE INDEX "UniversityProblemInvitation_universityId_status_idx" ON "UniversityProblemInvitation"("universityId", "status");
CREATE INDEX "UniversityProblemInvitation_reportId_idx" ON "UniversityProblemInvitation"("reportId");
CREATE INDEX "UniversityProblemInvitation_invitedByGovernmentId_idx" ON "UniversityProblemInvitation"("invitedByGovernmentId");
CREATE UNIQUE INDEX "UniversityNotification_universityId_reportId_type_key" ON "UniversityNotification"("universityId", "reportId", "type");
CREATE INDEX "UniversityNotification_universityId_isRead_idx" ON "UniversityNotification"("universityId", "isRead");
CREATE INDEX "UniversityNotification_reportId_idx" ON "UniversityNotification"("reportId");

ALTER TABLE "UniversityProblemInvitation" ADD CONSTRAINT "UniversityProblemInvitation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UniversityProblemInvitation" ADD CONSTRAINT "UniversityProblemInvitation_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UniversityProblemInvitation" ADD CONSTRAINT "UniversityProblemInvitation_invitedByGovernmentId_fkey" FOREIGN KEY ("invitedByGovernmentId") REFERENCES "Government"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UniversityNotification" ADD CONSTRAINT "UniversityNotification_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UniversityNotification" ADD CONSTRAINT "UniversityNotification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
