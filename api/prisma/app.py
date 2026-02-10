import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de base de datos...');

    // 1. Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@lacanasta.com' },
        update: {},
        create: {
            email: 'admin@lacanasta.com',
            password: hashedPassword,
            name: 'Administrador',
            role: 'ADMIN',
            permissions: 'POS,INVENTORY,CUSTOMERS,USERS,SETTINGS'
        }
    });
    console.log('✅ Usuario admin creado:', admin.email);

    // 2. Crear sucursal principal
    const branch = await prisma.branch.create({
        data: {
            name: 'Sucursal Principal',
            address: 'Av. Principal 123, Centro',
            phone: '555-0000'
        }
    });
    console.log('✅ Sucursal creada:', branch.name);

    // 3. Crear categorías de ejemplo
    const cat1 = await prisma.category.create({
        data: { name: 'Abarrotes' }
    });
    const cat2 = await prisma.category.create({
        data: { name: 'Lácteos' }
    });
    const cat3 = await prisma.category.create({
        data: { name: 'Bebidas' }
    });
    console.log('✅ Categorías creadas: 3');

    // 4. Crear productos de ejemplo
    await prisma.product.create({
        data: {
            code: 'PROD001',
            name: 'Arroz 1kg',
            categoryId: cat1.id,
            unit: 'KG',
            priceRetail: '25.00',
            priceWholesale: '20.00',
            inventory: {
                create: {
                    branchId: branch.id,
                    quantity: '100'
                }
            }
        }
    });
    await prisma.product.create({
        data: {
            code: 'PROD002',
            name: 'Leche 1L',
            categoryId: cat2.id,
            unit: 'L',
            priceRetail: '26.00',
            priceWholesale: '22.00',
            inventory: {
                create: {
                    branchId: branch.id,
                    quantity: '50'
                }
            }
        }
    });
    await prisma.product.create({
        data: {
            code: 'PROD003',
            name: 'Coca-Cola 600ml',
            categoryId: cat3.id,
            unit: 'PZA',
            priceRetail: '15.00',
            priceWholesale: '13.00',
            inventory: {
                create: {
                    branchId: branch.id,
                    quantity: '200'
                }
            }
        }
    });
    console.log('✅ Productos creados: 3');

    // 5. Configuración del sistema
    await prisma.systemSetting.create({
        data: { key: 'businessName', value: 'LA CANASTA' }
    });
    await prisma.systemSetting.create({
        data: { key: 'rfc', value: 'XAXX010101000' }
    });
    await prisma.systemSetting.create({
        data: { key: 'address', value: 'Av. Principal 123, Centro' }
    });
    console.log('✅ Configuración del sistema creada');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: admin@lacanasta.com');
    console.log('   Password: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
