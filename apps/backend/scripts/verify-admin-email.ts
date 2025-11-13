import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdmin() {
  await prisma.user.update({
    where: { email: 'admin@vivaform.com' },
    data: { emailVerified: true }
  });
  console.log('✅ Email verified for admin@vivaform.com');
}

verifyAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

