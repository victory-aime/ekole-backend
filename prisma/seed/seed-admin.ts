import { prisma } from './client';
import { getAuthInstance } from '../../src/lib/auth';

const auth = getAuthInstance();

async function main() {
  console.log('🌱 Seeding database...');

  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingUser) {
    console.log('✅ Default admin user already exists!');
  }

  await auth.api.signUpEmail({
    body: {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'V1ct0r!!A@dm!!n',
    },
  });

  console.log('✅ Default admin user created');
}

main();
