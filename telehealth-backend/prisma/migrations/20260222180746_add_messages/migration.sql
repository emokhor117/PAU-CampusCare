-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('STUDENT', 'COUNSELLOR');

-- CreateTable
CREATE TABLE "Message" (
    "message_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "message_content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;
