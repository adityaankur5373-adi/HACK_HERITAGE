ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'INDUSTRY';

CREATE TABLE "Industry" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "email" TEXT NOT NULL,
    "name" TEXT NOT NULL, "registrationNumber" TEXT NOT NULL, "description" TEXT,
    "address" TEXT, "area" TEXT, "city" TEXT, "district" TEXT, "state" TEXT,
    "pincode" TEXT, "phone" TEXT, "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IndustryCapability" (
    "id" TEXT NOT NULL, "industryId" TEXT NOT NULL, "type" TEXT NOT NULL, "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IndustryCapability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IndustryRecommendation" (
    "id" TEXT NOT NULL, "reportId" TEXT NOT NULL, "industryId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL, "reason" TEXT, "status" TEXT NOT NULL DEFAULT 'RECOMMENDED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IndustryRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IndustryCollaborationInvitation" (
    "id" TEXT NOT NULL, "reportId" TEXT NOT NULL, "industryId" TEXT NOT NULL,
    "invitedByGovernmentId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'INVITED', "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "respondedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IndustryCollaborationInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IndustryContribution" (
    "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "industryId" TEXT NOT NULL,
    "type" TEXT NOT NULL, "description" TEXT NOT NULL, "estimatedCost" TEXT, "timeline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "IndustryContribution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Industry_userId_key" ON "Industry"("userId");
CREATE UNIQUE INDEX "Industry_email_key" ON "Industry"("email");
CREATE UNIQUE INDEX "Industry_registrationNumber_key" ON "Industry"("registrationNumber");
CREATE UNIQUE INDEX "IndustryCapability_industryId_type_value_key" ON "IndustryCapability"("industryId", "type", "value");
CREATE INDEX "IndustryCapability_industryId_idx" ON "IndustryCapability"("industryId");
CREATE UNIQUE INDEX "IndustryRecommendation_reportId_industryId_key" ON "IndustryRecommendation"("reportId", "industryId");
CREATE INDEX "IndustryRecommendation_reportId_idx" ON "IndustryRecommendation"("reportId");
CREATE UNIQUE INDEX "IndustryCollaborationInvitation_reportId_industryId_key" ON "IndustryCollaborationInvitation"("reportId", "industryId");
CREATE INDEX "IndustryCollaborationInvitation_industryId_status_idx" ON "IndustryCollaborationInvitation"("industryId", "status");
CREATE INDEX "IndustryContribution_industryId_idx" ON "IndustryContribution"("industryId");

ALTER TABLE "Industry" ADD CONSTRAINT "Industry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryCapability" ADD CONSTRAINT "IndustryCapability_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryRecommendation" ADD CONSTRAINT "IndustryRecommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryRecommendation" ADD CONSTRAINT "IndustryRecommendation_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryCollaborationInvitation" ADD CONSTRAINT "IndustryCollaborationInvitation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryCollaborationInvitation" ADD CONSTRAINT "IndustryCollaborationInvitation_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryCollaborationInvitation" ADD CONSTRAINT "IndustryCollaborationInvitation_invitedByGovernmentId_fkey" FOREIGN KEY ("invitedByGovernmentId") REFERENCES "Government"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndustryContribution" ADD CONSTRAINT "IndustryContribution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "UniversityProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryContribution" ADD CONSTRAINT "IndustryContribution_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
