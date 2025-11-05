# Dashboard Analytics API

## Endpoint: GET /api/analytics/dashboard

Endpoint optimizado para obtener un snapshot completo del estado del sistema para el dashboard.

### Autenticación

Requiere token JWT válido en el header:
```
Authorization: Bearer <token>
```

### Rate Limiting

- Límite: 30 solicitudes por minuto por usuario
- Respuesta en caso de exceder: 429 Too Many Requests

### Query Parameters

| Parámetro | Tipo | Valores | Default | Descripción |
|-----------|------|---------|---------|-------------|
| range | string | `7d`, `30d`, `90d` | `90d` | Rango de tiempo para tendencias |
| officeId | string | UUID | - | Filtrar por oficina específica |

### Respuesta Exitosa (200)

```json
{
  "status": "success",
  "message": "Snapshot del dashboard obtenido correctamente",
  "data": {
    "cards": {
      "totalDocuments": 1250,
      "totalArchivadores": 45,
      "totalExpedientes": 320,
      "signaturesCompleted": 890,
      "signaturesPartial": 120,
      "signaturesPending": 240
    },
    "trends": {
      "documentsCreated": [
        { "week": "2025-10-01", "count": 45 },
        { "week": "2025-10-08", "count": 52 }
      ],
      "signaturesCompleted": [
        { "week": "2025-10-01", "count": 30 },
        { "week": "2025-10-08", "count": 38 }
      ]
    },
    "distributions": {
      "byOffice": [
        {
          "officeId": "uuid",
          "officeName": "Oficina Central",
          "count": 450,
          "percentage": 36.0
        }
      ],
      "byDocumentType": [
        {
          "typeId": "uuid",
          "typeName": "Resolución",
          "count": 320,
          "percentage": 25.6
        }
      ]
    },
    "alerts": [
      {
        "id": "ocr-pending",
        "type": "OCR_PENDING",
        "severity": "high",
        "title": "Documentos con OCR pendiente",
        "description": "Hay 15 documentos esperando procesamiento OCR",
        "count": 15
      },
      {
        "id": "archivador-full-abc123",
        "type": "ARCHIVADOR_FULL",
        "severity": "medium",
        "title": "Archivador con alta ocupación",
        "description": "Archivador 2025-01 (A-001) está al 92% de capacidad",
        "entityId": "abc123"
      }
    ],
    "recentActivity": [
      {
        "id": "audit-log-id",
        "action": "DOCUMENT_CREATED",
        "module": "Documentos",
        "user": {
          "username": "jperez",
          "fullName": "Juan Pérez"
        },
        "timestamp": "2025-10-27T10:30:00Z"
      }
    ]
  }
}
```

### Códigos de Error

- **400 Bad Request**: Parámetro `range` inválido
- **401 Unauthorized**: Token no proporcionado o inválido
- **429 Too Many Requests**: Excedido el límite de rate limiting
- **500 Internal Server Error**: Error del servidor

### Comportamiento según Rol

#### Administrador / Operador
- Acceso completo a todos los indicadores
- Incluye alertas de archivadores
- Ve todos los datos del sistema

#### Consultor
- Totales de archivadores y expedientes en 0
- No recibe alertas de ocupación de archivadores
- Solo ve documentos que tiene permisos de lectura

### Caching

Los datos se cachean en memoria por 60 segundos por combinación de:
- userId
- role
- range
- officeId

El cache se invalida automáticamente después del TTL. Para forzar invalidación manual, se puede usar la función `invalidateDashboardCache()` en el servicio.

### Auditoría

Cada llamada al endpoint se registra en la tabla `audit_logs` con:
- Action: `DASHBOARD_VIEW`
- Module: `Analytics`
- EntityType: `Dashboard`
- EntityId: `snapshot`
- NewValue: incluye parámetros de consulta (range, officeId, source)

### Ejemplos de Uso

#### Obtener snapshot con rango de 7 días
```bash
curl -X GET "http://localhost:4000/api/analytics/dashboard?range=7d" \
  -H "Authorization: Bearer <token>"
```

#### Filtrar por oficina específica
```bash
curl -X GET "http://localhost:4000/api/analytics/dashboard?officeId=abc-123" \
  -H "Authorization: Bearer <token>"
```

#### Combinar filtros
```bash
curl -X GET "http://localhost:4000/api/analytics/dashboard?range=30d&officeId=abc-123" \
  -H "Authorization: Bearer <token>"
```

### Performance

- Con cache: < 300ms
- Sin cache (primera consulta): < 800ms
- Utiliza índices optimizados en:
  - `documents(officeId, createdAt)`
  - `documents(signatureStatus, createdAt)`
  - `documents(ocrStatus, officeId)`
  - `signature_flows(status, createdAt)`

### Datos Demo

Para generar datos de prueba para validar el dashboard:

```bash
npx ts-node scripts/seed-dashboard-demo.ts
```

Este script crea:
- 3 archivadores con diferentes niveles de ocupación
- 160 documentos con estados variados
- 20 registros de auditoría recientes

Todos los registros demo se marcan con `[DEMO]` para fácil identificación y limpieza.
