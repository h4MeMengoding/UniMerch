const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'pkkmb@unimerch.id' }
    });

    if (existingAdmin) {
      console.log('🔄 Admin user already exists, skipping...');
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'pkkmb@unimerch.id',
        password: hashedPassword,
        name: 'Admin UniMerch',
        phone: '081234567890',
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: pkkmb@unimerch.id');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: ADMIN');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();