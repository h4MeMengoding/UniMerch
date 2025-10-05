const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAll() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create or get demo user
    console.log('👤 Creating/updating demo user...');
    const hashedPassword = await bcrypt.hash('user123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'user@demo.com' },
      update: {
        password: hashedPassword,
        name: 'Demo User',
        phone: '+6281234567890',
      },
      create: {
        email: 'user@demo.com',
        password: hashedPassword,
        name: 'Demo User',
        phone: '+6281234567890',
        role: 'USER',
      },
    });
    console.log(`✅ User ready: ${user.email}`);

    // 2. Create categories
    console.log('\n📂 Creating categories...');
    const categories = await Promise.all([
      prisma.category.create({ data: { name: 'Pakaian', description: 'Koleksi pakaian dan merchandise fashion' } }),
      prisma.category.create({ data: { name: 'Aksesoris', description: 'Aksesoris dan pelengkap gaya' } }),
      prisma.category.create({ data: { name: 'Elektronik', description: 'Gadget dan perangkat elektronik' } }),
      prisma.category.create({ data: { name: 'Alat Tulis', description: 'Perlengkapan dan alat tulis kantor' } }),
    ]);
    console.log(`✅ ${categories.length} categories created`);

    // 3. Create products
    console.log('\n📦 Creating products...');
    const products = [
      {
        name: 'T-Shirt UniMerch Premium',
        description: 'T-shirt berkualitas tinggi dengan desain eksklusif universitas. Bahan cotton combed 30s yang nyaman dan tidak mudah luntur.',
        price: 99000,
        originalPrice: 129000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian', // Keep for backward compatibility
        categoryId: categories[0].id, // Pakaian
        stock: 50,
        isNew: true,
        isOnSale: true,
        hasVariants: true,
      },
      {
        name: 'Hoodie UniMerch Classic',
        description: 'Hoodie hangat dan stylish untuk cuaca dingin. Material fleece berkualitas dengan hood yang dapat disesuaikan.',
        price: 199000,
        originalPrice: 249000,
        image: '/api/placeholder/400/400',
        category: 'Pakaian',
        categoryId: categories[0].id, // Pakaian
        stock: 30,
        isNew: false,
        isOnSale: true,
        hasVariants: true,
      },
      {
        name: 'Tote Bag UniMerch',
        description: 'Tas belanja ramah lingkungan dengan desain minimalis. Terbuat dari canvas tebal dan tahan lama.',
        price: 79000,
        originalPrice: null,
        image: '/api/placeholder/400/400',
        category: 'Aksesoris',
        categoryId: categories[1].id, // Aksesoris
        stock: 25,
        isNew: true,
        isOnSale: false,
        hasVariants: true,
      },
      {
        name: 'Tumbler UniMerch Steel',
        description: 'Tumbler stainless steel dengan sistem vacuum yang dapat menjaga suhu minuman hingga 12 jam.',
        price: 129000,
        originalPrice: null,
        image: '/api/placeholder/400/400',
        category: 'Aksesoris',
        categoryId: categories[1].id, // Aksesoris
        stock: 40,
        isNew: false,
        isOnSale: false,
        hasVariants: true,
      },
      {
        name: 'Power Bank UniMerch 10000mAh',
        description: 'Power bank portable dengan kapasitas 10000mAh dan teknologi fast charging. Dilengkapi LED indicator.',
        price: 198000,
        originalPrice: 229000,
        image: '/api/placeholder/400/400',
        category: 'Elektronik',
        categoryId: categories[2].id, // Elektronik
        stock: 15,
        isNew: true,
        isOnSale: true,
        hasVariants: false,
      },
      {
        name: 'Notebook UniMerch A5',
        description: 'Notebook dengan cover premium dan kertas berkualitas tinggi. Perfect untuk catatan harian dan sketsa.',
        price: 45000,
        originalPrice: null,
        image: '/api/placeholder/400/400',
        category: 'Alat Tulis',
        categoryId: categories[3].id, // Alat Tulis
        stock: 60,
        isNew: false,
        isOnSale: false,
        hasVariants: true,
      },
    ];

    const createdProducts = [];
    for (const productData of products) {
      const product = await prisma.product.create({ data: productData });
      createdProducts.push(product);
      console.log(`✅ Product created: ${product.name}`);
    }

    // 4. Create product variants and options
    console.log('\n🎨 Creating product variants...');
    for (const product of createdProducts) {
      if (product.hasVariants) {
        // Create color variant for all variant products
        const colorVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: 'Warna',
          },
        });

        // Create color options
        const colors = ['Hitam', 'Putih', 'Merah', 'Biru'];
        for (const color of colors) {
          await prisma.variantOption.create({
            data: {
              variantId: colorVariant.id,
              name: color,
            },
          });
        }

        // Create size variant for clothing
        if (product.categoryId === categories[0].id) { // Pakaian
          const sizeVariant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: 'Ukuran',
            },
          });

          // Create size options
          const sizes = ['S', 'M', 'L', 'XL'];
          for (const size of sizes) {
            await prisma.variantOption.create({
              data: {
                variantId: sizeVariant.id,
                name: size,
              },
            });
          }
        }
      }
    }
    console.log('✅ Product variants created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: 1 (${user.email})`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Email: user@demo.com');
    console.log('Password: user123');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedAll();