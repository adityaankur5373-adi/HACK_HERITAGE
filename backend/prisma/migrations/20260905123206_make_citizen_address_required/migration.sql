/*
  Warnings:

  - Made the column `address` on table `Citizen` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Citizen` required. This step will fail if there are existing NULL values in that column.
  - Made the column `district` on table `Citizen` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Citizen` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pincode` on table `Citizen` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Citizen" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "district" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "pincode" SET NOT NULL;
