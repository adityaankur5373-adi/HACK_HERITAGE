-- AddForeignKey
ALTER TABLE "GovernmentNotification" ADD CONSTRAINT "GovernmentNotification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
