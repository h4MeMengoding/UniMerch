const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database...\n');

    // Delete in proper order to respect foreign key constraints
    console.log('Deleting payments...');
    await prisma.payment.deleteMany({});
    
    console.log('Deleting order items...');
    await prisma.orderItem.deleteMany({});
    
    console.log('Deleting orders...');
    await prisma.order.deleteMany({});
    
    console.log('Deleting variant options...');
    await prisma.variantOption.deleteMany({});
    
    console.log('Deleting product variants...');
    await prisma.productVariant.deleteMany({});
    
    console.log('Deleting variant types...');
    await prisma.variantType.deleteMany({});
    
    console.log('Deleting products...');
    await prisma.product.deleteMany({});
    
    console.log('Deleting categories...');
    await prisma.category.deleteMany({});
    
    console.log('Deleting users (except keep admin if any)...');
    // Keep admin user, delete others
    await prisma.user.deleteMany({
      where: {
        role: 'USER'
      }
    });

    console.log('✅ Database cleared successfully!\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

clearDatabase();