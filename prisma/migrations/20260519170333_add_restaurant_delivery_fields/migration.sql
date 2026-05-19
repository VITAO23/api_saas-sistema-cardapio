-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "deliveryArea" JSONB;
ALTER TABLE "Restaurant" ADD COLUMN "deliveryEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "Restaurant" ADD COLUMN "deliveryFee" REAL;
ALTER TABLE "Restaurant" ADD COLUMN "deliveryInfo" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "deliveryRadiusKm" REAL;
ALTER TABLE "Restaurant" ADD COLUMN "deliveryTime" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "openingHours" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "pickupTime" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "status" TEXT;
