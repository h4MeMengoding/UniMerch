const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPendingOrders() {
  try {
    console.log('🔍 Checking pending orders...\n');
    
    // Get all orders with status BELUM_DIBAYAR
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'BELUM_DIBAYAR'
      },
      include: {
        payment: true,
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders found.');
      return;
    }

    console.log(`📋 Found ${pendingOrders.length} pending orders:\n`);

    for (const order of pendingOrders) {
      console.log(`Order #${order.id}`);
      console.log(`  User: ${order.user.name} (${order.user.email})`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Total: Rp ${order.totalAmount.toLocaleString('id-ID')}`);
      console.log(`  Created: ${order.createdAt.toLocaleDateString('id-ID')}`);
      
      if (order.payment) {
        console.log(`  Payment Status: ${order.payment.status}`);
        console.log(`  Xendit Invoice ID: ${order.payment.xenditInvoiceId}`);
        console.log(`  Payment URL: ${order.payment.paymentUrl ? 'Available' : 'Not available'}`);
      } else {
        console.log(`  ❌ No payment record found!`);
      }
      
      console.log(`  Items:`);
      for (const item of order.items) {
        console.log(`    - ${item.product.name} x${item.quantity} @ Rp ${item.price.toLocaleString('id-ID')}`);
      }
      console.log('');
    }

    console.log(`\n💡 To refresh payment status for an order, call:`);
    console.log(`POST /api/orders/check-payment`);
    console.log(`Body: { "orderId": ORDER_ID }`);

  } catch (error) {
    console.error('❌ Error checking pending orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingOrders();