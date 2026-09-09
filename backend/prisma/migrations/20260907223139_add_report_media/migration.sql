-- CreateTable
CREATE TABLE "ReportSupport" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportSupport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportSupport_reportId_citizenId_key" ON "ReportSupport"("reportId", "citizenId");

-- AddForeignKey
ALTER TABLE "ReportSupport" ADD CONSTRAINT "ReportSupport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSupport" ADD CONSTRAINT "ReportSupport_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
