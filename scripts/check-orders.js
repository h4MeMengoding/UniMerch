const { PrismaClient } = require('@prisma/client');

async function checkUserOrders() {
  const prisma = new PrismaClient();
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    console.log('=== USERS ===');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });
    
    // Get all orders
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n=== ORDERS ===');
    if (orders.length === 0) {
      console.log('No orders found in database');
    } else {
      orders.forEach(order => {
        console.log(`\nOrder ID: ${order.id}`);
        console.log(`User: ${order.user.name} (${order.user.email})`);
        console.log(`Status: ${order.status}`);
        console.log(`Payment Status: ${order.paymentStatus}`);
        console.log(`Total: ${order.totalAmount}`);
        console.log(`Created: ${order.createdAt}`);
        console.log(`Items: ${order.items.length} item(s)`);
        order.items.forEach(item => {
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

checkUserOrders();