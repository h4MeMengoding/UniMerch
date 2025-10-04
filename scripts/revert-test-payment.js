const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function revertTestPayment() {
  try {
    console.log('🔄 Reverting test payment status...\n');
    
    // Find a paid order to revert
    const paidOrder = await prisma.order.findFirst({
      where: {
        status: 'DIBAYAR'
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

    if (!paidOrder) {
      console.log('❌ No paid orders found to revert');
      return;
    }

    console.log(`📋 Reverting Order #${paidOrder.id}`);
    console.log(`  User: ${paidOrder.user.name} (${paidOrder.user.email})`);
    console.log(`  Current Status: ${paidOrder.status}`);
    console.log(`  Payment Status: ${paidOrder.payment?.status || 'No payment'}\n`);

    // Revert to pending status
    const revertedPayment = await prisma.payment.update({
      where: { id: paidOrder.payment.id },
      data: {
        status: 'PENDING',
        paidAt: null,
      },
    });

    const revertedOrder = await prisma.order.update({
      where: { id: paidOrder.id },
      data: {
        status: 'BELUM_DIBAYAR',
      },
    });

    console.log('✅ Status reverted successfully!');
    console.log(`  Payment Status: ${paidOrder.payment?.status} → ${revertedPayment.status}`);
    console.log(`  Order Status: ${paidOrder.status} → ${revertedOrder.status}`);
    console.log(`  Paid At: ${paidOrder.payment?.paidAt} → ${revertedPayment.paidAt}`);

    console.log('\n💡 Revert completed! Order is now back to pending status.');
    console.log('🧪 You can now test the refresh functionality again.');

  } catch (error) {
    console.error('❌ Error reverting payment status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

revertTestPayment();