const https = require('https');

async function testXenditAPI() {
  const XENDIT_SECRET_KEY = 'xnd_development_yacjK1aHJw4OJF3maSl9ODkU2u0k03P4YZGcAbDG0OIBJncaBCelJq0Gm4l0V4y1';
  const LATEST_INVOICE_ID = '68e1574c43f0668d90cdc071';
  
  // Base64 encode the secret key for Basic Auth
  const authString = Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64');
  
  console.log('=== TESTING XENDIT API ===');
  console.log('Secret Key:', XENDIT_SECRET_KEY.substring(0, 20) + '...');
  console.log('Invoice ID:', LATEST_INVOICE_ID);
  console.log('Auth String:', authString.substring(0, 20) + '...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.xendit.co',
      path: `/v2/invoices/${LATEST_INVOICE_ID}`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log('Headers:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const invoice = JSON.parse(data);
          console.log('\n=== INVOICE DETAILS FROM XENDIT API ===');
          console.log('ID:', invoice.id);
          console.log('External ID:', invoice.external_id);
          console.log('Amount:', invoice.amount);
          console.log('Currency:', invoice.currency);
          console.log('Status:', invoice.status);
          console.log('Created:', invoice.created);
          console.log('Updated:', invoice.updated);
          console.log('Invoice URL:', invoice.invoice_url);
          console.log('Customer:', invoice.customer);
          if (invoice.paid_at) {
            console.log('Paid At:', invoice.paid_at);
          }
          
          console.log('\n✅ Invoice found in Xendit API!');
          console.log('🎯 The transaction exists in Xendit system.');
          console.log('📊 Check your Xendit Dashboard in TEST MODE.');
          
          resolve(invoice);
        } catch (error) {
          console.error('Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.end();
  });
}

testXenditAPI().catch(console.error);