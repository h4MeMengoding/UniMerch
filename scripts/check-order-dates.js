const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrderDates() {
  try {
    console.log('🗓️ Checking order dates...\n');
    
    // Get all orders with dates
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📊 Order Dates:');
    console.log('='.repeat(60));
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.id}`);
      console.log(`   Created At (Raw): ${order.createdAt}`);
      console.log(`   Created At (ISO): ${order.createdAt.toISOString()}`);
      
      // Test different formatting approaches
      const date = new Date(order.createdAt);
      console.log(`   JS Date Object: ${date}`);
      console.log(`   toLocaleDateString: ${date.toLocaleDateString('id-ID')}`);
      console.log(`   with options: ${date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta'
      })}`);
      console.log(`   Status: ${order.status}`);
      console.log('-'.repeat(50));
    });

    // Check timezone info
    console.log('\n🌍 Timezone Info:');
    console.log(`Current Date: ${new Date()}`);
    console.log(`Current Date (Jakarta): ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    console.log(`Current Date (UTC): ${new Date().toISOString()}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkOrderDates();