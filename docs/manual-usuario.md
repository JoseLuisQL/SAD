# Manual de Usuario
## Sistema Integrado de Archivos Digitales (SAD)

**DISA CHINCHEROS**  
**Versión 1.0 | Noviembre 2025**

---

## Tabla de Contenido

1. [Introducción al Sistema](#1-introducción-al-sistema)
2. [Inicio de Sesión](#2-inicio-de-sesión)
3. [Gestión de Documentos](#3-gestión-de-documentos)
4. [Firma Digital](#4-firma-digital)
5. [Reportes](#5-reportes)
6. [Administración](#6-administración)
7. [Ayuda y Soporte](#7-ayuda-y-soporte)
8. [Glosario de Términos](#8-glosario-de-términos)
9. [Preguntas Frecuentes (FAQ)](#9-preguntas-frecuentes-faq)

---

## 1. Introducción al Sistema

### 1.1 ¿Qué es el SAD?

El Sistema Integrado de Archivos Digitales (SAD) es una plataforma web que permite digitalizar, gestionar, firmar y consultar documentos oficiales de manera segura y eficiente. El sistema incluye trazabilidad completa mediante auditoría de todas las operaciones.

![Pendiente: Portada del sistema](recursos-manual/capturas/01-portada-sistema.png)
> **Instrucción de captura:** Captura de la pantalla de bienvenida o dashboard con el logo de DISA CHINCHEROS visible.

### 1.2 Requisitos Previos

**Requisitos técnicos:**
- Navegador web moderno (Google Chrome 90+ o Microsoft Edge 90+)
- Conexión a internet estable
- Sistema operativo: Windows 10/11
- Para firma digital: Certificado digital instalado y aplicación Firma Perú

**Credenciales de acceso:**
- Usuario y contraseña proporcionados por el administrador del sistema

### 1.3 Acceso al Sistema

Ingrese a la URL del sistema que le proporcionó su administrador (ejemplo: `https://sad.disachincheros.gob.pe`)

---

## 2. Inicio de Sesión

### 2.1 Ingresar al Sistema

**Pasos:**

1. Abra su navegador web
2. Ingrese la URL del sistema SAD
3. En la página de inicio de sesión, complete los campos:
   - **Usuario:** Ingrese su nombre de usuario
   - **Contraseña:** Ingrese su contraseña
4. Haga clic en el botón **"Iniciar Sesión"**
5. El sistema lo redirigirá al dashboard principal

![Pendiente: Página de login](recursos-manual/capturas/02-login.png)
> **Instrucción de captura:** Pantalla de login con campos usuario/contraseña vacíos y botón "Iniciar Sesión" visible.

![Pendiente: Dashboard principal](recursos-manual/capturas/03-dashboard.png)
> **Instrucción de captura:** Vista del dashboard después del login exitoso, mostrando menú lateral y cards con estadísticas.

**⚠️ Importante:**
- Después de 5 intentos fallidos, su cuenta se bloqueará por 30 minutos
- No comparta sus credenciales con nadie
- Si olvida su contraseña, contacte al administrador del sistema

### 2.2 Recuperar Contraseña

Si olvidó su contraseña, debe contactar al administrador del sistema para que genere una nueva.

### 2.3 Cerrar Sesión

**Pasos:**

1. Haga clic en su nombre de usuario en la esquina superior derecha
2. En el menú desplegable, seleccione **"Cerrar Sesión"**
3. El sistema lo redirigirá a la página de inicio de sesión

**💡 Consejo:** Siempre cierre sesión al terminar, especialmente si usa una computadora compartida.

---

## 3. Gestión de Documentos

### 3.1 Subir un Documento Individual

Esta función permite cargar un documento PDF al sistema con sus metadatos correspondientes.

**Pasos:**

1. En el menú lateral, haga clic en **"Documentos"**
2. Haga clic en el botón **"Nuevo Documento"**
3. En el formulario de carga:
   - **Archivo:** Haga clic en "Seleccionar archivo" y elija un PDF de su computadora
   - **Archivador:** Seleccione el archivador correspondiente
   - **Tipo de documento:** Seleccione el tipo (Memorando, Oficio, Resolución, etc.)
   - **Oficina:** Seleccione la oficina emisora
   - **Remitente:** Ingrese el nombre del remitente
   - **Asunto:** Ingrese el asunto del documento
   - **Número de folio:** Ingrese el número de folio
   - **Año:** Ingrese el año del documento
4. Haga clic en **"Subir Documento"**
5. Espere a que se complete la carga (verá una barra de progreso)
6. El sistema mostrará un mensaje de confirmación

![Pendiente: Formulario de carga vacío](recursos-manual/capturas/04-formulario-subir-vacio.png)
> **Instrucción de captura:** Formulario de carga de documento con todos los campos vacíos, resaltar campo de selección de archivo y metadatos obligatorios.

![Pendiente: Formulario completado](recursos-manual/capturas/05-formulario-subir-completado.png)
> **Instrucción de captura:** Formulario con todos los campos completados y botón "Subir Documento" resaltado.

![Pendiente: Confirmación exitosa](recursos-manual/capturas/06-confirmacion-carga.png)
> **Instrucción de captura:** Mensaje toast o modal de éxito mostrando "Documento subido correctamente" con enlace al documento.

**⚠️ Importante:**
- Solo se aceptan archivos en formato PDF
- Tamaño máximo: 10 MB por archivo
- Todos los campos marcados con asterisco (*) son obligatorios
- El sistema extraerá automáticamente el texto del PDF mediante OCR para búsquedas futuras

### 3.2 Buscar Documentos

Permite buscar documentos utilizando diversos criterios.

**Pasos:**

1. En el menú lateral, haga clic en **"Documentos"**
2. En la barra de búsqueda superior, ingrese el texto que desea buscar (número, remitente, asunto, etc.)
3. **(Opcional)** Haga clic en **"Filtros"** para aplicar filtros adicionales:
   - **Archivador**
   - **Tipo de documento**
   - **Estado de firma**
   - **Rango de fechas** (desde/hasta)
4. Presione **Enter** o haga clic en el botón de búsqueda
5. Los resultados aparecerán en la tabla inferior

![Pendiente: Barra de búsqueda con filtros](recursos-manual/capturas/07-busqueda-filtros.png)
> **Instrucción de captura:** Barra de búsqueda con panel de filtros desplegado, resaltar opciones de filtro disponibles.

![Pendiente: Tabla de resultados](recursos-manual/capturas/08-tabla-resultados.png)
> **Instrucción de captura:** Tabla con resultados de búsqueda mostrando columnas: número, tipo, remitente, asunto, fecha, estado, acciones.

**💡 Consejo:**
- La búsqueda incluye el contenido OCR extraído del PDF
- Puede ordenar los resultados haciendo clic en los encabezados de las columnas
- Use filtros para resultados más precisos

### 3.3 Ver Detalle de un Documento

**Pasos:**

1. Desde la lista de documentos, haga clic en el **número del documento**
2. Se abrirá la página de detalle mostrando:
   - Visor del PDF
   - Metadatos completos
   - Estado de firma
   - Historial de versiones
   - Línea de tiempo de eventos
3. Use los botones de acción según necesite (descargar, editar, firmar)

![Pendiente: Vista de detalle](recursos-manual/capturas/09-detalle-documento.png)
> **Instrucción de captura:** Página completa de detalle con visor PDF, metadatos y botones de acción visibles.

### 3.4 Descargar Documento

**Pasos:**

1. Desde la lista de documentos o la vista de detalle
2. Haga clic en el ícono de **descarga** (flecha hacia abajo)
3. El archivo PDF se descargará automáticamente a su carpeta de descargas

![Pendiente: Botón de descarga](recursos-manual/capturas/10-boton-descarga.png)
> **Instrucción de captura:** Resaltar el ícono/botón de descarga en la interfaz.

### 3.5 Editar Metadatos

**Permisos requeridos:** Operador o Administrador

**Pasos:**

1. Desde la vista de detalle del documento, haga clic en **"Editar"**
2. Modifique los campos necesarios
3. Haga clic en **"Guardar Cambios"**
4. El sistema mostrará un mensaje de confirmación

![Pendiente: Formulario de edición](recursos-manual/capturas/11-editar-metadatos.png)
> **Instrucción de captura:** Formulario de edición con campos modificables.

**⚠️ Importante:**
- No se puede cambiar el archivo PDF, solo los metadatos
- Los cambios quedarán registrados en la auditoría del sistema

---

## 4. Firma Digital

### 4.1 Requisitos para Firmar

Antes de firmar documentos, asegúrese de cumplir con los siguientes requisitos:

**✓ Checklist de requisitos:**
- [ ] Certificado digital instalado en su computadora
- [ ] Aplicación "Firma Perú" instalada y ejecutándose
- [ ] Permisos de firma habilitados en el sistema SAD
- [ ] Conocer el PIN de su certificado digital

![Pendiente: Checklist de requisitos](recursos-manual/capturas/12-requisitos-firma.png)
> **Instrucción de captura:** Infografía o lista visual con los requisitos para firmar.

**💡 Nota:** Si no tiene certificado digital, debe solicitarlo a través de la entidad certificadora autorizada.

### 4.2 Firmar un Documento Simple

Esta función permite firmar digitalmente un documento de manera individual.

**Pasos:**

1. En el menú lateral, haga clic en **"Firma"** → **"Firmar Documento"**
2. Busque y seleccione el documento que desea firmar
3. En el campo **"Razón de firma"**, ingrese el motivo (ejemplo: "Aprobado para trámite")
4. Haga clic en el botón **"Firmar"**
5. Se abrirá la ventana de **Firma Perú**
6. Seleccione su **certificado digital** de la lista
7. Ingrese el **PIN** de su certificado
8. Haga clic en **"Confirmar"** o **"Firmar"**
9. Espere a que se complete el proceso
10. El sistema mostrará un mensaje de confirmación

![Pendiente: Formulario de firma](recursos-manual/capturas/13-formulario-firma.png)
> **Instrucción de captura:** Formulario con documento seleccionado, campo razón de firma y botón "Firmar" resaltado.

![Pendiente: Ventana Firma Perú](recursos-manual/capturas/14-ventana-firma-peru.png)
> **Instrucción de captura:** Ventana del componente web Firma Perú mostrando lista de certificados y campo PIN.

![Pendiente: Confirmación de firma](recursos-manual/capturas/15-confirmacion-firma.png)
> **Instrucción de captura:** Mensaje de éxito "Documento firmado correctamente" con estado actualizado.

**⚠️ Solución de problemas:**
- Si la ventana de Firma Perú no se abre, verifique que la aplicación esté ejecutándose
- Si aparece error de certificado, verifique que no esté vencido
- Si el PIN es incorrecto, tiene 3 intentos antes de que el certificado se bloquee

### 4.3 Crear Flujo de Firma Secuencial

Un flujo de firma permite que varios usuarios firmen un documento en orden secuencial.

**Pasos:**

1. En el menú lateral, haga clic en **"Firma"** → **"Flujos de Firma"**
2. Haga clic en **"Crear Flujo"**
3. Complete el formulario:
   - **Nombre del flujo:** Ingrese un nombre descriptivo (ej: "Aprobación Memorando 2025-001")
   - **Documento:** Seleccione el documento a firmar
   - **Firmantes:** Agregue los firmantes en orden:
     - Haga clic en "Agregar firmante"
     - Seleccione el usuario
     - El orden se asigna automáticamente (1, 2, 3, etc.)
     - Repita para cada firmante
4. Haga clic en **"Crear Flujo"**
5. El sistema notificará automáticamente al primer firmante

![Pendiente: Formulario crear flujo](recursos-manual/capturas/16-crear-flujo.png)
> **Instrucción de captura:** Formulario de creación de flujo con lista de firmantes y sus órdenes.

![Pendiente: Confirmación flujo creado](recursos-manual/capturas/17-flujo-creado.png)
> **Instrucción de captura:** Mensaje de confirmación con enlace al flujo creado.

**💡 Consejo:**
- Agregue al menos 2 firmantes
- Verifique que los firmantes tengan permisos de firma
- El primer firmante recibirá una notificación inmediatamente

### 4.4 Firmar en un Flujo (cuando es tu turno)

Cuando llega su turno para firmar en un flujo secuencial, recibirá una notificación.

**Pasos:**

1. Recibirá una notificación en el sistema: **"Es tu turno para firmar [Nombre del Flujo]"**
2. Haga clic en la **notificación** o en el enlace del correo
3. Visualizará la página del flujo con:
   - Información del documento
   - Lista de firmantes y su estado
   - Formulario de firma
4. Ingrese la **razón de firma**
5. Haga clic en **"Firmar"**
6. Complete el proceso de firma (igual que firma simple, pasos 5-9 de la sección 4.2)
7. El sistema notificará automáticamente al siguiente firmante

![Pendiente: Notificación de flujo](recursos-manual/capturas/18-notificacion-flujo.png)
> **Instrucción de captura:** Badge de notificación en navbar con mensaje "Es tu turno para firmar".

![Pendiente: Página de flujo](recursos-manual/capturas/19-pagina-flujo.png)
> **Instrucción de captura:** Vista completa del flujo con lista de firmantes, estado y formulario de firma.

**⚠️ Importante:**
- Solo puede firmar cuando sea su turno (según el orden establecido)
- Si no es su turno, verá el mensaje "Aún no es tu turno para firmar"
- Una vez que firma, no puede deshacer la acción

### 4.5 Ver Estado de un Flujo de Firma

**Pasos:**

1. En el menú lateral, haga clic en **"Firma"** → **"Flujos de Firma"**
2. Seleccione el flujo que desea consultar de la lista
3. Visualizará el detalle con:
   - **Estado general:** Pendiente, En Progreso o Completado
   - **Documento asociado**
   - **Lista de firmantes** con íconos de estado:
     - ⏳ Pendiente (gris)
     - ✓ Firmado (verde)
   - **Fechas de firma** (cuando aplique)
   - **Línea de tiempo** con eventos del flujo

![Pendiente: Lista de flujos](recursos-manual/capturas/20-lista-flujos.png)
> **Instrucción de captura:** Tabla con flujos mostrando nombre, documento, estado y progreso.

![Pendiente: Detalle de flujo](recursos-manual/capturas/21-detalle-flujo.png)
> **Instrucción de captura:** Vista detallada con lista de firmantes, íconos de estado pendiente/completado y línea de tiempo.

### 4.6 Validar Firma de un Documento

Esta función permite verificar la autenticidad e integridad de un documento firmado.

**Pasos:**

1. En el menú lateral, haga clic en **"Firma"** → **"Validar Firma"**
2. Seleccione el **documento firmado** que desea validar
3. Haga clic en **"Validar"**
4. El sistema mostrará el **reporte de validación** con:
   - **Firmante:** Nombre y DNI
   - **Certificado digital:** Emisor y fechas de validez
   - **Estado de la firma:**
     - ✓ Válida (verde)
     - ⚠️ Advertencias (amarillo)
     - ✗ Inválida (rojo)
   - **Integridad del documento:** Verificación de que no ha sido modificado
   - **Estado de revocación:** Verifica si el certificado ha sido revocado

![Pendiente: Formulario validar](recursos-manual/capturas/22-formulario-validar.png)
> **Instrucción de captura:** Formulario de selección de documento con botón "Validar".

![Pendiente: Reporte de validación](recursos-manual/capturas/23-reporte-validacion.png)
> **Instrucción de captura:** Reporte completo mostrando datos del certificado, estado de validez con código de colores.

**💡 Interpretación de resultados:**
- **Verde:** La firma es válida y el documento no ha sido modificado
- **Amarillo:** Advertencias (ej: certificado próximo a vencer, pero firma válida)
- **Rojo:** Firma inválida, certificado revocado o documento modificado

---

## 5. Reportes

### 5.1 Generar Reporte de Documentos por Período

**Pasos:**

1. En el menú lateral, haga clic en **"Reportes"**
2. Seleccione el tipo de reporte: **"Documentos por Período"**
3. Configure los filtros:
   - **Fecha inicio:** Seleccione la fecha de inicio del período
   - **Fecha fin:** Seleccione la fecha de fin del período
   - **(Opcional)** **Oficina:** Filtre por oficina específica
   - **(Opcional)** **Tipo de documento:** Filtre por tipo
   - **(Opcional)** **Estado de firma:** Filtre por estado
4. Haga clic en **"Generar Reporte"**
5. El sistema mostrará la **vista previa** con:
   - Tabla de documentos
   - Gráficos de distribución (por tipo, por estado)
   - Estadísticas resumen (total, promedio por día)

![Pendiente: Formulario de reporte](recursos-manual/capturas/24-formulario-reporte.png)
> **Instrucción de captura:** Formulario con filtros de fecha y opciones adicionales.

![Pendiente: Vista previa del reporte](recursos-manual/capturas/25-vista-previa-reporte.png)
> **Instrucción de captura:** Reporte generado con tabla, gráficos y estadísticas visibles.

### 5.2 Exportar Resultados a PDF/Excel

**Pasos:**

1. Desde la vista previa del reporte
2. Elija el formato de exportación:
   - Haga clic en **"Exportar a PDF"** para formato PDF
   - Haga clic en **"Exportar a Excel"** para formato XLSX
3. El archivo se descargará automáticamente a su carpeta de descargas

![Pendiente: Botones de exportación](recursos-manual/capturas/26-botones-exportacion.png)
> **Instrucción de captura:** Resaltar botones "Exportar a PDF" y "Exportar a Excel".

**💡 Consejo:**
- PDF es ideal para presentaciones e impresión
- Excel permite análisis adicional de los datos

---

## 6. Administración

**⚠️ Nota:** Las siguientes funciones están disponibles solo para usuarios con rol de **Administrador**.

### 6.1 Crear Usuario

**Pasos:**

1. En el menú lateral, haga clic en **"Admin"** → **"Usuarios"**
2. Haga clic en **"Nuevo Usuario"**
3. Complete el formulario:
   - **Username:** Nombre de usuario único (sin espacios)
   - **Nombre:** Nombre del usuario
   - **Apellido:** Apellido del usuario
   - **Email:** Correo electrónico
   - **Rol:** Seleccione el rol (Administrador, Operador, Consultor)
   - **Oficina:** Seleccione la oficina
   - **Estado:** Activo o Inactivo
4. Haga clic en **"Crear Usuario"**
5. El sistema mostrará las **credenciales generadas**
6. **Copie** el usuario y contraseña para entregárselos al nuevo usuario
7. Haga clic en **"Cerrar"**

![Pendiente: Lista de usuarios](recursos-manual/capturas/27-lista-usuarios.png)
> **Instrucción de captura:** Tabla de usuarios con columnas: username, nombre, rol, oficina, estado, acciones.

![Pendiente: Formulario crear usuario](recursos-manual/capturas/28-formulario-usuario.png)
> **Instrucción de captura:** Formulario completado con todos los campos y botón "Crear Usuario".

![Pendiente: Credenciales generadas](recursos-manual/capturas/29-credenciales-generadas.png)
> **Instrucción de captura:** Modal o mensaje mostrando username y contraseña temporal generada.

**⚠️ Importante:**
- El username debe ser único en el sistema
- La contraseña se genera automáticamente
- Entregue las credenciales al usuario de forma segura
- El usuario puede cambiar su contraseña contactando al administrador

### 6.2 Gestionar Roles y Permisos

**Pasos:**

1. En el menú lateral, haga clic en **"Roles y Permisos"**
2. Visualizará la lista de roles existentes con cantidad de usuarios asignados
3. Seleccione el **rol** que desea editar (ej: "Operador")
4. Se mostrará la **matriz de permisos** con:
   - **Filas:** Módulos (Documentos, Usuarios, Firma, etc.)
   - **Columnas:** Acciones (Ver, Crear, Editar, Eliminar, etc.)
   - **Checkboxes:** Para activar/desactivar permisos
5. Marque o desmarque los permisos según las políticas de seguridad
6. Haga clic en **"Guardar Permisos"**
7. El sistema aplicará los cambios inmediatamente

![Pendiente: Lista de roles](recursos-manual/capturas/30-lista-roles.png)
> **Instrucción de captura:** Lista de roles con usuarios asignados y botón editar.

![Pendiente: Matriz de permisos](recursos-manual/capturas/31-matriz-permisos.png)
> **Instrucción de captura:** Matriz completa con checkboxes marcados/desmarcados y botón "Guardar Permisos".

**💡 Roles predefinidos:**
- **Administrador:** Acceso completo al sistema
- **Operador:** Gestión de documentos y firmas
- **Consultor:** Solo visualización de documentos

### 6.3 Consultar Auditoría

El módulo de auditoría registra todas las acciones importantes del sistema.

**Pasos:**

1. En el menú lateral, haga clic en **"Admin"** → **"Auditoría"**
2. Configure los filtros:
   - **Rango de fechas:** Desde/hasta
   - **Usuario:** Filtre por usuario específico
   - **Acción:** Tipo de acción (LOGIN, CREATE, UPDATE, DELETE, SIGN, etc.)
   - **Entidad:** Tipo de registro afectado (Document, User, SignatureFlow, etc.)
3. Haga clic en **"Buscar"**
4. Visualizará la **tabla de eventos** con:
   - Fecha y hora
   - Usuario que realizó la acción
   - Acción ejecutada
   - Entidad afectada
   - Dirección IP
5. Haga clic en un **evento** para ver el detalle completo con:
   - Metadata JSON
   - Valores antes/después (para modificaciones)

![Pendiente: Filtros de auditoría](recursos-manual/capturas/32-filtros-auditoria.png)
> **Instrucción de captura:** Panel de filtros con opciones de fecha, usuario, acción y entidad.

![Pendiente: Tabla de auditoría](recursos-manual/capturas/33-tabla-auditoria.png)
> **Instrucción de captura:** Tabla con eventos filtrados mostrando todas las columnas.

![Pendiente: Detalle de evento](recursos-manual/capturas/34-detalle-evento.png)
> **Instrucción de captura:** Modal o página de detalle con metadata completa del evento.

**💡 Usos de la auditoría:**
- Rastrear cambios en documentos
- Identificar actividad sospechosa
- Cumplimiento normativo
- Resolución de incidentes

---

## 7. Ayuda y Soporte

### 7.1 Centro de Ayuda

**Pasos:**

1. Haga clic en el ícono de **interrogación (?)** en la barra superior
2. Se abrirá un **panel lateral** con opciones:
   - **Búsqueda:** Campo para buscar temas de ayuda
   - **Tutoriales:** Lista de guías paso a paso
   - **Glosario:** Definiciones de términos
   - **FAQ:** Preguntas frecuentes
   - **Contacto:** Información de soporte

![Pendiente: Panel de ayuda](recursos-manual/capturas/35-panel-ayuda.png)
> **Instrucción de captura:** Panel lateral abierto mostrando todas las opciones de ayuda.

### 7.2 Preguntas Frecuentes (FAQ)

Ver sección [9. Preguntas Frecuentes](#9-preguntas-frecuentes-faq) de este manual.

### 7.3 Contacto Soporte Técnico

**Información de contacto:**

- **Email:** soporte-sad@disachincheros.gob.pe
- **Teléfono:** (064) XXX-XXX
- **Horario de atención:** Lunes a Viernes, 8:00 AM - 5:00 PM

**Antes de contactar al soporte:**
1. Revise la sección de FAQ
2. Verifique que cumple con los requisitos técnicos
3. Tenga a mano su nombre de usuario y descripción del problema
4. Si es posible, tome capturas de pantalla del error

---

## 8. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Archivador** | Contenedor lógico que agrupa documentos por categoría o área |
| **Auditoría** | Registro cronológico de todas las acciones realizadas en el sistema |
| **Certificado digital** | Archivo electrónico que identifica a una persona o entidad y permite firmar digitalmente |
| **Firma digital** | Mecanismo criptográfico que garantiza la autenticidad e integridad de un documento |
| **Firma Perú** | Aplicación del Estado Peruano para firma digital con certificados aprobados |
| **Flujo de firma** | Secuencia ordenada de firmantes para un documento |
| **Folio** | Número de hoja o página de un documento |
| **Metadatos** | Información descriptiva de un documento (tipo, remitente, asunto, etc.) |
| **OCR** | Reconocimiento Óptico de Caracteres, tecnología que extrae texto de imágenes/PDFs |
| **Oficina** | Unidad administrativa emisora o receptora de documentos |
| **Permisos** | Autorizaciones asignadas a roles para realizar acciones específicas |
| **PIN** | Código numérico personal para acceder al certificado digital |
| **Rol** | Conjunto de permisos asignados a un grupo de usuarios |
| **Trazabilidad** | Capacidad de seguir el historial completo de un documento |
| **Usuario** | Persona con credenciales de acceso al sistema |
| **Versión** | Copia histórica de un documento en un momento específico |

---

## 9. Preguntas Frecuentes (FAQ)

### Acceso y Seguridad

**P: ¿Qué hago si olvidé mi contraseña?**  
R: Debe contactar al administrador del sistema para que le genere una nueva contraseña.

**P: ¿Por qué mi cuenta se bloqueó?**  
R: Después de 5 intentos fallidos de inicio de sesión, el sistema bloquea la cuenta por 30 minutos como medida de seguridad. Espere el tiempo indicado o contacte al administrador.

**P: ¿Puedo cambiar mi contraseña?**  
R: Actualmente no hay opción de autoservicio. Contacte al administrador para solicitar un cambio de contraseña.

### Gestión de Documentos

**P: ¿Qué formato de archivo puedo subir?**  
R: Solo se aceptan archivos en formato PDF con un tamaño máximo de 10 MB.

**P: ¿Puedo modificar un documento después de subirlo?**  
R: No puede cambiar el archivo PDF, pero sí puede editar los metadatos si tiene permisos de operador o administrador.

**P: ¿Cómo funciona la búsqueda OCR?**  
R: El sistema extrae automáticamente el texto del PDF al subirlo. Puede buscar cualquier palabra o frase contenida en el documento, incluso si el PDF es una imagen escaneada.

**P: ¿Puedo descargar múltiples documentos a la vez?**  
R: Actualmente debe descargar documentos de forma individual.

### Firma Digital

**P: ¿Necesito internet para firmar?**  
R: Sí, necesita conexión a internet para que el sistema procese la firma.

**P: ¿Qué hago si la ventana de Firma Perú no se abre?**  
R: Verifique que la aplicación Firma Perú esté instalada y ejecutándose en su computadora. Reinicie la aplicación si es necesario.

**P: ¿Cuántos certificados puedo usar?**  
R: Puede usar cualquier certificado digital válido instalado en su computadora.

**P: ¿Puedo firmar desde un celular o tablet?**  
R: El sistema de firma digital requiere la aplicación Firma Perú, que actualmente solo funciona en computadoras Windows.

**P: ¿Qué pasa si olvido el PIN de mi certificado?**  
R: Debe contactar a la entidad certificadora que emitió su certificado digital para recuperarlo o renovarlo.

**P: ¿Puedo cancelar un flujo de firma después de crearlo?**  
R: Sí, el creador del flujo o un administrador pueden cancelar un flujo que aún no esté completado.

**P: ¿Qué pasa si un firmante no está disponible?**  
R: El flujo quedará en espera hasta que ese firmante complete su firma. Si es necesario avanzar, el administrador puede cancelar el flujo y crear uno nuevo.

### Reportes

**P: ¿Puedo programar reportes automáticos?**  
R: Actualmente no hay opción de reportes programados. Debe generarlos manualmente cuando los necesite.

**P: ¿Los reportes incluyen documentos eliminados?**  
R: No, los reportes solo incluyen documentos activos en el sistema.

### Administración

**P: ¿Puedo crear roles personalizados?**  
R: Actualmente solo puede editar los permisos de los roles predefinidos (Administrador, Operador, Consultor).

**P: ¿Cuánto tiempo se conservan los registros de auditoría?**  
R: Los registros de auditoría se conservan indefinidamente para cumplir con requisitos de trazabilidad y normativa.

### Problemas Técnicos

**P: ¿Qué navegador debo usar?**  
R: Se recomienda Google Chrome o Microsoft Edge en sus versiones más recientes.

**P: ¿El sistema funciona en Mac o Linux?**  
R: El sistema web funciona en cualquier sistema operativo, pero la firma digital con Firma Perú requiere Windows.

**P: ¿Qué hago si el sistema está lento?**  
R: Verifique su conexión a internet. Si el problema persiste, contacte a soporte técnico.

**P: ¿Puedo usar el sistema desde fuera de la oficina?**  
R: Depende de la configuración de red de su institución. Consulte con el administrador del sistema.

---

## Recursos Adicionales

### Documentos de Referencia

- **Ley de Firma Digital Peruana:** Ley N° 27269
- **Normativa de Certificados Digitales:** INDECOPI - Infraestructura Oficial de Firma Electrónica (IOFE)

### Entidades Certificadoras Autorizadas en Perú

- RENIEC
- Entidades privadas certificadas por INDECOPI

---

**Fin del Manual de Usuario**

---

**Historial de Cambios:**

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0 | Noviembre 2025 | Versión inicial del manual |

---

**Elaborado por:** Equipo Técnico SAD  
**Revisado por:** [Por completar]  
**Aprobado por:** [Por completar]

**© 2025 DISA CHINCHEROS - Todos los derechos reservados**
