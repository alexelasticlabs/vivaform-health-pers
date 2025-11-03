#!/usr/bin/env node

/**
 * Health Check Script
 * Проверяет состояние проекта: компиляция, тесты, миграции
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function run(command, cwd) {
  try {
    execSync(command, { cwd, stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(title, 'blue');
  log('='.repeat(60), 'blue');
}

async function main() {
  const root = path.resolve(__dirname);
  const backend = path.join(root, 'apps', 'backend');
  const web = path.join(root, 'apps', 'web');

  log('\n🏥 VivaForm Health Check', 'green');
  log('========================\n', 'green');

  // 1. Check TypeScript compilation
  checkSection('📝 TypeScript Compilation');
  
  log('Checking backend...', 'yellow');
  const backendTsc = run('npx tsc --noEmit', backend);
  log(backendTsc ? '✅ Backend TypeScript OK' : '❌ Backend TypeScript FAILED', backendTsc ? 'green' : 'red');

  log('Checking web...', 'yellow');
  const webTsc = run('npx tsc --noEmit', web);
  log(webTsc ? '✅ Web TypeScript OK' : '❌ Web TypeScript FAILED', webTsc ? 'green' : 'red');

  // 2. Check migrations
  checkSection('🗄️  Database Migrations');
  log('Checking migration status...', 'yellow');
  const migrations = run('npx prisma migrate status', backend);
  log(migrations ? '✅ Migrations up to date' : '⚠️  Migrations need attention', migrations ? 'green' : 'yellow');

  // 3. Run tests
  checkSection('🧪 Tests');
  
  log('Running backend tests...', 'yellow');
  const backendTests = run('pnpm vitest --run', backend);
  log(backendTests ? '✅ Backend tests passed' : '❌ Backend tests FAILED', backendTests ? 'green' : 'red');

  log('Running web tests...', 'yellow');
  const webTests = run('pnpm vitest --run', web);
  log(webTests ? '✅ Web tests passed' : '❌ Web tests FAILED', webTests ? 'green' : 'red');

  // 4. Build check
  checkSection('🏗️  Build');
  log('Running turbo build...', 'yellow');
  const build = run('pnpm build', root);
  log(build ? '✅ Build successful' : '❌ Build FAILED', build ? 'green' : 'red');

  // Summary
  checkSection('📊 Summary');
  const checks = [
    { name: 'Backend TypeScript', status: backendTsc },
    { name: 'Web TypeScript', status: webTsc },
    { name: 'Database Migrations', status: migrations },
    { name: 'Backend Tests', status: backendTests },
    { name: 'Web Tests', status: webTests },
    { name: 'Build', status: build }
  ];

  const passed = checks.filter(c => c.status).length;
  const total = checks.length;

  log(`\nPassed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    const color = check.status ? 'green' : 'red';
    log(`  ${icon} ${check.name}`, color);
  });

  if (passed === total) {
    log('\n🎉 All checks passed! Project is healthy.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some checks failed. Please review above.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Health check failed: ${error.message}`, 'red');
  process.exit(1);
});
