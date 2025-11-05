# Base de Datos - Sistema de Archivo Digital

## Schema de Base de Datos

Este directorio contiene la configuración de Prisma ORM y el schema de base de datos para el Sistema Integrado de Archivos Digitales.

## Estructura de Tablas

### Usuarios y Roles
- **roles**: Roles del sistema (Administrador, Operador, Consultor)
- **users**: Usuarios del sistema con sus credenciales

### Catálogos
- **offices**: Oficinas de DISA Chincheros
- **document_types**: Tipos de documentos (Oficio, Memorándum, Informe, etc.)
- **periods**: Períodos anuales para organización

### Gestión de Archivos
- **archivadores**: Archivadores físicos con ubicación
- **documents**: Documentos digitalizados con metadata
- **document_versions**: Versiones de documentos

### Firmas Digitales
- **signatures**: Firmas digitales aplicadas a documentos
- **signature_flows**: Flujos de firma con múltiples firmantes

### Auditoría
- **audit_logs**: Registro de todas las acciones del sistema

## Relaciones

```
Role (1) ──< (N) User
User (1) ──< (N) Document (creator)
User (1) ──< (N) Archivador (creator)
Period (1) ──< (N) Archivador
Archivador (1) ──< (N) Document
Office (1) ──< (N) Document
DocumentType (1) ──< (N) Document
Document (1) ──< (N) DocumentVersion
Document (1) ──< (N) Signature
User (1) ──< (N) Signature (signer)
```

## Índices

- **Índices simples**: En campos de búsqueda frecuente (documentNumber, sender, etc.)
- **Índices compuestos**: [documentDate, documentTypeId] para búsquedas combinadas
- **Índices fulltext**: En annotations y ocrContent para búsqueda de texto completo
- **Índices de auditoría**: [userId, createdAt] para consultas de auditoría

## Datos Iniciales (Seed)

### Roles
1. **Administrador**: Acceso total al sistema
2. **Operador**: Puede crear y modificar documentos
3. **Consultor**: Solo lectura

### Usuario Administrador
- Username: `admin`
- Email: `admin@disachincheros.gob.pe`
- Password: `admin123`
- ⚠️ **CAMBIAR EN PRODUCCIÓN**

### Oficinas
- DIR - Dirección General
- ADM - Administración
- LOG - Logística
- RRHH - Recursos Humanos
- PRES - Presupuesto

### Tipos de Documento
- OF - Oficio
- MEM - Memorándum
- INF - Informe
- RES - Resolución
- SOL - Solicitud
- CONT - Contrato

### Períodos
- 3 períodos: años actuales (2023-2025)

## Comandos Prisma

### Desarrollo
```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear migración
npm run prisma:migrate

# Ejecutar seed
npm run prisma:seed

# Abrir Prisma Studio (GUI)
npm run prisma:studio
```

### Migración de Base de Datos
```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (⚠️ BORRA TODO)
npx prisma migrate reset
```

### Verificación
```bash
# Verificar estado de la base de datos
npx ts-node prisma/verify-db.ts

# Ver logs de queries (desarrollo)
# Ya configurado en src/config/database.ts
```

## Características de Seguridad

### Hashing de Contraseñas
- Uso de bcryptjs con 10 rounds
- Contraseñas nunca se almacenan en texto plano

### Auditoría
- Todas las acciones se registran en audit_logs
- Incluye: usuario, acción, módulo, valores anteriores/nuevos, IP, user agent

### Soft Deletes (Opcional)
- Campo `isActive` en entidades principales
- Permite deshabilitar sin eliminar

## Performance

### Optimizaciones Implementadas
1. **Índices estratégicos**: En campos de búsqueda frecuente
2. **Índices compuestos**: Para queries complejas
3. **Fulltext search**: Para búsqueda rápida en texto
4. **Cascadas**: onDelete: Cascade para limpieza automática
5. **Conexión pooling**: Implementado en database.ts

### Recomendaciones
- Usar `select` para limitar campos retornados
- Implementar paginación en listas largas
- Usar `include` solo cuando sea necesario
- Considerar caching para catálogos

## Backup y Restauración

### Backup
```bash
# Backup de base de datos MySQL
mysqldump -u root -p archivo_digital_disa > backup_$(date +%Y%m%d).sql
```

### Restauración
```bash
# Restaurar desde backup
mysql -u root -p archivo_digital_disa < backup_20231011.sql

# Regenerar cliente Prisma
npm run prisma:generate
```

## Troubleshooting

### Error: Cannot connect to database
1. Verificar que MySQL esté corriendo
2. Verificar credenciales en .env
3. Verificar que la base de datos exista

### Error: Migration failed
1. Verificar integridad del schema
2. Revertir última migración: `npx prisma migrate resolve --rolled-back <migration_name>`
3. Intentar nuevamente

### Error: Seed failed
1. Verificar que las migraciones estén aplicadas
2. Limpiar datos existentes manualmente si es necesario
3. Verificar dependencias (bcryptjs, etc.)
