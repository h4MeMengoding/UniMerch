const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserData() {
  try {
    console.log('🔍 Checking user data...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log('📊 User Data:');
    console.log('='.repeat(50));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Name: "${user.name}"`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name Status: ${user.name ? '✅ Has name' : '❌ Missing name'}`);
      console.log('-'.repeat(30));
    });

    // Check if demo user exists
    const demoUser = await prisma.user.findUnique({
      where: { email: 'user@demo.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (demoUser) {
      console.log('\n🎯 Demo User (user@demo.com):');
      console.log(`   ID: ${demoUser.id}`);
      console.log(`   Name: "${demoUser.name}"`);
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Role: ${demoUser.role}`);
      console.log(`   Name Status: ${demoUser.name ? '✅ Has name' : '❌ Missing name'}`);
    } else {
      console.log('\n❌ Demo user not found!');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUserData();