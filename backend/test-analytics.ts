import dotenv from 'dotenv';
import * as analyticsService from './src/services/analytics.service';
import * as timelineService from './src/services/timeline.service';
import prisma from './src/config/database';

dotenv.config();

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
  duration: number;
}

const results: TestResult[] = [];

async function testGetGlobalOverview() {
  const testName = 'getGlobalOverview - should return global metrics';
  const startTime = Date.now();
  
  try {
    const overview = await analyticsService.getGlobalOverview();
    
    if (!overview || typeof overview !== 'object') {
      throw new Error('Overview should return an object');
    }
    
    if (!overview.archivadores || !overview.documentos || !overview.expedientes) {
      throw new Error('Overview should contain archivadores, documentos, and expedientes');
    }
    
    if (typeof overview.archivadores.total !== 'number') {
      throw new Error('archivadores.total should be a number');
    }
    
    if (typeof overview.documentos.total !== 'number') {
      throw new Error('documentos.total should be a number');
    }
    
    if (typeof overview.expedientes.total !== 'number') {
      throw new Error('expedientes.total should be a number');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Archivadores: ${overview.archivadores.total}`);
    console.log(`  Documentos: ${overview.documentos.total}`);
    console.log(`  Expedientes: ${overview.expedientes.total}`);
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
  const testName = 'getDocumentMetrics - should return document metrics';
  const startTime = Date.now();
  
  try {
    const metrics = await analyticsService.getDocumentMetrics();
    
    if (!metrics || typeof metrics !== 'object') {
      throw new Error('Metrics should return an object');
    }
    
    if (typeof metrics.totalDocuments !== 'number') {
      throw new Error('totalDocuments should be a number');
    }
    
    if (!Array.isArray(metrics.documentsByType)) {
      throw new Error('documentsByType should be an array');
    }
    
    if (!Array.isArray(metrics.documentsByOffice)) {
      throw new Error('documentsByOffice should be an array');
    }
    
    if (!Array.isArray(metrics.documentsByMonth)) {
      throw new Error('documentsByMonth should be an array');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Total documents: ${metrics.totalDocuments}`);
    console.log(`  Document types: ${metrics.documentsByType.length}`);
    console.log(`  Offices: ${metrics.documentsByOffice.length}`);
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
  const testName = 'getDocumentMetrics - should return metrics for specific period';
  const startTime = Date.now();
  
  try {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    
    const metrics = await analyticsService.getDocumentMetrics({
      startDate,
      endDate
    });
    
    if (!metrics || typeof metrics !== 'object') {
      throw new Error('Metrics should return an object');
    }
    
    if (typeof metrics.totalDocuments !== 'number') {
      throw new Error('totalDocuments should be a number');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Documents in period: ${metrics.totalDocuments}`);
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

async function testGetArchivadorMetrics() {
  const testName = 'getArchivadorMetrics - should return metrics for archivador';
  const startTime = Date.now();
  
  try {
    const firstArchivador = await prisma.archivador.findFirst();
    
    if (!firstArchivador) {
      throw new Error('No archivador found in database for testing');
    }
    
    const metrics = await analyticsService.getArchivadorMetrics(firstArchivador.id);
    
    if (!metrics || typeof metrics !== 'object') {
      throw new Error('Metrics should return an object');
    }
    
    if (typeof metrics.totalDocuments !== 'number') {
      throw new Error('totalDocuments should be a number');
    }
    
    if (typeof metrics.totalFolios !== 'number') {
      throw new Error('totalFolios should be a number');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Archivador: ${firstArchivador.code}`);
    console.log(`  Documents: ${metrics.totalDocuments}`);
    console.log(`  Folios: ${metrics.totalFolios}`);
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

async function testGetExpedienteMetrics() {
  const testName = 'getExpedienteMetrics - should return metrics for expediente';
  const startTime = Date.now();
  
  try {
    const firstExpediente = await prisma.expediente.findFirst();
    
    if (!firstExpediente) {
      throw new Error('No expediente found in database for testing');
    }
    
    const metrics = await analyticsService.getExpedienteMetrics(firstExpediente.id);
    
    if (!metrics || typeof metrics !== 'object') {
      throw new Error('Metrics should return an object');
    }
    
    if (typeof metrics.totalDocuments !== 'number') {
      throw new Error('totalDocuments should be a number');
    }
    
    if (typeof metrics.totalFolios !== 'number') {
      throw new Error('totalFolios should be a number');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Expediente: ${firstExpediente.code}`);
    console.log(`  Documents: ${metrics.totalDocuments}`);
    console.log(`  Folios: ${metrics.totalFolios}`);
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

async function testGetDocumentTimeline() {
  const testName = 'getDocumentTimeline - should return timeline for document';
  const startTime = Date.now();
  
  try {
    const firstDocument = await prisma.document.findFirst();
    
    if (!firstDocument) {
      throw new Error('No document found in database for testing');
    }
    
    const timeline = await timelineService.getDocumentTimeline(firstDocument.id, 1, 10);
    
    if (!timeline || typeof timeline !== 'object') {
      throw new Error('Timeline should return an object');
    }
    
    if (!Array.isArray(timeline.events)) {
      throw new Error('events should be an array');
    }
    
    if (!timeline.pagination) {
      throw new Error('Timeline should contain pagination');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Document: ${firstDocument.documentNumber}`);
    console.log(`  Events: ${timeline.events.length}`);
    console.log(`  Total: ${timeline.pagination.total}`);
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

async function testGetExpedienteTimeline() {
  const testName = 'getExpedienteTimeline - should return timeline for expediente';
  const startTime = Date.now();
  
  try {
    const firstExpediente = await prisma.expediente.findFirst();
    
    if (!firstExpediente) {
      throw new Error('No expediente found in database for testing');
    }
    
    const timeline = await timelineService.getExpedienteTimeline(firstExpediente.id, 1, 10);
    
    if (!timeline || typeof timeline !== 'object') {
      throw new Error('Timeline should return an object');
    }
    
    if (!Array.isArray(timeline.events)) {
      throw new Error('events should be an array');
    }
    
    if (!timeline.pagination) {
      throw new Error('Timeline should contain pagination');
    }
    
    results.push({
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime
    });
    
    console.log(`✓ ${testName}`);
    console.log(`  Expediente: ${firstExpediente.code}`);
    console.log(`  Events: ${timeline.events.length}`);
    console.log(`  Total: ${timeline.pagination.total}`);
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

async function runAllTests() {
  console.log('\n=== Running Analytics and Timeline Service Tests ===\n');
  
  await testGetGlobalOverview();
  await testGetDocumentMetrics();
  await testGetDocumentMetricsWithPeriod();
  await testGetArchivadorMetrics();
  await testGetExpedienteMetrics();
  await testGetDocumentTimeline();
  await testGetExpedienteTimeline();
  
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
  
  await prisma.$disconnect();
  
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(async (error) => {
  console.error('Test suite failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
