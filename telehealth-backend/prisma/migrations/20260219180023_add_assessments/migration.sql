-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateTable
CREATE TABLE "Assessment" (
    "assessment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assessment_type" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("assessment_id")
);

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
