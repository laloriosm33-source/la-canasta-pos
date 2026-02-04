
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Admin User...");

    const email = 'laloriosm33@gmail.com'; // Updated administrator email
    const password = 'LaCanasta1234'; // Updated administrator password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            permissions: 'POS,INVENTORY,CUSTOMERS,SETTINGS,USERS',
            name: 'Eduardo Marin'
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Eduardo Marin',
            role: 'ADMIN',
            permissions: 'POS,INVENTORY,CUSTOMERS,SETTINGS,USERS'
        }
    });

    console.log(`✅ Admin User Configured: ${admin.name} (${admin.email})`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
