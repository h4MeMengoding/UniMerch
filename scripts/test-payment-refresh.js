const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRefreshPaymentStatus() {
  try {
    console.log('🧪 Testing Payment Status Refresh...\n');
    
    // Find a pending order
    const pendingOrder = await prisma.order.findFirst({
      where: {
        status: 'BELUM_DIBAYAR'
      },
      include: {
        payment: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (!pendingOrder) {
      console.log('❌ No pending orders found to test');
      return;
    }

    console.log(`📋 Testing with Order #${pendingOrder.id}`);
    console.log(`  User: ${pendingOrder.user.name} (${pendingOrder.user.email})`);
    console.log(`  Current Status: ${pendingOrder.status}`);
    console.log(`  Payment Status: ${pendingOrder.payment?.status || 'No payment'}`);
    console.log(`  Xendit Invoice ID: ${pendingOrder.payment?.xenditInvoiceId}\n`);

    // Simulate API call to check payment status
    console.log('🔄 Simulating payment status check...');
    
    // For testing purposes, let's manually update the status
    // In real scenario, this would be done via the API endpoint
    const updatedPayment = await prisma.payment.update({
      where: { id: pendingOrder.payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    const updatedOrder = await prisma.order.update({
      where: { id: pendingOrder.id },
      data: {
        status: 'DIBAYAR',
      },
    });

    console.log('✅ Status updated successfully!');
    console.log(`  Payment Status: ${pendingOrder.payment?.status} → ${updatedPayment.status}`);
    console.log(`  Order Status: ${pendingOrder.status} → ${updatedOrder.status}`);
    console.log(`  Paid At: ${updatedPayment.paidAt}`);

    console.log('\n💡 Test completed! Check the user dashboard to see the updated status.');
    console.log('🔄 To revert for another test, run: node scripts/revert-test-payment.js');

  } catch (error) {
    console.error('❌ Error testing payment refresh:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRefreshPaymentStatus();