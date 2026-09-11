-- CreateTable
CREATE TABLE "UniversityCapability" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityRecommendation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECOMMENDED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UniversityCapability_universityId_idx" ON "UniversityCapability"("universityId");

-- CreateIndex
CREATE INDEX "UniversityCapability_type_idx" ON "UniversityCapability"("type");

-- CreateIndex
CREATE INDEX "UniversityCapability_value_idx" ON "UniversityCapability"("value");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityCapability_universityId_type_value_key" ON "UniversityCapability"("universityId", "type", "value");

-- CreateIndex
CREATE INDEX "UniversityRecommendation_reportId_idx" ON "UniversityRecommendation"("reportId");

-- CreateIndex
CREATE INDEX "UniversityRecommendation_universityId_idx" ON "UniversityRecommendation"("universityId");

-- CreateIndex
CREATE INDEX "UniversityRecommendation_status_idx" ON "UniversityRecommendation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityRecommendation_reportId_universityId_key" ON "UniversityRecommendation"("reportId", "universityId");

-- AddForeignKey
ALTER TABLE "UniversityCapability" ADD CONSTRAINT "UniversityCapability_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRecommendation" ADD CONSTRAINT "UniversityRecommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRecommendation" ADD CONSTRAINT "UniversityRecommendation_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
