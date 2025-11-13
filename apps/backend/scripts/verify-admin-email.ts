import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdmin() {
  const email = process.argv[2] || 'aleks.valmus2001@gmail.com';

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ Пользователь ${email} не найден`);
    process.exit(1);
  }

  if (user.emailVerified) {
    console.log(`ℹ️  Email ${email} уже верифицирован`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true }
  });

  console.log(`✅ Email verified for ${email}`);
}

verifyAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

