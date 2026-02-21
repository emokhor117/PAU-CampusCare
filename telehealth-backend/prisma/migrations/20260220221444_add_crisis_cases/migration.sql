-- CreateTable
CREATE TABLE "CrisisCase" (
    "crisis_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "risk_reason" TEXT NOT NULL,
    "action_taken" TEXT NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrisisCase_pkey" PRIMARY KEY ("crisis_id")
);

-- AddForeignKey
ALTER TABLE "CrisisCase" ADD CONSTRAINT "CrisisCase_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
