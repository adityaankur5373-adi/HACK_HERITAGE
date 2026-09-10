-- CreateTable
CREATE TABLE "GovernmentReportAssignment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "governmentId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "note" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "GovernmentReportAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentReportAssignment_reportId_key" ON "GovernmentReportAssignment"("reportId");

-- CreateIndex
CREATE INDEX "GovernmentReportAssignment_governmentId_idx" ON "GovernmentReportAssignment"("governmentId");

-- CreateIndex
CREATE INDEX "GovernmentReportAssignment_department_idx" ON "GovernmentReportAssignment"("department");

-- CreateIndex
CREATE INDEX "GovernmentReportAssignment_status_idx" ON "GovernmentReportAssignment"("status");

-- AddForeignKey
ALTER TABLE "GovernmentReportAssignment" ADD CONSTRAINT "GovernmentReportAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentReportAssignment" ADD CONSTRAINT "GovernmentReportAssignment_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;
