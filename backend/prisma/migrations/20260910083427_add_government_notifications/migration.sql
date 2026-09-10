-- CreateTable
CREATE TABLE "GovernmentNotification" (
    "id" TEXT NOT NULL,
    "governmentId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GovernmentNotification_governmentId_idx" ON "GovernmentNotification"("governmentId");

-- CreateIndex
CREATE INDEX "GovernmentNotification_reportId_idx" ON "GovernmentNotification"("reportId");

-- CreateIndex
CREATE INDEX "GovernmentNotification_governmentId_isRead_idx" ON "GovernmentNotification"("governmentId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentNotification_governmentId_reportId_type_key" ON "GovernmentNotification"("governmentId", "reportId", "type");
