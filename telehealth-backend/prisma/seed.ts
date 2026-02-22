import 'dotenv/config';
import { PrismaClient, Role, RoleType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// 1. Setup the Driver Adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Initialize Prisma with the adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  /**
   * ADMIN
   */
const admin = await prisma.user.upsert({
  where: { identifier: 'ADMIN/01' },
  update: {},
  create: {
    identifier: 'ADMIN/01',
    password_hash: passwordHash,
    role: Role.ADMIN,
    first_login: true,
    account_status: 'ACTIVE',
  },
});

await prisma.staff.upsert({
  where: { user_id: admin.user_id },
  update: {},
  create: {
    user_id: admin.user_id,
    staff_number: 'ADMIN/01',
    role_type: RoleType.ADMIN,
    department: 'IT Services',
    email: 'admin@pau.edu',
  },
});

  /**
   * COUNSELLOR
   */
const counsellor = await prisma.user.upsert({
  where: { identifier: 'STAFF/COUNS/01' },
  update: {},
  create: {
    identifier: 'STAFF/COUNS/01',
    password_hash: passwordHash,
    role: Role.COUNSELLOR,
    first_login: true,
    account_status: 'ACTIVE',
  },
});

await prisma.staff.upsert({
  where: { user_id: counsellor.user_id },
  update: {},
  create: {
    user_id: counsellor.user_id,
    staff_number: 'STAFF/COUNS/01',
    role_type: RoleType.COUNSELLOR,
    department: 'Guidance & Counselling',
    email: 'counsellor@pau.edu',
  },
});

  /**
   * STUDENT
   */
const student = await prisma.user.upsert({
  where: { identifier: 'PAU/CSC/001' },
  update: {},
  create: {
    identifier: 'PAU/CSC/001',
    password_hash: passwordHash,
    role: Role.STUDENT,
    first_login: true,
    account_status: 'ACTIVE',
  },
});

await prisma.student.upsert({
  where: { user_id: student.user_id },
  update: {},
  create: {
    user_id: student.user_id,
    matric_number: 'PAU/CSC/001',
    email: 'student1@pau.edu',
    department: 'Computer Science',
    level: '400',
  },
});
console.log('✅ Seed completed successfully!');
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end(); // 🔹 close pg pool
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    await pool.end(); // 🔹 close pg pool on error
    process.exit(1);
  });
