const { PrismaClient } = require('@prisma/client');

async function testUserOrders() {
  const prisma = new PrismaClient();
  
  try {
    // Simulate the API call logic
    const userId = 1; // Demo user ID
    
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variantOptions: {
              include: {
                variant: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('=== API Response Simulation ===');
    console.log('Found orders:', orders.length);
    
    if (orders.length > 0) {
      console.log('\nFirst order details:');
      const firstOrder = orders[0];
      console.log('ID:', firstOrder.id);
      console.log('Status:', firstOrder.status);
      console.log('Total:', firstOrder.totalAmount);
      console.log('Items:', firstOrder.items.length);
      console.log('Payment:', firstOrder.payment ? 'Yes' : 'No');
      if (firstOrder.payment) {
        console.log('Payment Status:', firstOrder.payment.status);
        console.log('Payment URL:', firstOrder.payment.paymentUrl);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserOrders();