const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'pkkmb@unimerch.id',
        password: adminPassword,
        name: 'PKKMB UNNES',
        role: 'ADMIN'
      }
    });

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: 'user@unimerch.id',
        password: userPassword,
        name: 'REGULER USER',
        role: 'USER'
      }
    });

    console.log('Users created successfully:');
    console.log('Admin:', admin);
    console.log('User:', user);

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin Login:');
    console.log('Email: admin@demo.com');
    console.log('Password: admin123');
    console.log('\nUser Login:');
    console.log('Email: user@demo.com');
    console.log('Password: user123');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();