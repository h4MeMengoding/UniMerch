// Test script untuk memverifikasi API auth/verify
const testLogin = async () => {
  try {
    console.log('🔐 Testing login and auth verification...\n');
    
    // 1. Login terlebih dahulu
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@demo.com',
        password: 'user123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('📧 Login Response:');
    console.log('Status:', loginResponse.status);
    console.log('Data:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('❌ Login failed!');
      return;
    }

    // Extract auth token dari response headers
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('\n🍪 Cookies:', cookies);

    // 2. Test auth verification dengan cookie
    if (cookies) {
      const authToken = cookies.match(/auth-token=([^;]+)/)?.[1];
      
      if (authToken) {
        console.log('\n🔍 Testing /api/auth/verify...');
        
        const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
          headers: {
            'Cookie': `auth-token=${authToken}`
          }
        });

        const verifyData = await verifyResponse.json();
        console.log('Status:', verifyResponse.status);
        console.log('Data:', JSON.stringify(verifyData, null, 2));
        
        if (verifyData.user) {
          console.log('\n✅ Auth verification successful!');
          console.log(`   ID: ${verifyData.user.id}`);
          console.log(`   Name: "${verifyData.user.name}"`);
          console.log(`   Email: ${verifyData.user.email}`);
          console.log(`   Role: ${verifyData.user.role}`);
          console.log(`   Name Status: ${verifyData.user.name ? '✅ Has name' : '❌ Missing name'}`);
        }
      } else {
        console.log('❌ No auth token found in cookies');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testLogin();