# API REST - Sistema Integrado de Archivos Digitales (SAD)

## Endpoints de Analytics y Métricas

### GET /api/archivo/overview
Obtiene métricas globales del sistema (archivadores, documentos, expedientes).

**Autenticación:** Requerida

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Resumen global obtenido correctamente",
  "data": {
    "archivadores": {
      "total": 50,
      "documentosTotal": 1250,
      "capacidadUtilizada": 25
    },
    "documentos": {
      "total": 1250,
      "nuevosUltimos30Dias": 85,
      "conFirmaDigital": 320,
      "sinFirmaDigital": 930,
      "erroresOCR": 12,
      "pendientesOCR": 45
    },
    "expedientes": {
      "total": 75,
      "conDocumentos": 68,
      "sinDocumentos": 7,
      "promedioDocumentosPorExpediente": 18.38
    }
  }
}
```

**Respuesta de error (500):**
```json
{
  "status": "error",
  "message": "Error al obtener resumen global"
}
```

---

### GET /api/documents/metrics
Obtiene métricas detalladas de documentos con opción de filtro por periodo.

**Autenticación:** Requerida

**Query Parameters:**
- `startDate` (opcional): Fecha de inicio del periodo (formato: YYYY-MM-DD)
- `endDate` (opcional): Fecha de fin del periodo (formato: YYYY-MM-DD)

**Ejemplo de uso:**
```
GET /api/documents/metrics?startDate=2024-01-01&endDate=2024-12-31
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Métricas de documentos obtenidas correctamente",
  "data": {
    "totalDocuments": 1250,
    "newDocuments": 85,
    "signedDocuments": 320,
    "unsignedDocuments": 850,
    "partiallySignedDocuments": 80,
    "ocrPendingDocuments": 45,
    "ocrErrorDocuments": 12,
    "ocrCompletedDocuments": 1193,
    "documentsByType": [
      {
        "typeId": "uuid-1",
        "typeName": "Oficio",
        "count": 450,
        "percentage": 36.0
      },
      {
        "typeId": "uuid-2",
        "typeName": "Informe",
        "count": 380,
        "percentage": 30.4
      }
    ],
    "documentsByOffice": [
      {
        "officeId": "uuid-3",
        "officeName": "Dirección General",
        "count": 280,
        "percentage": 22.4
      }
    ],
    "documentsByMonth": [
      {
        "month": "2024-01",
        "count": 95
      },
      {
        "month": "2024-02",
        "count": 103
      }
    ],
    "averageFolioCount": 15.6,
    "topSenders": [
      {
        "sender": "Juan Pérez",
        "count": 45
      },
      {
        "sender": "María García",
        "count": 38
      }
    ]
  }
}
```

**Respuesta de error (500):**
```json
{
  "status": "error",
  "message": "Error al obtener métricas de documentos"
}
```

---

### GET /api/archivadores/:id/analytics
Obtiene analítica detallada de un archivador específico.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del archivador

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Analytics obtenidos correctamente",
  "data": {
    "totalDocumentos": 45,
    "distribucionPorTipo": [
      {
        "tipo": "Oficio",
        "cantidad": 25
      },
      {
        "tipo": "Informe",
        "cantidad": 20
      }
    ],
    "documentosPorMes": [
      {
        "mes": "2024-10",
        "cantidad": 12
      },
      {
        "mes": "2024-11",
        "cantidad": 18
      }
    ],
    "oficinasMasRepresentadas": [
      {
        "oficina": "Dirección General",
        "cantidad": 25
      }
    ],
    "estadoArchivador": "medio",
    "porcentajeOcupacion": 45
  }
}
```

**Respuesta de error (404):**
```json
{
  "status": "error",
  "message": "Archivador no encontrado"
}
```

---

### GET /api/archivo/archivadores/:id/metrics
Obtiene métricas detalladas de un archivador específico (endpoint unificado).

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del archivador

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Métricas del archivador obtenidas correctamente",
  "data": {
    "totalDocuments": 45,
    "totalFolios": 702,
    "signedDocuments": 18,
    "ocrCompletedDocuments": 40,
    "documentsByType": [
      {
        "typeId": "uuid-1",
        "typeName": "Oficio",
        "count": 25
      }
    ],
    "documentsByOffice": [
      {
        "officeId": "uuid-2",
        "officeName": "Dirección General",
        "count": 25
      }
    ],
    "documentsByMonth": [
      {
        "month": "2024-10",
        "count": 12
      }
    ],
    "estadoArchivador": "medio",
    "porcentajeOcupacion": 45,
    "averageFolioCount": 15.6
  }
}
```

---

### GET /api/expedientes/:id/activity
Obtiene el timeline de actividad de un expediente (paginado).

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del expediente

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20)

**Ejemplo de uso:**
```
GET /api/expedientes/:id/activity?page=1&limit=20
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Timeline del expediente obtenido correctamente",
  "data": [
    {
      "id": "event-uuid-1",
      "type": "audit",
      "action": "EXPEDIENTE_CREATED",
      "description": "Creó el expediente",
      "userId": "user-uuid-1",
      "userName": "Juan Pérez",
      "timestamp": "2024-10-15T14:30:00.000Z",
      "metadata": {
        "code": "EXP-2024-001",
        "name": "Expediente de ejemplo"
      }
    },
    {
      "id": "event-uuid-2",
      "type": "document",
      "action": "DOCUMENT_ADDED",
      "description": "Agregó el documento DOC-001",
      "userId": "user-uuid-1",
      "userName": "Juan Pérez",
      "timestamp": "2024-10-16T09:15:00.000Z",
      "metadata": {
        "documentId": "doc-uuid-1",
        "documentNumber": "DOC-001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Respuesta de error (404):**
```json
{
  "status": "error",
  "message": "Expediente no encontrado"
}
```

---

### GET /api/archivo/expedientes/:id/metrics
Obtiene métricas detalladas de un expediente específico.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del expediente

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Métricas del expediente obtenidas correctamente",
  "data": {
    "totalDocuments": 28,
    "totalFolios": 445,
    "signedDocuments": 12,
    "documentsByType": [
      {
        "typeId": "uuid-1",
        "typeName": "Oficio",
        "count": 15
      },
      {
        "typeId": "uuid-2",
        "typeName": "Informe",
        "count": 13
      }
    ],
    "documentsByArchivador": [
      {
        "archivadorId": "uuid-3",
        "archivadorCode": "ARCH-2024-01",
        "archivadorName": "Archivador Enero 2024",
        "count": 18
      }
    ],
    "averageFolioCount": 15.89
  }
}
```

---

## Endpoints de Timeline

### GET /api/archivo/archivadores/:id/timeline
Obtiene el timeline de actividad de un archivador (paginado).

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del archivador

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20)

**Ejemplo de uso:**
```
GET /api/archivo/archivadores/:id/timeline?page=1&limit=20
```

**Respuesta:** Similar a `/api/expedientes/:id/activity`

---

### GET /api/archivo/documents/:id/timeline
Obtiene el timeline de actividad de un documento (paginado).

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del documento

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20)

**Respuesta:** Similar a `/api/expedientes/:id/activity` con eventos específicos de documento

---

### GET /api/archivo/users/:id/timeline
Obtiene el timeline de actividad de un usuario (paginado).

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id`: UUID del usuario

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20)

**Respuesta:** Similar a `/api/expedientes/:id/activity` con eventos del usuario

---

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos en la solicitud
- **401 Unauthorized**: Token de autenticación faltante o inválido
- **403 Forbidden**: Usuario sin permisos para la operación
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

---

## Formato de Respuestas

Todas las respuestas siguen el formato estándar:

```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

interface PaginatedResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

## Optimizaciones de Performance

### Índices de Base de Datos
Se han agregado los siguientes índices para optimizar consultas de analytics:

- `documents_createdAt_idx`: Para consultas por fecha de creación
- `documents_archivadorId_documentDate_idx`: Para métricas por archivador y periodo
- `documents_expedienteId_documentDate_idx`: Para métricas por expediente y periodo
- `documents_documentTypeId_documentDate_idx`: Para distribución por tipo de documento
- `audit_logs_entityType_entityId_idx`: Para timelines por entidad
- `audit_logs_entityType_createdAt_idx`: Para timelines por tipo y fecha

### Estrategias de Caching (Recomendadas)
Para métricas pesadas que no cambian frecuentemente:

1. **Redis Cache**: Implementar caché con TTL de 5-15 minutos para:
   - `/api/archivo/overview`
   - `/api/documents/metrics` (sin filtros de fecha)

2. **Invalidación de caché**: En eventos de:
   - Creación de documentos
   - Actualización de firmas
   - Cambios en estados OCR

### Políticas de Autorización
Las operaciones de exportación requieren permisos específicos:

- `documents.export`: Para exportar datos de documentos
- `reports.view`: Para acceder a reportes
- `analytics.view`: Para acceder a analytics (recomendado)

---

## Ejemplos de Uso

### Obtener resumen global
```bash
curl -X GET "http://localhost:4000/api/archivo/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener métricas de documentos del último mes
```bash
curl -X GET "http://localhost:4000/api/documents/metrics?startDate=2024-11-01&endDate=2024-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener timeline de expediente
```bash
curl -X GET "http://localhost:4000/api/expedientes/EXPEDIENTE_ID/activity?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notas Técnicas

1. **Performance**: Los endpoints de métricas realizan agregaciones en tiempo real. Para datasets grandes (>10,000 documentos), considerar implementar caching.

2. **Paginación**: Los endpoints de timeline usan paginación basada en offset. Para grandes volúmenes, considerar cursor-based pagination.

3. **Filtros de fecha**: Los filtros de fecha en `/api/documents/metrics` aplican sobre `documentDate`, no sobre `createdAt`.

4. **Permisos**: Todos los endpoints de analytics requieren autenticación. Los permisos específicos se validan según el rol del usuario.

5. **Timezone**: Todas las fechas están en formato ISO 8601 UTC.
