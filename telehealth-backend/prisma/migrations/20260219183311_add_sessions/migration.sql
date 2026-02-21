-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('TEXT', 'VOICE', 'VIDEO', 'IN_PERSON');

-- CreateTable
CREATE TABLE "Session" (
    "session_id" SERIAL NOT NULL,
    "anon_id" TEXT NOT NULL,
    "counsellor_id" INTEGER,
    "session_type" "SessionType" NOT NULL DEFAULT 'TEXT',
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "is_priority" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
