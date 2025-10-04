const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    const categories = [
      {
        name: 'Jaket',
        description: 'Jaket dan outerwear universitas'
      },
      {
        name: 'Kaos',
        description: 'T-shirt dan kaos universitas'
      },
      {
        name: 'Polo',
        description: 'Polo shirt universitas'
      },
      {
        name: 'Tas',
        description: 'Tas, tas ransel, dan tas selempang'
      },
      {
        name: 'Topi',
        description: 'Topi dan aksesoris kepala'
      },
      {
        name: 'Hoodie',
        description: 'Hoodie dan sweater universitas'
      },
      {
        name: 'Aksesoris',
        description: 'Aksesoris dan merchandise kecil'
      },
      {
        name: 'Alat Tulis',
        description: 'Pena, pensil, dan alat tulis lainnya'
      }
    ];

    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: {
          name: {
            equals: category.name,
            mode: 'insensitive'
          }
        }
      });

      if (!existing) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }

    console.log('🎉 Category seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();