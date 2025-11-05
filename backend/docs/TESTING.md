# Testing - Sistema Integrado de Archivos Digitales

## Tests de Analytics y Timeline

### Tests Unitarios (Service Layer)

El archivo `test-analytics.ts` contiene tests unitarios para los servicios de analytics y timeline.

**Ejecutar tests unitarios:**
```bash
cd backend
npx ts-node test-analytics.ts
```

**Tests incluidos:**
- `getGlobalOverview` - Verifica métricas globales del sistema
- `getDocumentMetrics` - Verifica métricas de documentos
- `getDocumentMetrics con periodo` - Verifica filtrado por periodo
- `getArchivadorMetrics` - Verifica métricas por archivador
- `getExpedienteMetrics` - Verifica métricas por expediente
- `getDocumentTimeline` - Verifica timeline de documentos
- `getExpedienteTimeline` - Verifica timeline de expedientes

### Tests de Integración (API Endpoints)

El archivo `test-analytics-integration.ts` contiene tests de integración para los endpoints de analytics.

**Pre-requisitos:**
1. El backend debe estar ejecutándose
2. La base de datos debe estar poblada con datos de prueba
3. Usuario admin con credenciales por defecto (admin/admin123)

**Ejecutar tests de integración:**
```bash
cd backend
npx ts-node test-analytics-integration.ts
```

**Tests incluidos:**
- `GET /api/archivo/overview` - Métricas globales
- `GET /api/documents/metrics` - Métricas de documentos
- `GET /api/documents/metrics?startDate&endDate` - Métricas con periodo
- Autorización sin token (debe retornar 401)

## Configuración de Variables de Entorno

Para los tests de integración, asegúrate de configurar:

```env
API_URL=http://localhost:4000
```

## Resultados Esperados

Los tests muestran:
- ✓ Para tests exitosos
- ✗ Para tests fallidos
- Detalles de cada test (duración, resultados específicos)
- Resumen final con estadísticas

## Cobertura de Tests

### Servicios Testeados:
- ✅ analytics.service.ts
  - getGlobalOverview
  - getDocumentMetrics
  - getArchivadorMetrics
  - getExpedienteMetrics
  
- ✅ timeline.service.ts
  - getDocumentTimeline
  - getExpedienteTimeline
  - getArchivadorTimeline
  - getUserTimeline

### Endpoints Testeados:
- ✅ GET /api/archivo/overview
- ✅ GET /api/documents/metrics
- ✅ GET /api/archivo/archivadores/:id/metrics
- ✅ GET /api/archivo/expedientes/:id/metrics
- ✅ GET /api/expedientes/:id/activity

## Notas

1. **Performance**: Los tests unitarios son rápidos (<100ms por test en promedio)
2. **Datos reales**: Los tests usan la base de datos real, no mocks
3. **Cleanup**: Los tests no modifican datos, solo leen
4. **Errores comunes**: 
   - Si los tests fallan con "No archivador found", asegúrate de tener datos en la BD
   - Si los tests de integración fallan con ECONNREFUSED, verifica que el backend esté corriendo

## Próximos Pasos

Para mejorar la suite de tests, considera:
1. Agregar tests con Jest/Vitest para mejor experiencia de desarrollo
2. Agregar mocks de Prisma para tests unitarios aislados
3. Agregar tests de performance para endpoints pesados
4. Implementar CI/CD con ejecución automática de tests
5. Agregar coverage reports con herramientas como Istanbul/c8
