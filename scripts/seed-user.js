const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('user123', 12);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'user@demo.com' }
    });

    if (existingUser) {
      console.log('🔄 Demo user already exists, skipping...');
      return;
    }

    // Create demo user
    const user = await prisma.user.create({
      data: {
        email: 'user@demo.com',
        password: hashedPassword,
        name: 'Demo User',
        phone: '081234567891',
        role: 'USER'
      }
    });

    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: user@demo.com');
    console.log('🔑 Password: user123');
    console.log('👤 Role: USER');

  } catch (error) {
    console.error('❌ Error seeding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUser();