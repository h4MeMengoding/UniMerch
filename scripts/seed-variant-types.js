const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedVariantTypes() {
  console.log('Seeding variant types...');

  const variantTypes = [
    { name: 'Warna' },
    { name: 'Ukuran' },
    { name: 'Bahan' },
    { name: 'Model' },
    { name: 'Tipe' }
  ];

  for (const variantType of variantTypes) {
    try {
      await prisma.variantType.upsert({
        where: { name: variantType.name },
        update: {},
        create: variantType
      });
      console.log(`✓ Created/Updated variant type: ${variantType.name}`);
    } catch (error) {
      console.error(`✗ Failed to create variant type ${variantType.name}:`, error);
    }
  }

  console.log('Variant types seeding completed!');
}

seedVariantTypes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });