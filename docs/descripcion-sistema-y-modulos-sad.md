# SAD — Descripción del Sistema y Módulos

El Sistema Integrado de Archivos Digitales (SAD) centraliza la digitalización, gestión, versionado y firma digital de documentos. Este resumen describe, de forma breve y precisa, los módulos principales desde el inicio de sesión.

Nota sobre capturas: reemplace <ruta-a-capturas> por la carpeta donde guardará las imágenes y pegue la evidencia en cada sección.

## 1. Inicio de sesión (Login)
- Acceso con credenciales y establecimiento de sesión segura según rol.
- Protección de rutas y control de permisos.
![Captura — Login](<ruta-a-capturas>/login.png)

## 2. Dashboard
- Vista general del estado del sistema: documentos recientes, estados de firma y accesos rápidos.
- Indicadores básicos de actividad.
![Captura — Dashboard](<ruta-a-capturas>/dashboard.png)

## 3. Gestión de documentos
- Carga de archivos, extracción OCR (Tesseract) y asociación de metadatos/tipos documentales.
- Visualización, edición de metadatos y descarga.
![Captura — Gestión de documentos](<ruta-a-capturas>/gestion-documentos.png)

## 4. Búsqueda y filtros
- Búsqueda por texto (incluye texto reconocido por OCR) y filtros por tipo, estado y fechas.
- Resultados paginados con acciones rápidas.
![Captura — Búsqueda y filtros](<ruta-a-capturas>/busqueda-filtros.png)

## 5. Versionado de documentos
- Historial de cambios con posibilidad de comparar y restaurar versiones.
- Trazabilidad por usuario y fecha.
![Captura — Versionado](<ruta-a-capturas>/versionado.png)

## 6. Flujos de firma
- Definición y seguimiento de rutas de aprobación/firma.
- Reenvío, cancelación o reversión según permisos.
![Captura — Flujos de firma](<ruta-a-capturas>/flujos-firma.png)

## 7. Firmas digitales (Firma Perú)
- Firma digital integrada con Firma Perú y validaciones requeridas.
- Evidencias y sellos para auditoría.
![Captura — Firma digital](<ruta-a-capturas>/firma-digital.png)

## 8. Usuarios y roles
- Alta/baja/edición de usuarios, asignación de roles y permisos.
- Control de acceso por módulo y acción.
![Captura — Usuarios y roles](<ruta-a-capturas>/usuarios-roles.png)

## 9. Auditoría
- Registro de acciones clave (creación, edición, firma, reversión, descargas) para cumplimiento y trazabilidad.
- Filtros por usuario, acción y rango de fechas.
![Captura — Auditoría](<ruta-a-capturas>/auditoria.png)

## 10. Configuración
- Parámetros del sistema, administración de tipos documentales y plantillas.
- Gestión de integraciones y credenciales (seguras).
![Captura — Configuración](<ruta-a-capturas>/configuracion.png)
