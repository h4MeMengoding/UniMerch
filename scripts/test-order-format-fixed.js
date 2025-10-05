// Test script untuk format kode pesanan baru
const formatOrderCode = (orderId, createdAt) => {
  try {
    const date = new Date(createdAt);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for order code:', createdAt);
      return `#${String(orderId).padStart(8, '0')}`; // Fallback to old format
    }
    
    // Get date components in UTC to avoid timezone issues
    const year = String(date.getUTCFullYear()).slice(-2); // Last 2 digits of year
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month with leading zero
    const day = String(date.getUTCDate()).padStart(2, '0'); // Day with leading zero
    
    // Handle order ID overflow (max 4 digits = 9999)
    const orderNum = orderId > 9999 
      ? String(orderId % 10000).padStart(4, '0') // Take last 4 digits if overflow
      : String(orderId).padStart(4, '0'); // Normal padding
    
    return `#${year}${month}${day}${orderNum}`;
  } catch (error) {
    console.error('Error formatting order code:', error);
    return `#${String(orderId).padStart(8, '0')}`; // Fallback to old format
  }
};

console.log('🧪 Testing Order Code Format\n');

// Test cases
const testCases = [
  { orderId: 1, createdAt: '2025-10-05T10:30:00Z', expected: '#2510050001' },
  { orderId: 8, createdAt: '2025-10-05T14:45:00Z', expected: '#2510050008' },
  { orderId: 12, createdAt: '2025-10-05T18:20:00Z', expected: '#2510050012' },
  { orderId: 123, createdAt: '2025-12-25T09:15:00Z', expected: '#2512250123' },
  { orderId: 9999, createdAt: '2025-01-01T00:00:00Z', expected: '#2501019999' },
];

console.log('Format: #YYMMDDXXXX');
console.log('- YY: Tahun (2 digit terakhir)');
console.log('- MM: Bulan (2 digit dengan leading zero)');
console.log('- DD: Tanggal (2 digit dengan leading zero)');
console.log('- XXXX: Nomor order (4 digit dengan padding 0)\n');

console.log('Test Results:');
console.log('='.repeat(60));

testCases.forEach((test, index) => {
  const result = formatOrderCode(test.orderId, test.createdAt);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${index + 1}. Order ID: ${test.orderId}`);
  console.log(`   Date: ${test.createdAt}`);
  console.log(`   Expected: ${test.expected}`);
  console.log(`   Got: ${result}`);
  console.log(`   Status: ${status}`);
  console.log('-'.repeat(50));
});

// Test with today's date (5 Oktober 2025)
const todayTest = formatOrderCode(1, new Date('2025-10-05').toISOString());
console.log(`\n🗓️ Today's Test (5 Oktober 2025, Order #1): ${todayTest}`);
console.log(`Expected: #2510050001`);
console.log(`Status: ${todayTest === '#2510050001' ? '✅ CORRECT' : '❌ INCORRECT'}`);

// Test edge cases
console.log('\n🧪 Edge Cases:');
console.log(`Order 10000: ${formatOrderCode(10000, '2025-10-05')} (Should show last 4 digits: 0000)`);
console.log(`Order 12345: ${formatOrderCode(12345, '2025-10-05')} (Should show last 4 digits: 2345)`);
console.log(`Invalid date: ${formatOrderCode(1, 'invalid-date')} (Should fallback to old format)`);

console.log('\n✅ Format testing completed!');