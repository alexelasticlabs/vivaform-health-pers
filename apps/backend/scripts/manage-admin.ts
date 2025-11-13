/**
 * CLI для управления администраторами
 *
 * Использование:
 *   pnpm admin create <email> <password> [name]
 *   pnpm admin promote <email>
 *   pnpm admin demote <email>
 *   pnpm admin reset-password <email> <new-password>
 *   pnpm admin:list
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function createAdmin(email: string, password: string, name?: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.error(`❌ Пользователь с email ${email} уже существует`);
      console.log(`💡 Используйте команду 'promote' для повышения существующего пользователя`);
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
        name: name || 'Admin',
        emailVerified: true
      }
    });

    console.log(`✅ Администратор создан успешно:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
  } catch (error) {
    console.error(`❌ Ошибка создания администратора:`, error);
    process.exit(1);
  }
}

async function promoteToAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`ℹ️  Пользователь ${email} уже является администратором`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });

    console.log(`✅ Пользователь ${email} повышен до роли ADMIN`);
  } catch (error) {
    console.error(`❌ Ошибка повышения пользователя:`, error);
    process.exit(1);
  }
}

async function demoteAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`);
      process.exit(1);
    }

    if (user.role !== 'ADMIN') {
      console.log(`ℹ️  Пользователь ${email} не является администратором`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'USER' }
    });

    console.log(`✅ Администратор ${email} понижен до роли USER`);
  } catch (error) {
    console.error(`❌ Ошибка понижения администратора:`, error);
    process.exit(1);
  }
}

async function resetPassword(email: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`);
      process.exit(1);
    }

    const passwordHash = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    });

    console.log(`✅ Пароль для ${email} успешно изменён`);
  } catch (error) {
    console.error(`❌ Ошибка сброса пароля:`, error);
    process.exit(1);
  }
}

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (admins.length === 0) {
      console.log(`ℹ️  Администраторы не найдены`);
      return;
    }

    console.log(`\n📋 Список администраторов (${admins.length}):\n`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.name || '(не указано)'}`);
      console.log(`   Email Verified: ${admin.emailVerified ? '✅' : '❌'}`);
      console.log(`   Created: ${admin.createdAt.toLocaleString()}`);
      console.log('');
    });
  } catch (error) {
    console.error(`❌ Ошибка получения списка:`, error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
🔧 Управление администраторами VivaForm

Использование:
  pnpm tsx scripts/manage-admin.ts <command> [args]

Команды:
  create <email> <password> [name]   Создать нового администратора
  promote <email>                     Повысить существующего пользователя до админа
  demote <email>                      Понизить администратора до обычного пользователя
  reset-password <email> <password>  Сбросить пароль пользователя
  list                                Показать всех администраторов

Примеры:
  pnpm tsx scripts/manage-admin.ts create admin@example.com MyPass123! "Super Admin"
  pnpm tsx scripts/manage-admin.ts promote user@example.com
  pnpm tsx scripts/manage-admin.ts list
    `);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'create':
        if (args.length < 3) {
          console.error('❌ Использование: create <email> <password> [name]');
          process.exit(1);
        }
        await createAdmin(args[1], args[2], args[3]);
        break;

      case 'promote':
        if (args.length < 2) {
          console.error('❌ Использование: promote <email>');
          process.exit(1);
        }
        await promoteToAdmin(args[1]);
        break;

      case 'demote':
        if (args.length < 2) {
          console.error('❌ Использование: demote <email>');
          process.exit(1);
        }
        await demoteAdmin(args[1]);
        break;

      case 'reset-password':
        if (args.length < 3) {
          console.error('❌ Использование: reset-password <email> <new-password>');
          process.exit(1);
        }
        await resetPassword(args[1], args[2]);
        break;

      case 'list':
        await listAdmins();
        break;

      default:
        console.error(`❌ Неизвестная команда: ${command}`);
        console.log('💡 Запустите без аргументов для справки');
        process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

