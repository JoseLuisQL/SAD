const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Probando login con admin...\n');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      username: 'admin',
      password: 'Admin123!'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login exitoso!\n');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error en login:\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No se recibió respuesta del servidor');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
