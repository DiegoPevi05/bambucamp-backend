// prisma/init/resetAdmin.ts
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@bambucamp.com';
  const password = process.env.ADMIN_PASSWORD ?? 'password';
  const firstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME ?? '';
  const phoneNumber = process.env.ADMIN_PHONE ?? '000-000-000';

  console.log('🔐 Resetting ADMIN user...');
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1) Delete all admins
  const del = await prisma.user.deleteMany({
    where: { role: 'ADMIN' },
  });
  console.log(`🧹 Deleted ${del.count} ADMIN user(s).`);

  // 2) Create the new admin
  await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      isDisabled: false,
      emailVerified: true,
      createdAt: new Date(),
      role: 'ADMIN',
    },
  });

  console.log(`✅ New ADMIN created: ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to reset ADMIN:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
