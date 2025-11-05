import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000';
let accessToken = '';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
  duration: number;
}

const results: TestResult[] = [];

async function login() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    accessToken = response.data.data.accessToken;
    console.log('✓ Login successful');
  } catch (error) {
    console.error('✗ Login failed:', error);
    process.exit(1);
  }
}

async function testGetOverview() {
  const testName = 'GET /api/archivo/overview - should return global metrics';
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_URL}/api/archivo/overview`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (response.data.status !== 'success') {
      throw new Error(`Expected status 'success', got '${response.data.status}'`);
    }
    
    if (!response.data.data) {
      throw new Error('Response should contain data');
    }
    
    if (!response.data.data.archivadores || !response.data.data.documentos || !response.data.data.expedientes) {
      throw new Error('Response should contain archivadores, documentos, and expedientes');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Archivadores: ${response.data.data.archivadores.total}`);
  } catch (error) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    
    console.log(`✗ ${testName}`);
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testGetDocumentMetrics() {
  const testName = 'GET /api/documents/metrics - should return document metrics';
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_URL}/api/documents/metrics`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (response.data.status !== 'success') {
      throw new Error(`Expected status 'success', got '${response.data.status}'`);
    }
    
    if (!response.data.data) {
      throw new Error('Response should contain data');
    }
    
    if (typeof response.data.data.totalDocuments !== 'number') {
      throw new Error('totalDocuments should be a number');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Total documents: ${response.data.data.totalDocuments}`);
  } catch (error) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    
    console.log(`✗ ${testName}`);
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testGetDocumentMetricsWithPeriod() {
  const testName = 'GET /api/documents/metrics?startDate&endDate - should return metrics for period';
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_URL}/api/documents/metrics`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (response.data.status !== 'success') {
      throw new Error(`Expected status 'success', got '${response.data.status}'`);
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Documents in period: ${response.data.data.totalDocuments}`);
  } catch (error) {
    results.push({
      name: testName,
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    
    console.log(`✗ ${testName}`);
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testUnauthorized() {
  const testName = 'GET /api/archivo/overview without token - should return 401';
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_URL}/api/archivo/overview`);
    
    throw new Error(`Expected 401, got ${response.status}`);
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      results.push({
        name: testName,
        status: 'PASS',
        duration: Date.now() - startTime
      });
      
      console.log(`✓ ${testName}`);
      console.log(`  Status: 401 (as expected)`);
    } else {
      results.push({
        name: testName,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      
      console.log(`✗ ${testName}`);
      console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function runAllTests() {
  console.log('\n=== Running Analytics API Integration Tests ===\n');
  console.log(`API URL: ${API_URL}\n`);
  
  await login();
  console.log('');
  
  await testUnauthorized();
  await testGetOverview();
  await testGetDocumentMetrics();
  await testGetDocumentMetricsWithPeriod();
  
  console.log('\n=== Test Summary ===\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total duration: ${totalDuration}ms`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}`);
      console.log(`    ${r.message}`);
    });
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
