import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetCredentials() {
    try {
        console.log('🔄 Iniciando reseteo completo del sistema...\n');
        
        // Eliminar todos los datos en orden (respetando las relaciones de claves foráneas)
        console.log('🗑️  Eliminando datos relacionados...');
        
        // Eliminar logs del sistema
        await prisma.systemLog.deleteMany({});
        console.log('   ✓ Logs del sistema eliminados');
        
        // Eliminar movimientos de efectivo
        await prisma.cashMovement.deleteMany({});
        console.log('   ✓ Movimientos de efectivo eliminados');
        
        // Eliminar conteos de efectivo
        await prisma.cashCount.deleteMany({});
        console.log('   ✓ Conteos de efectivo eliminados');
        
        // Eliminar ajustes de inventario
        await prisma.inventoryAdjustment.deleteMany({});
        console.log('   ✓ Ajustes de inventario eliminados');
        
        // Eliminar detalles de ventas
        await prisma.saleDetail.deleteMany({});
        console.log('   ✓ Detalles de ventas eliminados');
        
        // Eliminar pagos de crédito
        await prisma.creditPayment.deleteMany({});
        console.log('   ✓ Pagos de crédito eliminados');
        
        // Eliminar ventas
        await prisma.saleHeader.deleteMany({});
        console.log('   ✓ Ventas eliminadas');
        
        // Eliminar turnos de empleados
        await prisma.employeeShift.deleteMany({});
        console.log('   ✓ Turnos de empleados eliminados');
        
        // Eliminar detalles de transferencias
        await prisma.stockTransferDetail.deleteMany({});
        console.log('   ✓ Detalles de transferencias eliminados');
        
        // Eliminar transferencias
        await prisma.stockTransfer.deleteMany({});
        console.log('   ✓ Transferencias eliminadas');
        
        // Eliminar compras
        await prisma.purchase.deleteMany({});
        console.log('   ✓ Compras eliminadas');
        
        // Eliminar gastos
        await prisma.expense.deleteMany({});
        console.log('   ✓ Gastos eliminados');
        
        // Eliminar inventario por sucursal
        await prisma.productBranch.deleteMany({});
        console.log('   ✓ Inventario por sucursal eliminado');
        
        // Eliminar productos
        await prisma.product.deleteMany({});
        console.log('   ✓ Productos eliminados');
        
        // Eliminar categorías
        await prisma.category.deleteMany({});
        console.log('   ✓ Categorías eliminadas');
        
        // Eliminar clientes
        await prisma.customer.deleteMany({});
        console.log('   ✓ Clientes eliminados');
        
        // Eliminar proveedores
        await prisma.provider.deleteMany({});
        console.log('   ✓ Proveedores eliminados');
        
        // Eliminar usuarios
        const deletedUsers = await prisma.user.deleteMany({});
        console.log(`   ✓ ${deletedUsers.count} usuario(s) eliminado(s)`);
        
        // Eliminar sucursales
        await prisma.branch.deleteMany({});
        console.log('   ✓ Sucursales eliminadas');
        
        // Eliminar configuraciones del sistema
        await prisma.systemSetting.deleteMany({});
        console.log('   ✓ Configuraciones del sistema eliminadas\n');
        
        // Crear nuevo usuario administrador con credenciales por defecto
        const defaultEmail = 'admin@lacanasta.com';
        const defaultPassword = 'admin123';
        const defaultName = 'Administrador';
        
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        const newUser = await prisma.user.create({
            data: {
                email: defaultEmail,
                password: hashedPassword,
                name: defaultName,
                role: 'ADMIN'
            }
        });
        
        console.log('✨ ¡Sistema reseteado exitosamente!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📋 NUEVAS CREDENCIALES DE ACCESO');
        console.log('═══════════════════════════════════════════');
        console.log(`📧 Email:     ${defaultEmail}`);
        console.log(`🔑 Contraseña: ${defaultPassword}`);
        console.log(`👤 Nombre:     ${defaultName}`);
        console.log(`🎯 Rol:        ${newUser.role}`);
        console.log('═══════════════════════════════════════════\n');
        console.log('⚠️  IMPORTANTE: Cambia esta contraseña después de iniciar sesión');
        console.log('🌐 Accede en: http://localhost:5173/login\n');
        
    } catch (error) {
        console.error('❌ Error al resetear el sistema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetCredentials();
