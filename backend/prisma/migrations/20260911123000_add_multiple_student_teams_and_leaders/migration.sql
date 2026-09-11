DROP INDEX IF EXISTS "StudentTeam_projectId_key";
ALTER TABLE "StudentTeamMember" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'MEMBER';

WITH ranked_members AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "teamId" ORDER BY "createdAt", "id") AS rank
  FROM "StudentTeamMember"
)
UPDATE "StudentTeamMember" AS member
SET "role" = 'LEADER'
FROM ranked_members
WHERE member."id" = ranked_members."id" AND ranked_members.rank = 1;

CREATE INDEX "StudentTeam_projectId_idx" ON "StudentTeam"("projectId");
