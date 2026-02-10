import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('📊 Consultando usuarios en la base de datos...\n');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        
        if (users.length === 0) {
            console.log('⚠️  No hay usuarios registrados en el sistema.');
            console.log('ℹ️  Debes crear el primer usuario administrador desde la pantalla de login.');
        } else {
            console.log(`✅ Se encontraron ${users.length} usuario(s):\n`);
            users.forEach((user, index) => {
                console.log(`${index + 1}. Usuario ID: ${user.id}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   👤 Nombre: ${user.name}`);
                console.log(`   🔑 Rol: ${user.role}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
