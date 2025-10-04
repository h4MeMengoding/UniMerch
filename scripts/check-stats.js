const { PrismaClient } = require('@prisma/client');

async function checkStats() {
  const prisma = new PrismaClient();
  
  try {
    const orders = await prisma.order.findMany({
      where: { userId: 1 } // Demo user
    });
    
    console.log('=== DASHBOARD STATISTICS ===');
    console.log('Total Orders:', orders.length);
    
    const sedangDiproses = orders.filter(order => 
      order.status === 'BELUM_DIBAYAR' || 
      order.status === 'DIBAYAR'
    ).length;
    console.log('Sedang Diproses:', sedangDiproses);
    
    const selesai = orders.filter(order => 
      order.status === 'SUDAH_DIAMBIL' || 
      order.status === 'SELESAI'
    ).length;
    console.log('Selesai:', selesai);
    
    const totalBelanja = orders
      .filter(order => order.status !== 'BELUM_DIBAYAR')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    console.log('Total Belanja: Rp', totalBelanja.toLocaleString('id-ID'));
    
    console.log('\n=== ORDER BREAKDOWN ===');
    orders.forEach(order => {
      console.log(`Order ${order.id}: ${order.status} - Rp ${order.totalAmount.toLocaleString('id-ID')}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStats();