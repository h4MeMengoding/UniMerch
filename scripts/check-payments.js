const { PrismaClient } = require('@prisma/client');

async function checkPaymentDetails() {
  const prisma = new PrismaClient();
  
  try {
    // Get all payments with order details
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('=== PAYMENT DETAILS ===');
    if (payments.length === 0) {
      console.log('No payments found in database');
    } else {
      payments.forEach(payment => {
        console.log(`\n--- Payment ID: ${payment.id} ---`);
        console.log(`Order ID: ${payment.orderId}`);
        console.log(`Xendit Invoice ID: ${payment.xenditInvoiceId}`);
        console.log(`Payment Status: ${payment.status}`);
        console.log(`Amount: Rp ${payment.amount.toLocaleString('id-ID')}`);
        console.log(`Payment URL: ${payment.paymentUrl || 'N/A'}`);
        console.log(`Paid At: ${payment.paidAt || 'Not paid yet'}`);
        console.log(`Created: ${payment.createdAt}`);
        console.log(`Order Status: ${payment.order.status}`);
        console.log(`User: ${payment.order.user.name} (${payment.order.user.email})`);
        console.log(`Items: ${payment.order.items.length} item(s)`);
        payment.order.items.forEach(item => {
          console.log(`  - ${item.product.name} x${item.quantity} @ ${item.price}`);
        });
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentDetails();