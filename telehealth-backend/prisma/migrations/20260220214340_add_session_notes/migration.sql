-- CreateTable
CREATE TABLE "SessionNote" (
    "note_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "counsellor_id" INTEGER NOT NULL,
    "note_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionNote_pkey" PRIMARY KEY ("note_id")
);

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
