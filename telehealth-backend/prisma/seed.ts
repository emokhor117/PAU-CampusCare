import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      {
        identifier: 'PAU/CSC/001',
        password_hash: hash,
        role: Role.STUDENT,
      },
      {
        identifier: 'STAFF/COUNS/01',
        password_hash: hash,
        role: Role.COUNSELLOR,
      },
      {
        identifier: 'ADMIN/01',
        password_hash: hash,
        role: Role.ADMIN,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded users successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
