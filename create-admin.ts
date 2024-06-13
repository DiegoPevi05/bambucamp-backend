import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function prompt(question: string): Promise<string> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  return new Promise<string>((resolve) => {
    stdin.resume();
    stdout.write(question + ' ');

    stdin.once('data', function (data) {
      resolve(data.toString().trim());
      stdin.pause();
    });
  });
}

async function main() {
  const email = await prompt('Admin email:');
  const password = await prompt('Admin password:');
  const confirmPassword = await prompt('Confirm password:');

  if (password !== confirmPassword) {
    console.error('Passwords do not match.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: '',
        phoneNumber: '',
        isDisabled: false,
        emailVerified: true,
        createdAt: new Date(),
        role: 'ADMIN',
      },
    });

    console.log(`Admin user created: ${admin.email}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
