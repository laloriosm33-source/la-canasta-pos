const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@lacanasta.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log('Admin user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      permissions: 'POS,INVENTORY,CUSTOMERS,USERS,SETTINGS',
    },
  });

  console.log('✅ Admin user created: admin@lacanasta.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
