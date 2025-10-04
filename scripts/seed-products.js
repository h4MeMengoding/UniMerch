const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProducts() {
  try {
    // Delete existing products
    await prisma.product.deleteMany();

    // Sample products
    const products = [
      {
        name: 'Totebag Canvas – Desain A',
        description: 'Totebag canvas 12oz muat A4, sablon plastisol, tali kuat untuk aktivitas kampus.',
        price: 69000,
        originalPrice: 89000,
        image: '/api/placeholder/400/400',
        category: 'Tas & Aksesoris',
        isNew: true,
        isOnSale: true,
        stock: 25
      },
      {
        name: 'Totebag Canvas – Desain B',
        description: 'Bahan canvas 12oz dengan saku dalam, cocok untuk buku A4 dan laptop tipis.',
        price: 79000,
        image: '/api/placeholder/400/400',
        category: 'Tas & Aksesoris',
        isNew: false,
        isOnSale: false,
        stock: 15
      },
      {
        name: 'Totebag Premium – Desain C',
        description: 'Canvas premium 14oz, jahitan bartack di pegangan, kapasitas besar.',
        price: 99000,
        originalPrice: 119000,
        image: '/api/placeholder/400/400',
        category: 'Tas & Aksesoris',
        isNew: false,
        isOnSale: true,
        stock: 10
      },
      {
        name: 'Bucket Hat – Desain A',
        description: 'Katun drill adem, bordir logo kampus di depan, rim medium.',
        price: 89000,
        originalPrice: 109000,
        image: '/api/placeholder/400/400',
        category: 'Aksesoris',
        isNew: false,
        isOnSale: true,
        stock: 20
      },
      {
        name: 'Bucket Hat – Desain B (Hitam)',
        description: 'Bahan katun, bordir rapi, cocok untuk outdoor & casual.',
        price: 99000,
        image: '/api/placeholder/400/400',
        category: 'Aksesoris',
        isNew: true,
        isOnSale: false,
        stock: 18
      },
      {
        name: 'Kaos – Desain A (Combed 24s)',
        description: 'Kaos unisex cotton combed 24s, sablon plastisol, cutting regular.',
        price: 119000,
        originalPrice: 149000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian',
        isNew: true,
        isOnSale: true,
        stock: 30
      },
      {
        name: 'Kaos – Desain B (Oversize 24s)',
        description: 'Bahan combed 24s, fit oversize, printing awet tidak mudah pecah.',
        price: 129000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian',
        isNew: false,
        isOnSale: false,
        stock: 22
      },
      {
        name: 'Kaos – Desain C (Combed 30s)',
        description: 'Lebih ringan dan adem, cocok untuk aktivitas harian.',
        price: 99000,
        originalPrice: 129000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian',
        isNew: false,
        isOnSale: true,
        stock: 28
      }
    ];

    // Create products
    for (const productData of products) {
      await prisma.product.create({
        data: productData
      });
    }

    console.log('✅ Sample products seeded successfully!');
    console.log(`📦 Created ${products.length} products`);
    
    // Display categories
    const categories = [...new Set(products.map(p => p.category))];
    console.log('📋 Categories:', categories.join(', '));

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();