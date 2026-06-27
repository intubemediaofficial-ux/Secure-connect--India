import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@secureconnect.in';

  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin already exists:', adminEmail);
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Default admin created:');
  console.log('  Email: admin@secureconnect.in');
  console.log('  Password: Admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
