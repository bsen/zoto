/*
  Warnings:

  - A unique constraint covering the columns `[aadhaarNumber]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[panNumber]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aadhaarNumber` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNumber` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "aadhaarNumber" TEXT NOT NULL,
ADD COLUMN     "panNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_aadhaarNumber_key" ON "Vendor"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_panNumber_key" ON "Vendor"("panNumber");
