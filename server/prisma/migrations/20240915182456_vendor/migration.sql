-- CreateEnum
CREATE TYPE "VendorSkill" AS ENUM ('ELECTRONICS_SERVICE', 'HOME_CLEANING', 'BATHROOM_CLEANING', 'PLUMBING', 'ELECTRICAL_WORK', 'CARPENTRY', 'PAINTING', 'GARDENING', 'APPLIANCE_REPAIR', 'PEST_CONTROL');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePicture" TEXT,
    "address" TEXT NOT NULL,
    "skills" "VendorSkill"[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAssigned" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAssigned_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAssigned_bookingId_key" ON "ServiceAssigned"("bookingId");

-- AddForeignKey
ALTER TABLE "ServiceAssigned" ADD CONSTRAINT "ServiceAssigned_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssigned" ADD CONSTRAINT "ServiceAssigned_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
