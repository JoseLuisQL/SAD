# PROMPTS DE DESARROLLO CON VIBECODING
## Sistema Integrado de Archivos Digitales - DISA CHINCHEROS

---

## 📋 GUÍA DE USO DE ESTE DOCUMENTO

### ¿Qué es Vibecoding?

**Vibecoding** es una metodología de desarrollo donde describes lo que necesitas en lenguaje natural a una IA (como ChatGPT, Claude, Cursor, etc.), y la IA genera el código funcional. En lugar de escribir código línea por línea, guías a la IA con instrucciones claras y específicas.

### Principios de Vibecoding Aplicados

1. **Especificidad:** Cada prompt es detallado y claro sobre qué se necesita
2. **Contexto:** Se proporciona información sobre el stack tecnológico y arquitectura
3. **Iteración:** Cada prompt construye sobre el anterior
4. **Validación:** Se incluyen criterios de éxito para verificar que funciona
5. **Secuencialidad:** Los prompts están en orden de dependencia

### Cómo Usar Este Documento

1. **Ejecuta los prompts EN ORDEN** - cada uno depende del anterior
2. **Verifica que funcione** antes de pasar al siguiente
3. **Testea cada funcionalidad** según los criterios de éxito
4. **No saltes prompts** - la secuencia es crítica
5. **Adapta según necesites** - estos son templates, ajusta a tu contexto

### Estructura de Cada Prompt

```
PROMPT [Número]: [Título]
├── Contexto: Información de fondo
├── Objetivo: Qué se debe lograr
├── Instrucciones: Pasos detallados
├── Criterios de Éxito: Cómo verificar que funciona
└── Siguiente Paso: Qué viene después
```

---

## 🎯 FASE 1: CONFIGURACIÓN INICIAL Y FUNDAMENTOS

---

### PROMPT 001: Configuración Inicial del Proyecto Backend

**Contexto:**
Vamos a crear un Sistema Integrado de Archivos Digitales para DISA CHINCHEROS. Este es el primer paso: configurar el proyecto backend desde cero.

**Stack Tecnológico:**
- Node.js 18+ LTS
- TypeScript 5+
- Express.js 4.18+
- Prisma ORM
- MySQL 8.0

**Objetivo:**
Crear la estructura base del proyecto backend con TypeScript, Express, y todas las configuraciones necesarias.

**Instrucciones:**

Necesito que crees un proyecto backend con la siguiente estructura y configuración:

1. **Inicializar proyecto Node.js:**
   - Crear carpeta `backend`
   - Inicializar npm
   - Configurar TypeScript
   - Instalar dependencias principales

2. **Dependencias a instalar:**
   ```
   Producción:
   - express
   - cors
   - helmet
   - morgan
   - dotenv
   - joi
   - bcryptjs
   - jsonwebtoken
   - multer
   - @prisma/client
   
   Desarrollo:
   - typescript
   - @types/node
   - @types/express
   - @types/cors
   - @types/bcryptjs
   - @types/jsonwebtoken
   - @types/multer
   - ts-node
   - nodemon
   - prisma
   ```

3. **Estructura de carpetas:**
   ```
   backend/
   ├── src/
   │   ├── config/
   │   ├── controllers/
   │   ├── middlewares/
   │   ├── routes/
   │   ├── services/
   │   ├── utils/
   │   ├── types/
   │   ├── prisma/
   │   ├── app.ts
   │   └── server.ts
   ├── uploads/
   │   └── documents/
   ├── .env.example
   ├── .gitignore
   ├── package.json
   ├── tsconfig.json
   └── README.md
   ```

4. **Configurar TypeScript (tsconfig.json):**
   - Target: ES2020
   - Module: commonjs
   - Strict mode: true
   - Output directory: dist
   - Root directory: src

5. **Crear archivo .env.example con variables:**
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=mysql://user:password@localhost:3306/archivo_digital_disa
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

6. **Configurar scripts en package.json:**
   - `dev`: Ejecutar con nodemon y ts-node
   - `build`: Compilar TypeScript
   - `start`: Ejecutar versión compilada
   - `prisma:generate`: Generar cliente Prisma
   - `prisma:migrate`: Ejecutar migraciones

7. **Crear servidor Express básico (src/app.ts y src/server.ts):**
   - Configurar middlewares: cors, helmet, morgan, express.json
   - Crear ruta de health check: GET /api/health
   - Manejo de errores global
   - Configuración de CORS para desarrollo

8. **Crear .gitignore:**
   - node_modules
   - dist
   - .env
   - uploads/*
   - *.log

**Criterios de Éxito:**
- ✅ `npm run dev` ejecuta el servidor sin errores
- ✅ Servidor escucha en puerto 5000
- ✅ GET http://localhost:5000/api/health retorna status 200
- ✅ TypeScript compila sin errores
- ✅ Estructura de carpetas completa
- ✅ Variables de entorno cargándose correctamente

**Siguiente Paso:**
Una vez que el servidor esté corriendo correctamente, procederemos con PROMPT 002 para configurar la base de datos y Prisma.

---

### PROMPT 002: Configuración de Base de Datos con Prisma

**Contexto:**
El servidor backend está corriendo. Ahora necesitamos configurar la base de datos MySQL y crear el schema completo con Prisma ORM.

**Objetivo:**
Configurar Prisma, diseñar el schema de base de datos completo, y ejecutar las migraciones iniciales.

**Instrucciones:**

1. **Inicializar Prisma:**
   - Ejecutar `npx prisma init`
   - Configurar datasource para MySQL
   - Configurar generator para Prisma Client

2. **Crear schema completo en `prisma/schema.prisma`:**

   Necesito que crees los siguientes modelos con sus relaciones:

   **User (Usuarios):**
   - id: String (UUID, PK)
   - username: String (unique)
   - email: String (unique)
   - password: String (hashed)
   - firstName: String
   - lastName: String
   - roleId: String (FK a Role)
   - isActive: Boolean (default true)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: role, documents, signatures, auditLogs

   **Role (Roles):**
   - id: String (UUID, PK)
   - name: String (unique)
   - description: String
   - permissions: Json
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: users

   **Office (Oficinas):**
   - id: String (UUID, PK)
   - code: String (unique)
   - name: String
   - description: String (optional)
   - isActive: Boolean (default true)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: documents

   **DocumentType (Tipos de Documentos):**
   - id: String (UUID, PK)
   - code: String (unique)
   - name: String
   - description: String (optional)
   - isActive: Boolean (default true)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: documents

   **Period (Periodos):**
   - id: String (UUID, PK)
   - year: Int (unique)
   - description: String (optional)
   - isActive: Boolean (default true)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: archivadores

   **Archivador (Archivadores Físicos):**
   - id: String (UUID, PK)
   - code: String (unique)
   - name: String
   - periodId: String (FK a Period)
   - physicalLocation: Json (estante, modulo, descripcion)
   - createdBy: String (FK a User)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: period, creator, documents

   **Document (Documentos):**
   - id: String (UUID, PK)
   - archivadorId: String (FK a Archivador)
   - documentTypeId: String (FK a DocumentType)
   - officeId: String (FK a Office)
   - documentNumber: String
   - documentDate: DateTime
   - sender: String
   - folioCount: Int
   - annotations: String (text)
   - ocrContent: String (text, optional)
   - filePath: String
   - fileName: String
   - fileSize: Int
   - mimeType: String
   - currentVersion: Int (default 1)
   - createdBy: String (FK a User)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: archivador, documentType, office, creator, versions, signatures
   - Índices: documentNumber, documentDate, sender, annotations, ocrContent

   **DocumentVersion (Versiones de Documentos):**
   - id: String (UUID, PK)
   - documentId: String (FK a Document)
   - versionNumber: Int
   - filePath: String
   - fileName: String
   - changeDescription: String
   - createdBy: String (FK a User)
   - createdAt: DateTime
   - Relaciones: document, creator

   **Signature (Firmas Digitales):**
   - id: String (UUID, PK)
   - documentId: String (FK a Document)
   - documentVersionId: String (FK a DocumentVersion, optional)
   - signerId: String (FK a User)
   - signatureData: Json
   - certificateData: Json
   - timestamp: DateTime
   - isValid: Boolean (default true)
   - createdAt: DateTime
   - Relaciones: document, version, signer

   **SignatureFlow (Flujos de Firma):**
   - id: String (UUID, PK)
   - name: String
   - documentId: String (FK a Document)
   - signers: Json (array de usuarios y orden)
   - currentStep: Int (default 0)
   - status: String (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
   - createdBy: String (FK a User)
   - createdAt: DateTime
   - updatedAt: DateTime
   - Relaciones: document, creator

   **AuditLog (Auditoría):**
   - id: String (UUID, PK)
   - userId: String (FK a User)
   - action: String
   - module: String
   - entityType: String
   - entityId: String
   - oldValue: Json (optional)
   - newValue: Json (optional)
   - ipAddress: String
   - userAgent: String
   - createdAt: DateTime
   - Relaciones: user
   - Índices: userId, action, module, createdAt

3. **Configurar índices para optimizar búsquedas:**
   - Índice compuesto en Document: [documentDate, documentTypeId]
   - Índice de texto completo en: annotations, ocrContent
   - Índice en AuditLog: [userId, createdAt]

4. **Crear migración inicial:**
   - Ejecutar `npx prisma migrate dev --name init`
   - Generar Prisma Client

5. **Crear seed para datos iniciales (prisma/seed.ts):**
   - 3 roles: Administrador, Operador, Consultor
   - 1 usuario administrador por defecto
   - Permisos básicos para cada rol

**Criterios de Éxito:**
- ✅ Migración ejecutada sin errores
- ✅ Base de datos creada con todas las tablas
- ✅ Prisma Client generado
- ✅ Seed ejecutado correctamente
- ✅ Relaciones entre tablas funcionando
- ✅ Índices creados correctamente

**Siguiente Paso:**
Con la base de datos configurada, procederemos con PROMPT 003 para implementar el sistema de autenticación.

---

### PROMPT 003: Sistema de Autenticación con JWT (Backend)

**Contexto:**
La base de datos está configurada. Ahora implementaremos el sistema completo de autenticación con JWT, incluyendo login, registro, refresh tokens, y middleware de autenticación.

**Objetivo:**
Crear un sistema de autenticación robusto y seguro con JWT, RBAC, y todas las validaciones necesarias.

**Instrucciones:**

1. **Crear servicio de autenticación (src/services/auth.service.ts):**
   
   Implementa las siguientes funciones:
   
   - `register(userData)`: Registrar nuevo usuario
     * Validar que username y email sean únicos
     * Hashear contraseña con bcrypt (10 rounds)
     * Crear usuario en base de datos
     * Retornar usuario sin contraseña
   
   - `login(username, password)`: Autenticar usuario
     * Buscar usuario por username
     * Verificar contraseña con bcrypt
     * Validar que usuario esté activo
     * Generar access token (15 min)
     * Generar refresh token (7 días)
     * Retornar tokens y datos de usuario
   
   - `refreshToken(refreshToken)`: Renovar access token
     * Verificar refresh token
     * Generar nuevo access token
     * Retornar nuevo token
   
   - `logout(userId)`: Cerrar sesión
     * Invalidar tokens (opcional: lista negra)
     * Registrar en auditoría

2. **Crear utilidades JWT (src/utils/jwt.utils.ts):**
   
   - `generateAccessToken(userId, roleId)`: Generar access token
   - `generateRefreshToken(userId)`: Generar refresh token
   - `verifyToken(token)`: Verificar y decodificar token
   - `decodeToken(token)`: Decodificar sin verificar

3. **Crear middleware de autenticación (src/middlewares/auth.middleware.ts):**
   
   - `authenticate`: Middleware para verificar JWT
     * Extraer token del header Authorization
     * Verificar token
     * Buscar usuario en base de datos
     * Adjuntar usuario a req.user
     * Manejar errores (token inválido, expirado, usuario no existe)
   
   - `authorize(...roles)`: Middleware para verificar roles
     * Verificar que req.user existe
     * Verificar que rol del usuario está en roles permitidos
     * Retornar 403 si no autorizado

4. **Crear validaciones (src/middlewares/validation.middleware.ts):**
   
   Usar Joi para validar:
   
   - `validateRegister`: Validar datos de registro
     * username: string, min 3, max 50, requerido
     * email: email válido, requerido
     * password: string, min 8, requerido
     * firstName: string, requerido
     * lastName: string, requerido
     * roleId: UUID, requerido
   
   - `validateLogin`: Validar datos de login
     * username: string, requerido
     * password: string, requerido

5. **Crear controlador de autenticación (src/controllers/auth.controller.ts):**
   
   - `register`: POST /api/auth/register
   - `login`: POST /api/auth/login
   - `refreshToken`: POST /api/auth/refresh
   - `logout`: POST /api/auth/logout
   - `me`: GET /api/auth/me (obtener usuario actual)

6. **Crear rutas de autenticación (src/routes/auth.routes.ts):**
   
   ```
   POST   /api/auth/register    - Registrar usuario (solo admin)
   POST   /api/auth/login       - Iniciar sesión
   POST   /api/auth/refresh     - Renovar token
   POST   /api/auth/logout      - Cerrar sesión (autenticado)
   GET    /api/auth/me          - Obtener usuario actual (autenticado)
   ```

7. **Crear tipos TypeScript (src/types/express.d.ts):**
   
   Extender Request de Express para incluir:
   ```typescript
   interface AuthUser {
     id: string;
     username: string;
     email: string;
     roleId: string;
     role: {
       name: string;
       permissions: any;
     };
   }
   
   declare namespace Express {
     interface Request {
       user?: AuthUser;
     }
   }
   ```

8. **Integrar rutas en app.ts:**
   - Montar rutas de autenticación en /api/auth

**Criterios de Éxito:**
- ✅ POST /api/auth/register crea usuario correctamente
- ✅ POST /api/auth/login retorna tokens válidos
- ✅ Contraseñas se hashean correctamente
- ✅ Tokens JWT se generan y verifican correctamente
- ✅ Middleware authenticate funciona
- ✅ Middleware authorize bloquea accesos no autorizados
- ✅ Validaciones rechazan datos inválidos
- ✅ GET /api/auth/me retorna usuario autenticado

**Testing Manual:**
```bash
# Registrar usuario
POST http://localhost:5000/api/auth/register
{
  "username": "admin",
  "email": "admin@disa.gob.pe",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "Sistema",
  "roleId": "[ID del rol admin]"
}

# Login
POST http://localhost:5000/api/auth/login
{
  "username": "admin",
  "password": "Admin123!"
}

# Obtener usuario actual
GET http://localhost:5000/api/auth/me
Authorization: Bearer [access_token]
```

**Siguiente Paso:**
Con la autenticación funcionando, procederemos con PROMPT 004 para crear el frontend con Next.js.

---

### PROMPT 004: Configuración Inicial del Proyecto Frontend

**Contexto:**
El backend con autenticación está funcionando. Ahora crearemos el proyecto frontend con Next.js 14, TypeScript, y Tailwind CSS.

**Objetivo:**
Configurar el proyecto frontend completo con Next.js 14 (App Router), TypeScript, Tailwind CSS, y shadcn/ui.

**Instrucciones:**

1. **Crear proyecto Next.js:**
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
   ```
   
   Configuración:
   - TypeScript: Yes
   - ESLint: Yes
   - Tailwind CSS: Yes
   - App Router: Yes
   - Import alias: @/*

2. **Instalar dependencias adicionales:**
   ```
   Producción:
   - axios
   - zustand (state management)
   - react-hook-form
   - zod
   - @hookform/resolvers
   - lucide-react (iconos)
   - date-fns
   - react-hot-toast
   - js-cookie
   
   Desarrollo:
   - @types/js-cookie
   ```

3. **Configurar shadcn/ui:**
   ```bash
   npx shadcn-ui@latest init
   ```
   
   Instalar componentes base:
   - button
   - input
   - label
   - card
   - table
   - dialog
   - select
   - toast
   - dropdown-menu
   - avatar

4. **Estructura de carpetas:**
   ```
   frontend/
   ├── app/
   │   ├── (auth)/
   │   │   ├── login/
   │   │   │   └── page.tsx
   │   │   └── layout.tsx
   │   ├── (dashboard)/
   │   │   ├── layout.tsx
   │   │   ├── page.tsx
   │   │   └── admin/
   │   ├── api/ (si es necesario)
   │   ├── layout.tsx
   │   └── globals.css
   ├── components/
   │   ├── ui/ (shadcn components)
   │   ├── layout/
   │   │   ├── Navbar.tsx
   │   │   ├── Sidebar.tsx
   │   │   └── Footer.tsx
   │   ├── forms/
   │   └── shared/
   ├── lib/
   │   ├── api.ts
   │   ├── auth.ts
   │   ├── utils.ts
   │   └── constants.ts
   ├── hooks/
   │   ├── useAuth.ts
   │   └── useToast.ts
   ├── store/
   │   └── authStore.ts
   ├── types/
   │   ├── auth.types.ts
   │   └── api.types.ts
   ├── .env.local.example
   └── next.config.js
   ```

5. **Configurar variables de entorno (.env.local.example):**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

6. **Crear cliente API (lib/api.ts):**
   
   Configurar axios con:
   - Base URL desde variables de entorno
   - Interceptor para agregar token JWT
   - Interceptor para manejar errores
   - Interceptor para refresh token automático
   - Manejo de errores 401 (redirigir a login)

7. **Crear store de autenticación (store/authStore.ts):**
   
   Usar Zustand para manejar:
   - Estado: user, accessToken, refreshToken, isAuthenticated
   - Acciones: login, logout, setUser, refreshToken
   - Persistencia en localStorage/cookies

8. **Crear hook de autenticación (hooks/useAuth.ts):**
   
   Hook personalizado que:
   - Usa el store de autenticación
   - Proporciona funciones: login, logout, isAuthenticated
   - Maneja redirecciones
   - Verifica token al cargar

9. **Crear tipos TypeScript (types/auth.types.ts):**
   ```typescript
   interface User {
     id: string;
     username: string;
     email: string;
     firstName: string;
     lastName: string;
     role: {
       id: string;
       name: string;
       permissions: any;
     };
   }
   
   interface LoginCredentials {
     username: string;
     password: string;
   }
   
   interface AuthResponse {
     user: User;
     accessToken: string;
     refreshToken: string;
   }
   ```

10. **Configurar Tailwind (tailwind.config.js):**
    - Tema personalizado con colores de DISA
    - Configuración de shadcn/ui
    - Fuentes personalizadas

11. **Crear layout raíz (app/layout.tsx):**
    - Configurar metadata
    - Providers necesarios
    - Toaster para notificaciones
    - Fuentes

**Criterios de Éxito:**
- ✅ `npm run dev` ejecuta Next.js sin errores
- ✅ Aplicación accesible en http://localhost:3000
- ✅ Tailwind CSS funcionando
- ✅ shadcn/ui componentes instalados
- ✅ Estructura de carpetas completa
- ✅ Cliente API configurado
- ✅ Store de autenticación funcionando

**Siguiente Paso:**
Con el frontend configurado, procederemos con PROMPT 005 para crear la página de login.

---

### PROMPT 005: Página de Login y Sistema de Autenticación (Frontend)

**Contexto:**
El frontend está configurado. Ahora crearemos la página de login completa con formulario, validaciones, y conexión al backend.

**Objetivo:**
Implementar página de login funcional con validaciones, manejo de errores, y redirección según rol.

**Instrucciones:**

1. **Crear formulario de login (components/forms/LoginForm.tsx):**
   
   Usar react-hook-form + zod para:
   
   - Campos:
     * Username (requerido, min 3 caracteres)
     * Password (requerido, min 8 caracteres)
   
   - Validaciones con Zod:
     ```typescript
     const loginSchema = z.object({
       username: z.string().min(3, "Mínimo 3 caracteres"),
       password: z.string().min(8, "Mínimo 8 caracteres")
     });
     ```
   
   - Funcionalidad:
     * Mostrar errores de validación
     * Deshabilitar botón mientras carga
     * Mostrar spinner en botón al enviar
     * Manejar errores del servidor
     * Mostrar toast de éxito/error
   
   - Diseño:
     * Usar componentes shadcn/ui (Input, Button, Label)
     * Diseño limpio y profesional
     * Responsive
     * Icono de ojo para mostrar/ocultar contraseña

2. **Crear página de login (app/(auth)/login/page.tsx):**
   
   - Centrar formulario en pantalla
   - Logo de DISA
   - Título: "Sistema de Archivos Digitales"
   - Subtítulo: "DISA CHINCHEROS"
   - Incluir LoginForm
   - Fondo con gradiente o imagen

3. **Crear layout de autenticación (app/(auth)/layout.tsx):**
   
   - Layout simple sin navbar/sidebar
   - Centrado en pantalla
   - Fondo personalizado
   - No requiere autenticación

4. **Implementar lógica de login (hooks/useAuth.ts):**
   
   ```typescript
   const login = async (credentials: LoginCredentials) => {
     try {
       const response = await api.post('/auth/login', credentials);
       const { user, accessToken, refreshToken } = response.data;
       
       // Guardar en store
       setUser(user);
       setAccessToken(accessToken);
       setRefreshToken(refreshToken);
       
       // Guardar en cookies
       Cookies.set('accessToken', accessToken);
       Cookies.set('refreshToken', refreshToken);
       
       // Redirigir según rol
       router.push('/dashboard');
       
       toast.success('Bienvenido!');
     } catch (error) {
       toast.error('Credenciales inválidas');
       throw error;
     }
   };
   ```

5. **Crear componente ProtectedRoute (components/shared/ProtectedRoute.tsx):**
   
   - Verificar si usuario está autenticado
   - Si no, redirigir a /login
   - Si sí, renderizar children
   - Mostrar loading mientras verifica

6. **Crear middleware de autenticación (middleware.ts en raíz):**
   
   ```typescript
   export function middleware(request: NextRequest) {
     const token = request.cookies.get('accessToken');
     const isAuthPage = request.nextUrl.pathname.startsWith('/login');
     const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
     
     if (!token && isDashboard) {
       return NextResponse.redirect(new URL('/login', request.url));
     }
     
     if (token && isAuthPage) {
       return NextResponse.redirect(new URL('/dashboard', request.url));
     }
   }
   
   export const config = {
     matcher: ['/dashboard/:path*', '/login']
   };
   ```

7. **Crear página de dashboard básica (app/(dashboard)/page.tsx):**
   
   - Mensaje de bienvenida
   - Mostrar nombre del usuario
   - Botón de logout
   - Estadísticas básicas (placeholder)

8. **Crear layout de dashboard (app/(dashboard)/layout.tsx):**
   
   - Incluir Navbar
   - Incluir Sidebar
   - Área de contenido
   - Proteger con ProtectedRoute

9. **Crear Navbar (components/layout/Navbar.tsx):**
   
   - Logo DISA
   - Nombre del sistema
   - Información de usuario (nombre, rol)
   - Dropdown con:
     * Mi perfil
     * Configuración
     * Cerrar sesión
   - Responsive (hamburger menu en mobile)

10. **Crear Sidebar (components/layout/Sidebar.tsx):**
    
    - Menú de navegación
    - Iconos con lucide-react
    - Menú dinámico según rol:
      * Administrador: todos los módulos
      * Operador: archivo, consultas
      * Consultor: solo consultas
    - Highlight de ruta activa
    - Colapsable en mobile

**Criterios de Éxito:**
- ✅ Página de login se muestra correctamente
- ✅ Formulario valida campos correctamente
- ✅ Login exitoso guarda tokens y redirige
- ✅ Login fallido muestra error
- ✅ Dashboard solo accesible con autenticación
- ✅ Navbar muestra información de usuario
- ✅ Sidebar muestra menú según rol
- ✅ Logout funciona y redirige a login
- ✅ Middleware protege rutas correctamente

**Testing Manual:**
1. Ir a http://localhost:3000
2. Debe redirigir a /login
3. Ingresar credenciales incorrectas → Ver error
4. Ingresar credenciales correctas → Redirigir a /dashboard
5. Verificar que navbar muestra usuario
6. Verificar que sidebar muestra menú
7. Hacer logout → Redirigir a /login
8. Intentar acceder a /dashboard sin login → Redirigir a /login

**Siguiente Paso:**
Con el sistema de autenticación completo, procederemos con PROMPT 006 para implementar la gestión de usuarios (backend).

---

### PROMPT 005-1: Refactorización Visual del Login (Frontend)

**Contexto:**
La página de login ya está implementada con `app/(auth)/login/page.tsx`, el layout `app/(auth)/login/layout.tsx` y el formulario `components/forms/LoginForm.tsx`. El diseño actual utiliza un gradiente azul; necesitamos alinear la experiencia con el estilo minimalista y profesional del resto del sistema (fondos blancos, jerarquía clara, contraste óptimo).

**Objetivo:**
Actualizar el layout de autenticación y la tarjeta de login para lograr un diseño limpio, moderno y accesible, manteniendo la funcionalidad existente.

**Instrucciones:**

1. **Layout general (`app/(auth)/login/layout.tsx`):**
   - Sustituir el gradiente por un fondo blanco (`bg-white`) con un patrón sutil en `bg-slate-50` usando utilidades Tailwind (por ejemplo, un `before` con `bg-gradient-to-br via-white`).
   - Incluir contenedor centrado responsivo (`max-w-lg`) con padding amplio (`px-6 py-12`) para la tarjeta.
   - Añadir sección lateral opcional (visible en `lg`) con imagen/ilustración tomada de `public/` o un vector ligero; debe usar `className="hidden lg:flex ..."` para evitar sobrecargar móviles.

2. **Tarjeta de login (`app/(auth)/login/page.tsx`):**
   - Utilizar el componente `Card` pero redefinir clases: `Card` sin sombras agresivas (`shadow-lg` y `border border-slate-200`).
   - Reemplazar el placeholder con "D" por el logo oficial (`/favicon.ico` o asset en `public/`) usando `next/image` con `priority` y `alt` descriptivo.
   - Añadir encabezado jerárquico: título (`h1`) con `text-3xl` y subtítulo con `text-slate-500`.
   - Incluir breve texto de bienvenida (2 líneas) explicando el sistema y la confidencialidad.

3. **Tipografía y espaciado:**
   - Asegurar interlineados (`leading-relaxed`) y márgenes uniformes (`space-y-6`).
   - Utilizar tokens definidos en `app/globals.css` (colores `--primary`, `--border`) mediante clases `text-slate-900`, `text-slate-500`, `border-slate-200` para respetar la paleta ISO.

4. **Responsividad:**
   - Verificar que en móviles el formulario ocupe el ancho completo con padding `p-6`.
   - En tablets/escritorio, centrar la tarjeta con `grid lg:grid-cols-[1fr_auto] gap-12` en el layout para balancear contenido.

**Criterios de Éxito:**
- ✅ Fondo blanco uniforme respetando identidades visuales.
- ✅ Logo oficial renderizado con `next/image` y texto accesible.
- ✅ Layout responsivo sin overflow en dispositivos pequeños.
- ✅ Jerarquía visual clara (título, subtítulo, descripción, formulario).

**Testing Visual:**
1. Abrir http://localhost:3000/login y comprobar consistencia en breakpoints (320px, 768px, 1280px).
2. Verificar contraste con herramientas (ej. Lighthouse, axe) asegurando relación AA.
3. Confirmar que el layout coincide estilísticamente con dashboard (fondos claros, bordes sutiles).

**Siguiente Paso:**
Aplicar mejoras de experiencia de usuario y accesibilidad en PROMPT 005-2.

---

### PROMPT 005-2: Experiencia de Usuario, Accesibilidad y Contenido Guiado (Frontend)

**Contexto:**
`LoginForm.tsx` ya valida con Zod y muestra toasts. Requerimos reforzar accesibilidad, ayudar a usuarios sin conocimientos técnicos y ofrecer mensajes claros de soporte.

**Objetivo:**
Incrementar la usabilidad incorporando ayudas contextuales, estados vacíos, mensajes accesibles y un flujo guiado sin recargar la interfaz.

**Instrucciones:**

1. **Estructura semántica del formulario (`LoginForm.tsx`):**
   - Envolver campos con `role="form"` y `aria-describedby` apuntando a mensajes de ayuda.
   - Sustituir `button` manual del icono de contraseña por `Button` con `variant="ghost"` y `aria-pressed` dinámico.
   - Añadir `aria-live="assertive"` en contenedor de errores para lectores de pantalla.

2. **Mensajes guiados:**
   - Crear componente `AuthHelper` en `components/forms/AuthHelper.tsx` (o `components/shared/AuthHelper.tsx`) con tips enumerados (ej. “¿Olvidaste tu usuario?”, “Contactar soporte DISA”).
   - Colocarlo debajo del botón con `Card` minimalista (`bg-slate-50`, `border-dashed`).
   - Incluir enlace `mailto:` y `tel:` predefinidos para soporte.

3. **Opciones adicionales:**
   - Añadir checkbox "Recordar sesión" usando `@/components/ui/checkbox` y almacenar preferencia en `localStorage` (clave `remember_me`).
   - Si está activo, persistir usuario en `localStorage` y precargarlo en `useForm` (`defaultValues`).

4. **Gestión de estados:**
   - Mostrar feedback inline al enviar (`<Button>` con `Spinner` ya existe) y desactivar inputs.
   - Implementar contador de reintentos en `useAuthStore.login`: si hay 3 intentos fallidos consecutivos, mostrar alerta con contacto a soporte y esperar 30s antes de reintentar (utilizar `setTimeout` y estado `lockedUntil`).
   - Registrar fallos con `toast.warning` explicando que la cuenta permanece segura.

5. **SEO / metadata:**
   - Actualizar `metadata` de `app/(auth)/login/page.tsx` agregando `keywords`, `openGraph` y `alternates` relevantes al proceso de autenticación.

**Criterios de Éxito:**
- ✅ Formulario con roles ARIA, ayudas contextuales y mensajes accesibles.
- ✅ Preferencia “Recordar sesión” funcional y respetando tokens existentes.
- ✅ Lógica de bloqueo tras intentos fallidos sin modificar API backend.
- ✅ Usuarios reciben guía y datos de contacto sin saturar la UI.

**Testing Manual:**
1. Probar teclado completo (Tab/Shift+Tab) confirmando orden lógico.
2. Activar lector de pantalla (NVDA/VoiceOver) y verificar lectura de errores.
3. Simular 3 intentos fallidos y confirmar bloqueo temporal y mensaje.
4. Activar “Recordar sesión”, recargar página y verificar precarga del usuario.

**Siguiente Paso:**
Fortalecer seguridad y auditoría en PROMPT 005-3.

---

### PROMPT 005-3: Endurecimiento de Seguridad y Auditoría de Autenticación (Backend + Frontend)

**Contexto:**
La API de autenticación (`backend/src/services/auth.service.ts`, `auth.controller.ts`) y el store `authStore.ts` funcionan correctamente, pero debemos elevar el nivel de protección (ISO/CEOs) con auditoría completa y controles de abuso.

**Objetivo:**
Implementar mecanismos de seguridad (rate-limiting, registro de accesos, bloqueo temporal) y exponer esa información al frontend para mantener a los usuarios informados.

**Instrucciones:**

1. **Rate limiting en login (Backend):**
   - Integrar middleware de rate limiting en `backend/src/routes/auth.routes.ts` usando `express-rate-limit` (añadir dependencia si no existe).
   - Configurar 10 solicitudes cada 15 minutos por IP; devolver mensaje claro y código 429.

2. **Registro de intentos fallidos:**
   - En `auth.service.ts`, cuando `bcrypt.compare` falle, registrar auditoría con `audit.service.log` (acción `LOGIN`, módulo `AUTH`, entityId = userId si existe o `unknown`).
   - Al iniciar sesión exitosamente, registrar auditoría `LOGIN` con metadatos (`ip`, `userAgent`).

3. **Bloqueo por múltiples intentos:**
   - Crear tabla `auth_locks` (o utilizar campo en `User` como `failedAttempts`, `lastFailedAt`) vía migración Prisma.
   - Incrementar contador en cada fallo y, si llega a 5 en 15 minutos, establecer `lockedUntil` (Date) 30 minutos.
   - En `login`, verificar `lockedUntil` y devolver error `“Cuenta bloqueada temporalmente”` hasta que expire; resetear contador al iniciar sesión exitosamente.

4. **Endpoint de estado de cuenta:**
   - Exponer `GET /auth/status` que retorne `{ failedAttempts, lockedUntil }` para el usuario autenticado.
   - Actualizar `authStore.checkAuth` para obtener y guardar esa información en estado (ej. `securityStatus`).

5. **Feedback en frontend:**
   - En `LoginForm`, si backend responde con bloqueo, mostrar `Alert` con countdown (`secondsRemaining`) usando `setInterval` y desactivar botón hasta finalizar.
   - Incluir ícono `ShieldAlert` de `lucide-react` para reforzar el mensaje.

**Criterios de Éxito:**
- ✅ Rate limit activo y retornando 429 ante abuso.
- ✅ Auditorías registran accesos y fallos con metadata.
- ✅ Usuarios bloqueados temporalmente reciben mensajes claros y countdown en frontend.
- ✅ Contadores se reinician tras login exitoso.

**Testing Manual:**
1. Intentar más de 10 logins fallidos desde la misma IP → recibir 429.
2. Provocar 5 fallos consecutivos para el mismo usuario → recibir bloqueo y ver countdown.
3. Verificar en tabla `audit_logs` registros de login (éxito/fallo).
4. Revisar logs para asegurarse de que no se exponen contraseñas u otros datos sensibles.

**Siguiente Paso:**
Con seguridad fortalecida, retomar flujo estándar en PROMPT 006 (gestión de usuarios backend).

---

## 🎯 FASE 2: MÓDULO DE ADMINISTRACIÓN

---

### PROMPT 006: Gestión de Usuarios - Backend (CRUD Completo)

**Contexto:**
El sistema de autenticación está funcionando. Ahora implementaremos el CRUD completo de usuarios con validaciones, paginación, filtros, y auditoría.

**Objetivo:**
Crear API completa para gestión de usuarios con todas las operaciones CRUD, validaciones, y seguridad.

**Instrucciones:**

1. **Crear servicio de usuarios (src/services/users.service.ts):**
   
   Implementar las siguientes funciones:
   
   - `getAllUsers(page, limit, filters)`: Listar usuarios con paginación
     * Paginación: page (default 1), limit (default 10)
     * Filtros: search (username, email, nombre), roleId, isActive
     * Ordenar por: createdAt DESC
     * Incluir información de rol
     * Excluir campo password
     * Retornar: { users, total, page, totalPages }
   
   - `getUserById(id)`: Obtener usuario por ID
     * Incluir información de rol
     * Excluir password
     * Lanzar error si no existe
   
   - `createUser(userData)`: Crear nuevo usuario
     * Validar username y email únicos
     * Hashear contraseña
     * Validar que roleId existe
     * Crear usuario
     * Registrar en auditoría
     * Retornar usuario sin password
   
   - `updateUser(id, userData)`: Actualizar usuario
     * No permitir cambiar username
     * Si cambia email, validar que sea único
     * Si cambia password, hashear nueva contraseña
     * Validar que roleId existe (si se cambia)
     * Actualizar usuario
     * Registrar en auditoría
     * Retornar usuario actualizado
   
   - `deleteUser(id)`: Eliminar usuario (soft delete)
     * Validar que usuario existe
     * Validar que no sea el usuario actual
     * Cambiar isActive a false
     * Registrar en auditoría
   
   - `searchUsers(query)`: Buscar usuarios
     * Buscar en: username, email, firstName, lastName
     * Búsqueda parcial (LIKE)
     * Retornar máximo 10 resultados

2. **Crear validaciones (src/utils/validators.ts):**
   
   Esquemas Joi para:
   
   - `createUserSchema`:
     ```typescript
     {
       username: Joi.string().min(3).max(50).required(),
       email: Joi.string().email().required(),
       password: Joi.string().min(8).required(),
       firstName: Joi.string().required(),
       lastName: Joi.string().required(),
       roleId: Joi.string().uuid().required()
     }
     ```
   
   - `updateUserSchema`:
     ```typescript
     {
       email: Joi.string().email().optional(),
       password: Joi.string().min(8).optional(),
       firstName: Joi.string().optional(),
       lastName: Joi.string().optional(),
       roleId: Joi.string().uuid().optional(),
       isActive: Joi.boolean().optional()
     }
     ```

3. **Crear controlador de usuarios (src/controllers/users.controller.ts):**
   
   Implementar:
   
   - `getAll`: GET /api/users
     * Query params: page, limit, search, roleId, isActive
     * Llamar a service.getAllUsers
     * Retornar 200 con datos
   
   - `getById`: GET /api/users/:id
     * Validar UUID
     * Llamar a service.getUserById
     * Retornar 200 con usuario
     * Retornar 404 si no existe
   
   - `create`: POST /api/users
     * Validar body con createUserSchema
     * Llamar a service.createUser
     * Retornar 201 con usuario creado
   
   - `update`: PUT /api/users/:id
     * Validar UUID
     * Validar body con updateUserSchema
     * Llamar a service.updateUser
     * Retornar 200 con usuario actualizado
   
   - `delete`: DELETE /api/users/:id
     * Validar UUID
     * Llamar a service.deleteUser
     * Retornar 204
   
   - `search`: GET /api/users/search
     * Query param: q (query)
     * Llamar a service.searchUsers
     * Retornar 200 con resultados

4. **Crear rutas de usuarios (src/routes/users.routes.ts):**
   
   ```
   GET    /api/users              - Listar usuarios (autenticado, admin)
   GET    /api/users/search       - Buscar usuarios (autenticado)
   GET    /api/users/:id          - Obtener usuario (autenticado)
   POST   /api/users              - Crear usuario (autenticado, admin)
   PUT    /api/users/:id          - Actualizar usuario (autenticado, admin)
   DELETE /api/users/:id          - Eliminar usuario (autenticado, admin)
   ```
   
   Aplicar middlewares:
   - authenticate en todas las rutas
   - authorize('Administrador') en create, update, delete

5. **Crear servicio de auditoría (src/services/audit.service.ts):**
   
   - `log(userId, action, module, entityType, entityId, oldValue, newValue, req)`:
     * Crear registro en AuditLog
     * Capturar IP y User Agent del request
     * Guardar valores antiguos y nuevos (para updates)

6. **Integrar auditoría en users.service:**
   
   - En createUser: log('USER_CREATED', ...)
   - En updateUser: log('USER_UPDATED', ..., oldUser, newUser)
   - En deleteUser: log('USER_DELETED', ...)

7. **Crear middleware de manejo de errores (src/middlewares/error.middleware.ts):**
   
   - Capturar errores de Prisma (unique constraint, not found, etc.)
   - Capturar errores de validación
   - Formatear respuestas de error consistentes
   - Logging de errores

8. **Integrar rutas en app.ts:**
   - Montar rutas de usuarios en /api/users

**Criterios de Éxito:**
- ✅ GET /api/users retorna lista paginada
- ✅ Filtros funcionan correctamente
- ✅ POST /api/users crea usuario
- ✅ Validaciones rechazan datos inválidos
- ✅ PUT /api/users/:id actualiza usuario
- ✅ DELETE /api/users/:id hace soft delete
- ✅ Búsqueda funciona correctamente
- ✅ Auditoría registra todas las acciones
- ✅ Solo admin puede crear/editar/eliminar
- ✅ Errores se manejan correctamente

**Testing Manual:**
```bash
# Listar usuarios
GET http://localhost:5001/api/users?page=1&limit=10
Authorization: Bearer [token]

# Crear usuario
POST http://localhost:5001/api/users
Authorization: Bearer [token]
{
  "username": "operador1",
  "email": "operador1@disa.gob.pe",
  "password": "Operador123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "roleId": "[roleId]"
}

# Actualizar usuario
PUT http://localhost:5001/api/users/[userId]
Authorization: Bearer [token]
{
  "firstName": "Juan Carlos"
}

# Eliminar usuario
DELETE http://localhost:5001/api/users/[userId]
Authorization: Bearer [token]
```

**Siguiente Paso:**
Con el backend de usuarios completo, procederemos con PROMPT 007 para crear la interfaz de gestión de usuarios en el frontend.

---

### PROMPT 007: Gestión de Usuarios - Frontend (Interfaz Completa)

**Contexto:**
La API de usuarios está funcionando. Ahora crearemos la interfaz completa de gestión de usuarios con tabla, formularios, búsqueda, y todas las operaciones CRUD.

**Objetivo:**
Implementar interfaz completa de gestión de usuarios con tabla paginada, formularios de creación/edición, búsqueda, y confirmaciones.

**Instrucciones:**

1. **Crear tipos TypeScript (types/user.types.ts):**
   
   ```typescript
   interface User {
     id: string;
     username: string;
     email: string;
     firstName: string;
     lastName: string;
     role: {
       id: string;
       name: string;
     };
     isActive: boolean;
     createdAt: string;
     updatedAt: string;
   }
   
   interface CreateUserData {
     username: string;
     email: string;
     password: string;
     firstName: string;
     lastName: string;
     roleId: string;
   }
   
   interface UpdateUserData {
     email?: string;
     password?: string;
     firstName?: string;
     lastName?: string;
     roleId?: string;
     isActive?: boolean;
   }
   ```

2. **Crear servicio de API de usuarios (lib/api/users.ts):**
   
   ```typescript
   export const usersApi = {
     getAll: (params) => api.get('/users', { params }),
     getById: (id) => api.get(`/users/${id}`),
     create: (data) => api.post('/users', data),
     update: (id, data) => api.put(`/users/${id}`, data),
     delete: (id) => api.delete(`/users/${id}`),
     search: (query) => api.get('/users/search', { params: { q: query } })
   };
   ```

3. **Crear hook personalizado (hooks/useUsers.ts):**
   
   ```typescript
   export function useUsers() {
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(false);
     const [pagination, setPagination] = useState({
       page: 1,
       limit: 10,
       total: 0,
       totalPages: 0
     });
     
     const fetchUsers = async (page = 1, filters = {}) => {
       // Implementar fetch con manejo de errores
     };
     
     const createUser = async (data: CreateUserData) => {
       // Implementar creación con toast
     };
     
     const updateUser = async (id: string, data: UpdateUserData) => {
       // Implementar actualización con toast
     };
     
     const deleteUser = async (id: string) => {
       // Implementar eliminación con confirmación y toast
     };
     
     return {
       users,
       loading,
       pagination,
       fetchUsers,
       createUser,
       updateUser,
       deleteUser
     };
   }
   ```

4. **Crear tabla de usuarios (components/users/UsersTable.tsx):**
   
   Componente con:
   
   - Tabla usando shadcn/ui Table
   - Columnas:
     * Username
     * Nombre completo
     * Email
     * Rol
     * Estado (badge: activo/inactivo)
     * Fecha de creación
     * Acciones (editar, eliminar)
   
   - Paginación:
     * Botones anterior/siguiente
     * Selector de items por página
     * Mostrar "Mostrando X-Y de Z"
   
   - Acciones:
     * Botón editar (icono lápiz)
     * Botón eliminar (icono basura)
     * Tooltips en botones
   
   - Estados:
     * Loading skeleton
     * Empty state (sin usuarios)
     * Error state

5. **Crear formulario de usuario (components/users/UserForm.tsx):**
   
   Formulario con react-hook-form + zod:
   
   - Campos:
     * Username (solo en creación, disabled en edición)
     * Email
     * Password (solo en creación, opcional en edición)
     * Nombre
     * Apellido
     * Rol (select)
     * Estado (switch activo/inactivo, solo en edición)
   
   - Validaciones:
     * Username: min 3, max 50
     * Email: formato válido
     * Password: min 8 (si se proporciona)
     * Todos los campos requeridos excepto password en edición
   
   - Props:
     * mode: 'create' | 'edit'
     * initialData?: User
     * onSubmit: (data) => void
     * onCancel: () => void
   
   - Diseño:
     * Grid de 2 columnas
     * Labels claros
     * Mensajes de error bajo cada campo
     * Botones: Guardar, Cancelar

6. **Crear modal de usuario (components/users/UserModal.tsx):**
   
   - Usar Dialog de shadcn/ui
   - Props:
     * open: boolean
     * onClose: () => void
     * mode: 'create' | 'edit'
     * user?: User
     * onSave: (data) => void
   
   - Contenido:
     * Título dinámico: "Crear Usuario" / "Editar Usuario"
     * UserForm dentro del modal
     * Cerrar al guardar exitosamente

7. **Crear modal de confirmación (components/shared/ConfirmDialog.tsx):**
   
   - Componente reutilizable
   - Props:
     * open: boolean
     * title: string
     * message: string
     * onConfirm: () => void
     * onCancel: () => void
     * variant: 'danger' | 'warning' | 'info'
   
   - Diseño:
     * Icono según variant
     * Botones con colores según variant
     * Botón de confirmar con loading state

8. **Crear barra de búsqueda y filtros (components/users/UsersFilters.tsx):**
   
   - Input de búsqueda con icono
   - Debounce de 500ms
   - Select de rol (todos, admin, operador, consultor)
   - Select de estado (todos, activos, inactivos)
   - Botón limpiar filtros

9. **Crear página de usuarios (app/(dashboard)/admin/usuarios/page.tsx):**
   
   Integrar todo:
   
   ```typescript
   export default function UsuariosPage() {
     const { users, loading, pagination, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
     const [modalOpen, setModalOpen] = useState(false);
     const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
     const [selectedUser, setSelectedUser] = useState<User | null>(null);
     const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
     const [userToDelete, setUserToDelete] = useState<string | null>(null);
     
     // Implementar handlers
     
     return (
       <div>
         <header>
           <h1>Gestión de Usuarios</h1>
           <Button onClick={() => openCreateModal()}>
             Crear Usuario
           </Button>
         </header>
         
         <UsersFilters onFilter={handleFilter} />
         
         <UsersTable
           users={users}
           loading={loading}
           pagination={pagination}
           onEdit={openEditModal}
           onDelete={openDeleteDialog}
           onPageChange={handlePageChange}
         />
         
         <UserModal
           open={modalOpen}
           mode={modalMode}
           user={selectedUser}
           onClose={closeModal}
           onSave={handleSave}
         />
         
         <ConfirmDialog
           open={deleteDialogOpen}
           title="Eliminar Usuario"
           message="¿Está seguro de eliminar este usuario?"
           variant="danger"
           onConfirm={handleDelete}
           onCancel={closeDeleteDialog}
         />
       </div>
     );
   }
   ```

10. **Agregar ruta al sidebar:**
    - En Sidebar.tsx, agregar enlace a /admin/usuarios
    - Solo visible para rol Administrador
    - Icono de usuarios

**Criterios de Éxito:**
- ✅ Tabla muestra usuarios correctamente
- ✅ Paginación funciona
- ✅ Búsqueda filtra usuarios
- ✅ Filtros por rol y estado funcionan
- ✅ Modal de crear usuario funciona
- ✅ Modal de editar usuario carga datos
- ✅ Validaciones muestran errores
- ✅ Crear usuario exitoso muestra toast
- ✅ Editar usuario actualiza tabla
- ✅ Eliminar usuario muestra confirmación
- ✅ Eliminar usuario exitoso actualiza tabla
- ✅ Loading states funcionan
- ✅ Error handling funciona

**Testing Manual:**
1. Ir a /admin/usuarios
2. Verificar que tabla carga usuarios
3. Probar paginación
4. Buscar usuario por nombre
5. Filtrar por rol
6. Crear nuevo usuario
7. Editar usuario existente
8. Eliminar usuario (confirmar)
9. Verificar toasts de éxito/error

**Siguiente Paso:**
Con la gestión de usuarios completa, procederemos con PROMPT 008 para implementar la gestión de roles y permisos.

---

### PROMPT 008: Gestión de Roles y Tipologías Documentales (Backend)

**Contexto:**
La gestión de usuarios está completa. Ahora implementaremos la gestión de roles, oficinas, tipos de documentos, y periodos.

**Objetivo:**
Crear APIs completas para gestión de roles y todas las tipologías documentales del sistema.

**Instrucciones:**

1. **Crear servicio de roles (src/services/roles.service.ts):**
   
   - `getAllRoles()`: Listar todos los roles
   - `getRoleById(id)`: Obtener rol por ID
   - `createRole(data)`: Crear nuevo rol
   - `updateRole(id, data)`: Actualizar rol
   - `deleteRole(id)`: Eliminar rol (validar que no tenga usuarios)

2. **Crear servicio de oficinas (src/services/offices.service.ts):**
   
   - `getAllOffices(filters)`: Listar oficinas con filtros
   - `getOfficeById(id)`: Obtener oficina por ID
   - `createOffice(data)`: Crear oficina (generar código automático)
   - `updateOffice(id, data)`: Actualizar oficina
   - `deleteOffice(id)`: Soft delete (validar sin documentos)
   - `searchOffices(query)`: Buscar oficinas

3. **Crear servicio de tipos de documentos (src/services/document-types.service.ts):**
   
   - `getAllDocumentTypes(filters)`: Listar tipos
   - `getDocumentTypeById(id)`: Obtener tipo por ID
   - `createDocumentType(data)`: Crear tipo (generar código)
   - `updateDocumentType(id, data)`: Actualizar tipo
   - `deleteDocumentType(id)`: Soft delete (validar sin documentos)
   - `searchDocumentTypes(query)`: Buscar tipos

4. **Crear servicio de periodos (src/services/periods.service.ts):**
   
   - `getAllPeriods()`: Listar periodos ordenados por año DESC
   - `getPeriodById(id)`: Obtener periodo por ID
   - `createPeriod(data)`: Crear periodo (validar año único)
   - `updatePeriod(id, data)`: Actualizar periodo
   - `deletePeriod(id)`: Soft delete (validar sin archivadores)

5. **Crear controladores para cada entidad:**
   
   - src/controllers/roles.controller.ts
   - src/controllers/offices.controller.ts
   - src/controllers/document-types.controller.ts
   - src/controllers/periods.controller.ts
   
   Cada uno con operaciones CRUD estándar

6. **Crear validaciones para cada entidad:**
   
   En src/utils/validators.ts:
   
   - roleSchema: name, description, permissions (JSON)
   - officeSchema: name, description
   - documentTypeSchema: name, description
   - periodSchema: year (número de 4 dígitos), description

7. **Crear rutas para cada entidad:**
   
   ```
   /api/roles
   /api/offices
   /api/document-types
   /api/periods
   ```
   
   Todas protegidas con authenticate
   Create/Update/Delete solo para Administrador

8. **Implementar generación automática de códigos:**
   
   - Oficinas: Obtener último código, incrementar (001, 002, ...)
   - Tipos de documentos: Similar a oficinas
   - Formato: String con padding (ej: "001", "002", ...)

9. **Integrar auditoría en todos los servicios:**
   
   - Registrar creación, actualización, eliminación
   - Incluir valores antiguos y nuevos

10. **Integrar todas las rutas en app.ts**

**Criterios de Éxito:**
- ✅ CRUD de roles funciona
- ✅ CRUD de oficinas funciona
- ✅ CRUD de tipos de documentos funciona
- ✅ CRUD de periodos funciona
- ✅ Códigos se generan automáticamente
- ✅ Validaciones funcionan
- ✅ Soft delete valida dependencias
- ✅ Búsquedas funcionan
- ✅ Auditoría registra acciones
- ✅ Solo admin puede modificar

**Testing Manual:**
Probar cada endpoint con Postman/Thunder Client

**Siguiente Paso:**
Con las APIs de tipologías completas, procederemos con PROMPT 008-1 para crear la interfaz frontend de gestión de roles.

---

### PROMPT 008-1: Gestión de Roles (Frontend)

**Contexto:**
La API de roles del backend está completa y funcionando. Ahora necesitamos implementar la interfaz frontend completa para gestionar roles, incluyendo la configuración de permisos de manera visual e intuitiva.

**Objetivo:**
Crear la interfaz completa de gestión de roles con tabla, formularios, editor visual de permisos, y todas las operaciones CRUD necesarias para administrar roles y sus permisos.

**Instrucciones:**

1. **Completar tipos TypeScript (types/user.types.ts):**
   
   Agregar o completar las interfaces de Role:
   
   ```typescript
   export interface Permission {
     module: string;
     actions: {
       view?: boolean;
       create?: boolean;
       update?: boolean;
       delete?: boolean;
       export?: boolean;
       approve?: boolean;
       sign?: boolean;
     };
   }
   
   export interface Role {
     id: string;
     name: string;
     description: string | null;
     permissions: Record<string, any>;
     createdAt: string;
     updatedAt: string;
     _count?: {
       users: number;
     };
   }
   
   export interface CreateRoleData {
     name: string;
     description?: string;
     permissions: Record<string, any>;
   }
   
   export interface UpdateRoleData {
     name?: string;
     description?: string;
     permissions?: Record<string, any>;
   }
   ```

2. **Completar servicio de API de roles (lib/api/roles.ts):**
   
   Expandir el servicio existente con todos los métodos CRUD:
   
   ```typescript
   import api from '../api';
   import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
   
   interface RolesResponse {
     status: string;
     message: string;
     data: Role[];
   }
   
   interface RoleResponse {
     status: string;
     message: string;
     data: Role;
   }
   
   export const rolesApi = {
     getAll: () => api.get<RolesResponse>('/roles'),
     
     getById: (id: string) => api.get<RoleResponse>(`/roles/${id}`),
     
     create: (data: CreateRoleData) => api.post<RoleResponse>('/roles', data),
     
     update: (id: string, data: UpdateRoleData) => 
       api.put<RoleResponse>(`/roles/${id}`, data),
     
     delete: (id: string) => api.delete(`/roles/${id}`)
   };
   ```

3. **Crear hook personalizado (hooks/useRoles.ts):**
   
   ```typescript
   import { useState, useEffect } from 'react';
   import { rolesApi } from '@/lib/api/roles';
   import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
   import toast from 'react-hot-toast';
   
   export function useRoles() {
     const [roles, setRoles] = useState<Role[]>([]);
     const [loading, setLoading] = useState(false);
     
     const fetchRoles = async () => {
       setLoading(true);
       try {
         const response = await rolesApi.getAll();
         setRoles(response.data.data);
       } catch (error) {
         toast.error('Error al cargar roles');
         console.error(error);
       } finally {
         setLoading(false);
       }
     };
     
     const createRole = async (data: CreateRoleData) => {
       try {
         const response = await rolesApi.create(data);
         toast.success('Rol creado correctamente');
         await fetchRoles();
         return response.data.data;
       } catch (error: any) {
         const message = error.response?.data?.message || 'Error al crear rol';
         toast.error(message);
         throw error;
       }
     };
     
     const updateRole = async (id: string, data: UpdateRoleData) => {
       try {
         const response = await rolesApi.update(id, data);
         toast.success('Rol actualizado correctamente');
         await fetchRoles();
         return response.data.data;
       } catch (error: any) {
         const message = error.response?.data?.message || 'Error al actualizar rol';
         toast.error(message);
         throw error;
       }
     };
     
     const deleteRole = async (id: string) => {
       try {
         await rolesApi.delete(id);
         toast.success('Rol eliminado correctamente');
         await fetchRoles();
       } catch (error: any) {
         const message = error.response?.data?.message || 'Error al eliminar rol';
         toast.error(message);
         throw error;
       }
     };
     
     useEffect(() => {
       fetchRoles();
     }, []);
     
     return {
       roles,
       loading,
       fetchRoles,
       createRole,
       updateRole,
       deleteRole
     };
   }
   ```

4. **Crear componente de editor de permisos (components/roles/PermissionsEditor.tsx):**
   
   Componente visual para configurar permisos por módulo:
   
   - Estructura:
     * Grid o tabla con módulos del sistema
     * Checkboxes para cada acción (ver, crear, editar, eliminar, etc.)
     * Secciones agrupadas por tipo de módulo
   
   - Módulos del sistema:
     * **Administración:**
       - Usuarios (view, create, update, delete)
       - Roles (view, create, update, delete)
       - Oficinas (view, create, update, delete)
       - Tipos de Documento (view, create, update, delete)
       - Periodos (view, create, update, delete)
       - Auditoría (view, export)
     
     * **Archivo Digital:**
       - Archivadores (view, create, update, delete)
       - Documentos (view, create, update, delete, download, export)
     
     * **Consultas:**
       - Búsqueda (view, export)
       - Reportes (view, generate, export)
     
     * **Firma Digital:**
       - Firmar Documentos (view, sign)
       - Flujos de Firma (view, create, update, delete, approve)
   
   - Props:
     * permissions: Record<string, any>
     * onChange: (permissions: Record<string, any>) => void
   
   - Features:
     * Seleccionar/deseleccionar todo un módulo
     * Seleccionar/deseleccionar todas las acciones
     * Indicador visual de permisos heredados
     * Tooltips explicativos para cada permiso
     * Diseño limpio con shadcn/ui components

5. **Crear tabla de roles (components/roles/RolesTable.tsx):**
   
   Componente con:
   
   - Tabla usando shadcn/ui Table
   - Columnas:
     * Nombre del rol
     * Descripción
     * Usuarios asignados (count)
     * Fecha de creación
     * Acciones (editar, eliminar)
   
   - Features:
     * Badge con color según tipo de rol (admin, operador, consultor)
     * Tooltip mostrando cantidad de usuarios
     * Botón editar con icono lápiz
     * Botón eliminar con icono basura (deshabilitado si tiene usuarios)
     * Loading skeleton mientras carga
     * Empty state si no hay roles
   
   - Props:
     * roles: Role[]
     * loading: boolean
     * onEdit: (role: Role) => void
     * onDelete: (role: Role) => void

6. **Crear formulario de rol (components/roles/RoleForm.tsx):**
   
   Formulario con react-hook-form + zod:
   
   - Campos:
     * Nombre (requerido, min 3, max 50)
     * Descripción (opcional, textarea, max 200)
     * Permisos (PermissionsEditor)
   
   - Validaciones:
     ```typescript
     const roleSchema = z.object({
       name: z.string()
         .min(3, 'Mínimo 3 caracteres')
         .max(50, 'Máximo 50 caracteres'),
       description: z.string()
         .max(200, 'Máximo 200 caracteres')
         .optional()
         .or(z.literal('')),
       permissions: z.record(z.any())
     });
     ```
   
   - Props:
     * mode: 'create' | 'edit'
     * initialData?: Role
     * onSubmit: (data: CreateRoleData | UpdateRoleData) => void
     * onCancel: () => void
   
   - Diseño:
     * Layout de dos secciones: Info básica + Permisos
     * Tabs o acordeón para organizar permisos por categoría
     * Botones: Guardar, Cancelar
     * Loading state en botón de guardar

7. **Crear modal de rol (components/roles/RoleModal.tsx):**
   
   - Usar Dialog de shadcn/ui
   - Props:
     * open: boolean
     * onClose: () => void
     * mode: 'create' | 'edit'
     * role?: Role
     * onSave: (data: CreateRoleData | UpdateRoleData) => void
   
   - Contenido:
     * Título dinámico: "Crear Rol" / "Editar Rol"
     * RoleForm dentro del modal
     * Ancho amplio para editor de permisos (max-w-4xl)
     * Cerrar al guardar exitosamente

8. **Crear vista previa de permisos (components/roles/PermissionsPreview.tsx):**
   
   Componente para mostrar permisos en modo lectura:
   
   - Mostrar módulos con sus permisos activos
   - Usar badges o chips para cada permiso
   - Agrupar por categoría
   - Usar en tooltip o dropdown al pasar mouse sobre rol

9. **Crear página de roles (app/dashboard/admin/roles/page.tsx):**
   
   Integrar todos los componentes:
   
   ```typescript
   'use client';
   
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   import { Plus } from 'lucide-react';
   import { useRoles } from '@/hooks/useRoles';
   import RolesTable from '@/components/roles/RolesTable';
   import RoleModal from '@/components/roles/RoleModal';
   import ConfirmDialog from '@/components/shared/ConfirmDialog';
   import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
   
   export default function RolesPage() {
     const { roles, loading, createRole, updateRole, deleteRole } = useRoles();
     const [modalOpen, setModalOpen] = useState(false);
     const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
     const [selectedRole, setSelectedRole] = useState<Role | null>(null);
     const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
     const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
     
     const openCreateModal = () => {
       setModalMode('create');
       setSelectedRole(null);
       setModalOpen(true);
     };
     
     const openEditModal = (role: Role) => {
       setModalMode('edit');
       setSelectedRole(role);
       setModalOpen(true);
     };
     
     const closeModal = () => {
       setModalOpen(false);
       setSelectedRole(null);
     };
     
     const handleSave = async (data: CreateRoleData | UpdateRoleData) => {
       if (modalMode === 'create') {
         await createRole(data as CreateRoleData);
       } else if (selectedRole) {
         await updateRole(selectedRole.id, data);
       }
       closeModal();
     };
     
     const openDeleteDialog = (role: Role) => {
       if (role._count && role._count.users > 0) {
         toast.error('No se puede eliminar un rol con usuarios asignados');
         return;
       }
       setRoleToDelete(role);
       setDeleteDialogOpen(true);
     };
     
     const closeDeleteDialog = () => {
       setDeleteDialogOpen(false);
       setRoleToDelete(null);
     };
     
     const handleDelete = async () => {
       if (roleToDelete) {
         await deleteRole(roleToDelete.id);
         closeDeleteDialog();
       }
     };
     
     return (
       <div className="container mx-auto py-6 space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold tracking-tight">
               Gestión de Roles
             </h1>
             <p className="text-muted-foreground mt-2">
               Administra los roles y permisos del sistema
             </p>
           </div>
           <Button onClick={openCreateModal}>
             <Plus className="mr-2 h-4 w-4" />
             Crear Rol
           </Button>
         </div>
         
         {/* Tabla de roles */}
         <RolesTable
           roles={roles}
           loading={loading}
           onEdit={openEditModal}
           onDelete={openDeleteDialog}
         />
         
         {/* Modal crear/editar */}
         <RoleModal
           open={modalOpen}
           mode={modalMode}
           role={selectedRole}
           onClose={closeModal}
           onSave={handleSave}
         />
         
         {/* Dialog confirmación eliminar */}
         <ConfirmDialog
           open={deleteDialogOpen}
           title="Eliminar Rol"
           message={`¿Está seguro de eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
           variant="danger"
           onConfirm={handleDelete}
           onCancel={closeDeleteDialog}
         />
       </div>
     );
   }
   ```

10. **Actualizar Sidebar (components/layout/Sidebar.tsx):**
    
    Agregar enlace a gestión de roles en la sección Administración:
    
    ```typescript
    {/* Sección Administración - Solo para Administrador */}
    {user?.role?.name === 'Administrador' && (
      <>
        <SidebarItem
          href="/dashboard/admin/usuarios"
          icon={Users}
          label="Usuarios"
          active={pathname === '/dashboard/admin/usuarios'}
        />
        <SidebarItem
          href="/dashboard/admin/roles"
          icon={Shield}  // Importar Shield de lucide-react
          label="Roles y Permisos"
          active={pathname === '/dashboard/admin/roles'}
        />
        <SidebarItem
          href="/dashboard/admin/oficinas"
          icon={Building}
          label="Oficinas"
          active={pathname === '/dashboard/admin/oficinas'}
        />
        {/* ... resto de items de administración */}
      </>
    )}
    ```

11. **Crear plantilla de permisos por defecto (lib/constants/permissions.ts):**
    
    ```typescript
    export const PERMISSION_MODULES = {
      // Administración
      users: {
        label: 'Usuarios',
        category: 'Administración',
        actions: ['view', 'create', 'update', 'delete']
      },
      roles: {
        label: 'Roles y Permisos',
        category: 'Administración',
        actions: ['view', 'create', 'update', 'delete']
      },
      offices: {
        label: 'Oficinas',
        category: 'Administración',
        actions: ['view', 'create', 'update', 'delete']
      },
      documentTypes: {
        label: 'Tipos de Documento',
        category: 'Administración',
        actions: ['view', 'create', 'update', 'delete']
      },
      periods: {
        label: 'Periodos',
        category: 'Administración',
        actions: ['view', 'create', 'update', 'delete']
      },
      audit: {
        label: 'Auditoría',
        category: 'Administración',
        actions: ['view', 'export']
      },
      
      // Archivo Digital
      archivadores: {
        label: 'Archivadores',
        category: 'Archivo Digital',
        actions: ['view', 'create', 'update', 'delete']
      },
      documents: {
        label: 'Documentos',
        category: 'Archivo Digital',
        actions: ['view', 'create', 'update', 'delete', 'download', 'export']
      },
      
      // Consultas
      search: {
        label: 'Búsqueda de Documentos',
        category: 'Consultas',
        actions: ['view', 'export']
      },
      reports: {
        label: 'Reportes',
        category: 'Consultas',
        actions: ['view', 'generate', 'export']
      },
      
      // Firma Digital
      signing: {
        label: 'Firmar Documentos',
        category: 'Firma Digital',
        actions: ['view', 'sign']
      },
      signatureFlows: {
        label: 'Flujos de Firma',
        category: 'Firma Digital',
        actions: ['view', 'create', 'update', 'delete', 'approve']
      }
    };
    
    export const ACTION_LABELS = {
      view: 'Ver',
      create: 'Crear',
      update: 'Editar',
      delete: 'Eliminar',
      download: 'Descargar',
      export: 'Exportar',
      generate: 'Generar',
      sign: 'Firmar',
      approve: 'Aprobar'
    };
    
    // Plantillas de permisos predefinidas
    export const DEFAULT_PERMISSIONS = {
      Administrador: {
        // Acceso total a todo
        users: { view: true, create: true, update: true, delete: true },
        roles: { view: true, create: true, update: true, delete: true },
        offices: { view: true, create: true, update: true, delete: true },
        documentTypes: { view: true, create: true, update: true, delete: true },
        periods: { view: true, create: true, update: true, delete: true },
        audit: { view: true, export: true },
        archivadores: { view: true, create: true, update: true, delete: true },
        documents: { view: true, create: true, update: true, delete: true, download: true, export: true },
        search: { view: true, export: true },
        reports: { view: true, generate: true, export: true },
        signing: { view: true, sign: true },
        signatureFlows: { view: true, create: true, update: true, delete: true, approve: true }
      },
      
      Operador: {
        // Acceso para operaciones del archivo
        users: { view: true },
        offices: { view: true },
        documentTypes: { view: true },
        periods: { view: true },
        archivadores: { view: true, create: true, update: true },
        documents: { view: true, create: true, update: true, download: true, export: true },
        search: { view: true, export: true },
        reports: { view: true, generate: true, export: true },
        signing: { view: true, sign: true },
        signatureFlows: { view: true }
      },
      
      Consultor: {
        // Solo consulta
        documents: { view: true, download: true },
        search: { view: true },
        reports: { view: true, generate: true, export: true }
      }
    };
    ```

**Criterios de Éxito:**
- ✅ Página de roles se muestra correctamente en /dashboard/admin/roles
- ✅ Tabla muestra roles con información completa
- ✅ Modal de crear rol funciona correctamente
- ✅ Modal de editar rol carga datos existentes
- ✅ Editor de permisos es intuitivo y funcional
- ✅ Validaciones de formulario funcionan
- ✅ Crear rol guarda correctamente en base de datos
- ✅ Editar rol actualiza correctamente
- ✅ No se puede eliminar rol con usuarios asignados
- ✅ Eliminar rol sin usuarios funciona
- ✅ Toasts de éxito/error se muestran apropiadamente
- ✅ Loading states funcionan en tabla y formularios
- ✅ Enlace en sidebar funciona y solo visible para admin
- ✅ Permisos se guardan en formato JSON correcto
- ✅ Vista previa de permisos es clara y legible

**Testing Manual:**

1. **Acceso y navegación:**
   ```
   - Ingresar como Administrador
   - Ir a /dashboard/admin/roles
   - Verificar que tabla carga roles existentes
   - Verificar que muestra count de usuarios por rol
   ```

2. **Crear nuevo rol:**
   ```
   - Clic en "Crear Rol"
   - Ingresar nombre: "Supervisor"
   - Ingresar descripción: "Rol de supervisión de documentos"
   - Configurar permisos:
     * Módulo Documentos: view, update, download
     * Módulo Búsqueda: view
     * Módulo Reportes: view, generate
   - Guardar
   - Verificar toast de éxito
   - Verificar que aparece en tabla
   ```

3. **Editar rol existente:**
   ```
   - Clic en editar rol "Operador"
   - Modificar descripción
   - Agregar permiso de exportar documentos
   - Guardar
   - Verificar actualización en tabla
   ```

4. **Validaciones:**
   ```
   - Intentar crear rol con nombre vacío → Ver error
   - Intentar crear rol con nombre duplicado → Ver error
   - Intentar crear rol sin permisos → Permitir pero advertir
   ```

5. **Eliminar rol:**
   ```
   - Intentar eliminar rol con usuarios → Ver mensaje de error
   - Crear rol de prueba sin usuarios
   - Eliminar rol de prueba
   - Verificar confirmación
   - Confirmar eliminación
   - Verificar que desaparece de tabla
   ```

6. **Editor de permisos:**
   ```
   - Abrir modal de crear/editar
   - Marcar permiso "Ver" en módulo Usuarios
   - Verificar que checkbox se marca
   - Marcar "Crear" sin marcar "Ver" → Debe auto-marcar "Ver"
   - Desmarcar categoría completa → Verificar que desmarca todos
   - Seleccionar plantilla predefinida → Verificar carga correcta
   ```

7. **Verificación en backend:**
   ```
   - Después de crear/editar rol, verificar en base de datos
   - Comprobar que permisos se guardan en formato JSON
   - Verificar estructura de permisos
   - Comprobar auditoría de cambios
   ```

**Siguiente Paso:**
Con la gestión de roles completa en frontend, procederemos con PROMPT 009 para crear las interfaces de gestión de tipologías documentales (oficinas, tipos de documento, periodos).

---

### PROMPT 009: Gestión de Tipologías Documentales (Frontend)

**Contexto:**
Las APIs de tipologías están funcionando. Ahora crearemos las interfaces para gestionar oficinas, tipos de documentos, y periodos.

**Objetivo:**
Implementar interfaces completas de gestión para todas las tipologías documentales con tablas, formularios, y operaciones CRUD.

**Instrucciones:**

1. **Crear tipos TypeScript (types/typologies.types.ts):**
   
   ```typescript
   interface Office {
     id: string;
     code: string;
     name: string;
     description?: string;
     isActive: boolean;
     createdAt: string;
   }
   
   interface DocumentType {
     id: string;
     code: string;
     name: string;
     description?: string;
     isActive: boolean;
     createdAt: string;
   }
   
   interface Period {
     id: string;
     year: number;
     description?: string;
     isActive: boolean;
     createdAt: string;
   }
   ```

2. **Crear servicios de API:**
   
   - lib/api/offices.ts
   - lib/api/document-types.ts
   - lib/api/periods.ts
   
   Cada uno con métodos: getAll, getById, create, update, delete, search

3. **Crear hooks personalizados:**
   
   - hooks/useOffices.ts
   - hooks/useDocumentTypes.ts
   - hooks/usePeriods.ts
   
   Similar a useUsers, con operaciones CRUD

4. **Crear componentes reutilizables:**
   
   **TypologyTable.tsx** (componente genérico):
   - Props: data, columns, loading, onEdit, onDelete, onPageChange
   - Tabla con paginación
   - Acciones de editar/eliminar
   - Loading skeleton
   
   **TypologyForm.tsx** (componente genérico):
   - Props: fields, initialData, onSubmit, onCancel
   - Formulario dinámico según fields
   - Validaciones con zod

5. **Crear páginas específicas:**
   
   **app/(dashboard)/admin/oficinas/page.tsx:**
   - Tabla de oficinas
   - Formulario: nombre, descripción
   - Código se genera automáticamente (mostrar en tabla)
   - Búsqueda por nombre o código
   - Filtro por estado
   
   **app/(dashboard)/admin/tipos-documento/page.tsx:**
   - Tabla de tipos de documentos
   - Formulario: nombre, descripción
   - Código automático
   - Búsqueda y filtros
   
   **app/(dashboard)/admin/periodos/page.tsx:**
   - Tabla de periodos
   - Formulario: año, descripción
   - Validar año (4 dígitos, no futuro)
   - Ordenar por año descendente

6. **Agregar rutas al sidebar:**
   
   En Sidebar.tsx, agregar sección "Administración":
   - Usuarios
   - Oficinas
   - Tipos de Documento
   - Periodos
   
   Solo visible para Administrador

7. **Implementar validaciones específicas:**
   
   - Oficinas: nombre requerido, descripción opcional
   - Tipos: nombre requerido, descripción opcional
   - Periodos: año requerido (4 dígitos), descripción opcional

8. **Crear componente de código automático:**
   
   - Mostrar código generado en tabla
   - Indicar que es automático en formulario
   - Formato: "001", "002", etc.

**Criterios de Éxito:**
- ✅ Gestión de oficinas completa
- ✅ Gestión de tipos de documentos completa
- ✅ Gestión de periodos completa
- ✅ Códigos se muestran correctamente
- ✅ Formularios validan correctamente
- ✅ CRUD funciona en todas las tipologías
- ✅ Búsquedas funcionan
- ✅ Filtros funcionan
- ✅ Toasts de éxito/error
- ✅ Confirmaciones de eliminación

**Testing Manual:**
1. Crear oficina → Verificar código automático
2. Editar oficina → Verificar que código no cambia
3. Eliminar oficina → Verificar confirmación
4. Repetir para tipos de documentos
5. Repetir para periodos
6. Probar búsquedas y filtros

**Siguiente Paso:**
Con las tipologías completas, procederemos con PROMPT 010 para implementar el sistema de auditoría.

---

### PROMPT 010: Sistema de Auditoría (Backend + Frontend)

**Contexto:**
Todas las operaciones están registrando auditoría. Ahora crearemos la interfaz para consultar y visualizar los logs de auditoría.

**Objetivo:**
Implementar sistema completo de consulta de auditoría con filtros avanzados, visualización detallada, y exportación.

**Instrucciones:**

**BACKEND:**

1. **Crear servicio de auditoría (src/services/audit.service.ts):**
   
   Agregar funciones de consulta:
   
   - `getAuditLogs(filters, pagination)`:
     * Filtros: userId, action, module, dateFrom, dateTo
     * Paginación: page, limit
     * Ordenar por: createdAt DESC
     * Incluir información de usuario
     * Retornar: { logs, total, page, totalPages }
   
   - `getAuditLogById(id)`: Obtener log específico con detalles
   
   - `getAuditStats()`: Estadísticas de auditoría
     * Total de acciones por módulo
     * Acciones por usuario
     * Acciones por día (últimos 30 días)
   
   - `exportAuditLogs(filters, format)`: Exportar logs
     * Formatos: CSV, Excel
     * Aplicar filtros
     * Retornar archivo

2. **Crear controlador de auditoría (src/controllers/audit.controller.ts):**
   
   - `getAll`: GET /api/audit
   - `getById`: GET /api/audit/:id
   - `getStats`: GET /api/audit/stats
   - `export`: GET /api/audit/export

3. **Crear rutas de auditoría (src/routes/audit.routes.ts):**
   
   ```
   GET /api/audit              - Listar logs (admin)
   GET /api/audit/stats        - Estadísticas (admin)
   GET /api/audit/:id          - Detalle de log (admin)
   GET /api/audit/export       - Exportar logs (admin)
   ```
   
   Solo accesible para Administrador

**FRONTEND:**

4. **Crear tipos (types/audit.types.ts):**
   
   ```typescript
   interface AuditLog {
     id: string;
     user: {
       id: string;
       username: string;
       fullName: string;
     };
     action: string;
     module: string;
     entityType: string;
     entityId: string;
     oldValue?: any;
     newValue?: any;
     ipAddress: string;
     userAgent: string;
     createdAt: string;
   }
   ```

5. **Crear servicio de API (lib/api/audit.ts):**
   
   - getAll(filters, pagination)
   - getById(id)
   - getStats()
   - export(filters, format)

6. **Crear hook (hooks/useAudit.ts):**
   
   - fetchLogs
   - fetchStats
   - exportLogs

7. **Crear componente de filtros (components/audit/AuditFilters.tsx):**
   
   Filtros:
   - Búsqueda por usuario (autocomplete)
   - Select de acción (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.)
   - Select de módulo (USERS, DOCUMENTS, OFFICES, etc.)
   - Rango de fechas (DatePicker)
   - Botón limpiar filtros
   - Botón exportar

8. **Crear tabla de auditoría (components/audit/AuditTable.tsx):**
   
   Columnas:
   - Fecha y hora
   - Usuario
   - Acción
   - Módulo
   - Entidad
   - IP
   - Botón ver detalles
   
   Features:
   - Paginación
   - Ordenamiento
   - Loading state
   - Color coding por tipo de acción

9. **Crear modal de detalles (components/audit/AuditDetailModal.tsx):**
   
   Mostrar:
   - Información completa del log
   - Valores anteriores (si aplica)
   - Valores nuevos (si aplica)
   - Diff visual de cambios
   - User Agent completo
   - Timestamp exacto

10. **Crear página de auditoría (app/(dashboard)/admin/auditoria/page.tsx):**
    
    Integrar:
    - AuditFilters
    - AuditTable
    - AuditDetailModal
    - Estadísticas en cards (total acciones, usuarios activos, etc.)

11. **Crear visualizaciones (components/audit/AuditCharts.tsx):**
    
    Usar recharts para:
    - Gráfico de líneas: Acciones por día
    - Gráfico de barras: Acciones por módulo
    - Gráfico circular: Distribución de acciones

12. **Agregar ruta al sidebar:**
    - Auditoría (solo admin)
    - Icono de escudo o lista

**Criterios de Éxito:**
- ✅ Tabla de auditoría muestra logs
- ✅ Filtros funcionan correctamente
- ✅ Paginación funciona
- ✅ Modal de detalles muestra información completa
- ✅ Diff de cambios se visualiza correctamente
- ✅ Exportación a CSV/Excel funciona
- ✅ Estadísticas se calculan correctamente
- ✅ Gráficos se renderizan
- ✅ Solo admin puede acceder

**Testing Manual:**
1. Realizar varias acciones en el sistema
2. Ir a /admin/auditoria
3. Verificar que logs aparecen
4. Filtrar por usuario
5. Filtrar por fecha
6. Ver detalles de un log
7. Exportar logs
8. Verificar estadísticas

**Siguiente Paso:**
Con el módulo de administración completo, procederemos con PROMPT 010-1 para mejorar profesionalmente la interfaz y funcionalidades del módulo de administración.

---

## 🎯 PROMPTS DE MEJORA Y PERFECCIONAMIENTO DE LA FASE 2

**NOTA IMPORTANTE:** Los siguientes prompts (010-1 a 010-5) están diseñados para mejorar profesionalmente el Módulo de Administración ya implementado, siguiendo el diseño moderno del módulo de Reportes y Analítica, cumpliendo con las normas APA 7, principios de usabilidad y diseño CEO-ready.

---

### PROMPT 010-1: Mejora del Módulo de Gestión de Usuarios con Dashboard y Estadísticas

**Contexto:**
El módulo de gestión de usuarios está funcional con operaciones CRUD básicas. Ahora lo mejoraremos con un dashboard de estadísticas, diseño profesional siguiendo el estilo del módulo de Reportes, y funcionalidades avanzadas de exportación y visualización.

**Objetivo:**
Transformar el módulo de usuarios en una interfaz profesional, moderna y fácil de usar, con estadísticas visuales, exportación de datos, y diseño consistente siguiendo las mejores prácticas de UX/UI y cumplimiento de normas APA 7.

**Instrucciones:**

**BACKEND (Mejoras):**

1. **Ampliar servicio de usuarios (src/services/users.service.ts):**
   
   Agregar funciones de estadísticas:
   
   - `getUsersStats()`: Obtener estadísticas generales
     ```typescript
     {
       totalUsers: number,
       activeUsers: number,
       inactiveUsers: number,
       usersByRole: Array<{ roleId, roleName, count }>,
       recentUsers: Array<User>, // Últimos 5 usuarios creados
       lastLoginStats: Array<{ date, count }> // Últimos 30 días
     }
     ```
   
   - `exportUsersToCSV(filters)`: Exportar usuarios a CSV
     * Aplicar filtros actuales
     * Generar CSV con campos: Username, Nombre Completo, Email, Rol, Estado, Fecha Creación
     * Retornar archivo para descarga
   
   - `exportUsersToExcel(filters)`: Exportar usuarios a Excel
     * Similar a CSV pero formato XLSX
     * Usar librería `exceljs`
     * Incluir estilos: encabezados en negrita, colores alternos en filas

2. **Crear controlador de estadísticas (src/controllers/users.controller.ts):**
   
   Agregar endpoints:
   
   - `getStats`: GET /api/users/stats
     * Llamar a `users.service.getUsersStats()`
     * Retornar 200 con estadísticas
   
   - `exportCSV`: GET /api/users/export/csv
     * Query params: filtros actuales
     * Llamar a `users.service.exportUsersToCSV(filters)`
     * Retornar archivo CSV
   
   - `exportExcel`: GET /api/users/export/excel
     * Similar a CSV pero formato Excel

3. **Actualizar rutas (src/routes/users.routes.ts):**
   
   ```
   GET /api/users/stats         - Obtener estadísticas (admin)
   GET /api/users/export/csv    - Exportar a CSV (admin)
   GET /api/users/export/excel  - Exportar a Excel (admin)
   ```

**FRONTEND (Mejoras Significativas):**

4. **Crear componente de estadísticas (components/users/UsersStats.tsx):**
   
   Diseño inspirado en ReportSummary.tsx:
   
   ```typescript
   interface UsersStatsProps {
     stats: {
       totalUsers: number;
       activeUsers: number;
       inactiveUsers: number;
       usersByRole: Array<{roleId: string, roleName: string, count: number}>;
     };
   }
   
   export function UsersStats({ stats }: UsersStatsProps) {
     return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <StatCard
           title="Total de Usuarios"
           value={stats.totalUsers}
           icon={<Users className="h-5 w-5" />}
           color="blue"
         />
         <StatCard
           title="Usuarios Activos"
           value={stats.activeUsers}
           icon={<UserCheck className="h-5 w-5" />}
           color="green"
           description={`Inactivos: ${stats.inactiveUsers}`}
         />
         <StatCard
           title="Administradores"
           value={stats.usersByRole.find(r => r.roleName === 'Administrador')?.count || 0}
           icon={<Shield className="h-5 w-5" />}
           color="violet"
         />
         <StatCard
           title="Operadores"
           value={stats.usersByRole.find(r => r.roleName === 'Operador')?.count || 0}
           icon={<UserCog className="h-5 w-5" />}
           color="amber"
         />
       </div>
     );
   }
   ```

5. **Crear componente StatCard reutilizable (components/shared/StatCard.tsx):**
   
   Componente genérico para tarjetas de estadísticas:
   
   ```typescript
   interface StatCardProps {
     title: string;
     value: string | number;
     icon: React.ReactNode;
     description?: string;
     color?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
     trend?: {
       value: number;
       isPositive: boolean;
     };
   }
   
   export function StatCard({ title, value, icon, description, color = 'blue', trend }: StatCardProps) {
     const colorClasses = {
       blue: 'bg-blue-50 text-blue-600',
       green: 'bg-green-50 text-green-600',
       amber: 'bg-amber-50 text-amber-600',
       red: 'bg-red-50 text-red-600',
       violet: 'bg-violet-50 text-violet-600',
     };
     
     return (
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
         <div className="flex items-center justify-between mb-2">
           <p className="text-sm font-medium text-gray-600">{title}</p>
           <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
             {icon}
           </div>
         </div>
         <div className="space-y-1">
           <p className="text-3xl font-bold text-gray-900">{value}</p>
           {description && (
             <p className="text-sm text-gray-500">{description}</p>
           )}
           {trend && (
             <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
               {trend.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
               <span>{Math.abs(trend.value)}%</span>
             </div>
           )}
         </div>
       </div>
     );
   }
   ```

6. **Crear gráfico de usuarios por rol (components/users/UsersRoleChart.tsx):**
   
   Usar recharts para visualización:
   
   ```typescript
   import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
   
   interface UsersRoleChartProps {
     data: Array<{roleName: string, count: number}>;
   }
   
   const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
   
   export function UsersRoleChart({ data }: UsersRoleChartProps) {
     return (
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">
           Distribución de Usuarios por Rol
         </h3>
         <ResponsiveContainer width="100%" height={300}>
           <PieChart>
             <Pie
               data={data}
               dataKey="count"
               nameKey="roleName"
               cx="50%"
               cy="50%"
               outerRadius={80}
               label
             >
               {data.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
               ))}
             </Pie>
             <Tooltip />
             <Legend />
           </PieChart>
         </ResponsiveContainer>
       </div>
     );
   }
   ```

7. **Mejorar tabla de usuarios (components/users/UsersTable.tsx):**
   
   Mejoras visuales y funcionales:
   
   - Agregar avatar con iniciales del usuario
   - Mejorar badges de estado con colores más distintivos
   - Agregar tooltip en acciones
   - Mejorar responsive design
   - Agregar columna de último inicio de sesión (si está disponible)
   - Agregar acción de "Ver detalles" (nueva modal)

8. **Crear panel de exportación (components/users/UsersExportPanel.tsx):**
   
   ```typescript
   interface UsersExportPanelProps {
     onExport: (format: 'csv' | 'excel') => void;
     exporting: boolean;
   }
   
   export function UsersExportPanel({ onExport, exporting }: UsersExportPanelProps) {
     return (
       <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Download className="h-5 w-5 text-gray-500" />
             <span className="text-sm font-medium text-gray-700">
               Exportar datos de usuarios
             </span>
           </div>
           <div className="flex gap-2">
             <Button
               onClick={() => onExport('csv')}
               variant="outline"
               size="sm"
               disabled={exporting}
             >
               <FileSpreadsheet className="h-4 w-4 mr-2" />
               CSV
             </Button>
             <Button
               onClick={() => onExport('excel')}
               variant="outline"
               size="sm"
               disabled={exporting}
             >
               <FileSpreadsheet className="h-4 w-4 mr-2" />
               Excel
             </Button>
           </div>
         </div>
       </div>
     );
   }
   ```

9. **Crear modal de detalles de usuario (components/users/UserDetailModal.tsx):**
   
   Modal completo con toda la información del usuario:
   
   - Información personal
   - Rol y permisos
   - Estadísticas de actividad (últimos logins, acciones recientes)
   - Botones: Editar, Cerrar

10. **Refactorizar página de usuarios (app/(dashboard)/admin/usuarios/page.tsx):**
    
    Diseño completamente renovado:
    
    ```typescript
    'use client';
    
    import { useEffect, useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { UserPlus, Users as UsersIcon } from 'lucide-react';
    import { useUsers } from '@/hooks/useUsers';
    import { UsersStats } from '@/components/users/UsersStats';
    import { UsersRoleChart } from '@/components/users/UsersRoleChart';
    import { UsersTable } from '@/components/users/UsersTable';
    import { UsersFilters } from '@/components/users/UsersFilters';
    import { UsersExportPanel } from '@/components/users/UsersExportPanel';
    import { UserModal } from '@/components/users/UserModal';
    import { UserDetailModal } from '@/components/users/UserDetailModal';
    import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
    
    export default function UsuariosPage() {
      const {
        users,
        stats,
        loading,
        pagination,
        fetchUsers,
        fetchStats,
        createUser,
        updateUser,
        deleteUser,
        exportUsers
      } = useUsers();
      
      const [modalOpen, setModalOpen] = useState(false);
      const [detailModalOpen, setDetailModalOpen] = useState(false);
      const [selectedUser, setSelectedUser] = useState(null);
      const [exporting, setExporting] = useState(false);
      
      useEffect(() => {
        fetchUsers();
        fetchStats();
      }, []);
      
      const handleExport = async (format) => {
        setExporting(true);
        try {
          await exportUsers(format);
        } finally {
          setExporting(false);
        }
      };
      
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <UsersIcon className="h-8 w-8" />
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-1">
                Administre los usuarios del sistema y sus permisos
              </p>
            </div>
            <Button onClick={openCreateModal}>
              <UserPlus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </div>
          
          {/* Estadísticas */}
          <UsersStats stats={stats} />
          
          {/* Gráfico y Panel de Exportación */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UsersRoleChart data={stats.usersByRole} />
            </div>
            <div className="space-y-4">
              <UsersExportPanel onExport={handleExport} exporting={exporting} />
              {/* Últimos usuarios creados */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Usuarios Recientes
                </h3>
                <div className="space-y-2">
                  {stats.recentUsers?.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.role.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtros */}
          <UsersFilters onFilter={handleFilter} />
          
          {/* Tabla */}
          <UsersTable
            users={users}
            loading={loading}
            pagination={pagination}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            onViewDetails={openDetailModal}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
          
          {/* Modales */}
          <UserModal {...modalProps} />
          <UserDetailModal {...detailModalProps} />
          <ConfirmDialog {...confirmProps} />
        </div>
      );
    }
    ```

**Criterios de Éxito:**
- ✅ Dashboard muestra estadísticas claras y visuales
- ✅ Cards de estadísticas siguen el diseño del módulo de Reportes
- ✅ Gráfico de distribución por rol funciona correctamente
- ✅ Exportación a CSV funciona sin errores
- ✅ Exportación a Excel genera archivo con formato correcto
- ✅ Tabla mejorada con avatars y mejor UX
- ✅ Modal de detalles muestra información completa
- ✅ Diseño responsive en todos los breakpoints
- ✅ Transiciones suaves y feedback visual
- ✅ Cumple con principios de usabilidad: claridad, consistencia, feedback

**Testing Manual:**
1. Acceder a /admin/usuarios
2. Verificar que cards de estadísticas se muestran correctamente
3. Verificar que gráfico de torta muestra distribución
4. Exportar usuarios a CSV, verificar descarga
5. Exportar usuarios a Excel, verificar formato
6. Hacer clic en "Ver detalles" de un usuario
7. Verificar modal de detalles con toda la información
8. Probar responsive en mobile y tablet
9. Verificar animaciones y transiciones

**Siguiente Paso:**
Con el módulo de usuarios mejorado, procederemos con PROMPT 010-2 para perfeccionar el módulo de roles.

---

### PROMPT 010-2: Perfeccionamiento del Módulo de Roles con Analytics y Visualización Mejorada

**Contexto:**
El módulo de roles tiene funcionalidad básica con un editor de permisos. Ahora lo mejoraremos con analytics de uso de permisos, visualización de impacto, plantillas predefinidas mejoradas, y un diseño más intuitivo siguiendo el estilo profesional del módulo de Reportes.

**Objetivo:**
Crear una experiencia de gestión de roles y permisos profesional, con visualización clara del impacto de permisos, analytics de uso, y diseño intuitivo que cumpla con normas de usabilidad empresarial.

**Instrucciones:**

**BACKEND (Mejoras):**

1. **Ampliar servicio de roles (src/services/roles.service.ts):**
   
   Agregar funciones avanzadas:
   
   - `getRolesAnalytics()`: Analítica de roles
     ```typescript
     {
       totalRoles: number,
       totalPermissions: number,
       permissionsUsage: Array<{
         module: string,
         action: string,
         rolesCount: number,
         usersCount: number
       }>,
       roleComparison: Array<{
         roleId: string,
         roleName: string,
         permissions: Array<string>,
         usersCount: number
       }>
     }
     ```
   
   - `getRoleImpact(roleId)`: Impacto de un rol
     * Cantidad de usuarios con este rol
     * Módulos y acciones permitidas
     * Último usuario asignado
     * Histórico de cambios (de auditoría)
   
   - `duplicateRole(roleId, newName)`: Duplicar rol
     * Crear nuevo rol con mismos permisos
     * Útil para crear variaciones

2. **Crear controlador de analytics (src/controllers/roles.controller.ts):**
   
   Agregar endpoints:
   
   - `getAnalytics`: GET /api/roles/analytics
   - `getRoleImpact`: GET /api/roles/:id/impact
   - `duplicate`: POST /api/roles/:id/duplicate

3. **Actualizar rutas:**
   
   ```
   GET  /api/roles/analytics        - Analytics de roles (admin)
   GET  /api/roles/:id/impact       - Impacto de rol específico (admin)
   POST /api/roles/:id/duplicate    - Duplicar rol (admin)
   ```

**FRONTEND (Mejoras Significativas):**

4. **Crear dashboard de analytics de roles (components/roles/RolesAnalytics.tsx):**
   
   ```typescript
   interface RolesAnalyticsProps {
     analytics: {
       totalRoles: number;
       totalPermissions: number;
       permissionsUsage: Array<any>;
     };
   }
   
   export function RolesAnalytics({ analytics }: RolesAnalyticsProps) {
     return (
       <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <StatCard
             title="Total de Roles"
             value={analytics.totalRoles}
             icon={<Shield className="h-5 w-5" />}
             color="blue"
           />
           <StatCard
             title="Permisos Configurados"
             value={analytics.totalPermissions}
             icon={<Key className="h-5 w-5" />}
             color="violet"
           />
           <StatCard
             title="Promedio Permisos/Rol"
             value={Math.round(analytics.totalPermissions / analytics.totalRoles)}
             icon={<TrendingUp className="h-5 w-5" />}
             color="green"
           />
         </div>
         
         <div className="bg-white p-6 rounded-lg border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">
             Permisos Más Usados
           </h3>
           <PermissionsUsageChart data={analytics.permissionsUsage} />
         </div>
       </div>
     );
   }
   ```

5. **Mejorar editor de permisos (components/roles/PermissionsEditor.tsx):**
   
   Rediseño completo con mejor UX:
   
   ```typescript
   export function PermissionsEditor({ permissions, onChange }: PermissionsEditorProps) {
     const [selectedModule, setSelectedModule] = useState(null);
     const [searchTerm, setSearchTerm] = useState('');
     
     return (
       <div className="space-y-4">
         {/* Búsqueda de permisos */}
         <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
           <Input
             placeholder="Buscar permisos por módulo o acción..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10"
           />
         </div>
         
         {/* Acciones rápidas */}
         <div className="flex flex-wrap gap-2">
           <Button variant="outline" size="sm" onClick={selectAllPermissions}>
             <CheckSquare className="h-4 w-4 mr-1" />
             Seleccionar Todos
           </Button>
           <Button variant="outline" size="sm" onClick={clearAllPermissions}>
             <XSquare className="h-4 w-4 mr-1" />
             Limpiar Todos
           </Button>
           <Select value={template} onValueChange={applyTemplate}>
             <SelectTrigger className="w-48">
               <SelectValue placeholder="Aplicar Plantilla" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="admin">Administrador Total</SelectItem>
               <SelectItem value="operator">Operador Estándar</SelectItem>
               <SelectItem value="readonly">Solo Lectura</SelectItem>
               <SelectItem value="custom">Personalizado</SelectItem>
             </SelectContent>
           </Select>
         </div>
         
         {/* Tabs por categoría */}
         <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
           <TabsList className="grid w-full grid-cols-4">
             <TabsTrigger value="admin">Administración</TabsTrigger>
             <TabsTrigger value="archive">Archivo Digital</TabsTrigger>
             <TabsTrigger value="search">Consultas</TabsTrigger>
             <TabsTrigger value="signature">Firma Digital</TabsTrigger>
           </TabsList>
           
           {Object.keys(PERMISSION_MODULES).map(category => (
             <TabsContent key={category} value={category}>
               <div className="space-y-4">
                 {getModulesByCategory(category).map(module => (
                   <PermissionModuleCard
                     key={module.key}
                     module={module}
                     permissions={permissions[module.key] || {}}
                     onChange={(modulePermissions) => 
                       onChange({ ...permissions, [module.key]: modulePermissions })
                     }
                   />
                 ))}
               </div>
             </TabsContent>
           ))}
         </Tabs>
         
         {/* Resumen de permisos seleccionados */}
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Info className="h-5 w-5 text-blue-600" />
               <span className="text-sm font-medium text-blue-900">
                 Permisos Seleccionados
               </span>
             </div>
             <span className="text-2xl font-bold text-blue-600">
               {countSelectedPermissions(permissions)}
             </span>
           </div>
         </div>
       </div>
     );
   }
   ```

6. **Crear card de módulo de permisos (components/roles/PermissionModuleCard.tsx):**
   
   Diseño mejorado para cada módulo:
   
   ```typescript
   interface PermissionModuleCardProps {
     module: {
       label: string;
       icon: React.ReactNode;
       actions: Array<string>;
     };
     permissions: Record<string, boolean>;
     onChange: (permissions: Record<string, boolean>) => void;
   }
   
   export function PermissionModuleCard({ module, permissions, onChange }: PermissionModuleCardProps) {
     const allSelected = module.actions.every(action => permissions[action]);
     
     return (
       <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             {module.icon}
             <h4 className="font-semibold text-gray-900">{module.label}</h4>
           </div>
           <Checkbox
             checked={allSelected}
             onCheckedChange={(checked) => toggleAllActions(checked)}
           />
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
           {module.actions.map(action => (
             <div key={action} className="flex items-center space-x-2">
               <Checkbox
                 id={`${module.key}-${action}`}
                 checked={permissions[action] || false}
                 onCheckedChange={(checked) => 
                   onChange({ ...permissions, [action]: checked })
                 }
               />
               <label
                 htmlFor={`${module.key}-${action}`}
                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
               >
                 {ACTION_LABELS[action]}
               </label>
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```

7. **Crear modal de impacto de rol (components/roles/RoleImpactModal.tsx):**
   
   Modal que muestra el impacto de un rol:
   
   ```typescript
   interface RoleImpactModalProps {
     role: Role;
     impact: {
       usersCount: number;
       users: Array<User>;
       modulesAccess: Array<string>;
       lastChanges: Array<AuditLog>;
     };
     open: boolean;
     onClose: () => void;
   }
   
   export function RoleImpactModal({ role, impact, open, onClose }: RoleImpactModalProps) {
     return (
       <Dialog open={open} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl">
           <DialogHeader>
             <DialogTitle>Impacto del Rol: {role.name}</DialogTitle>
             <DialogDescription>
               Análisis del impacto y uso de este rol en el sistema
             </DialogDescription>
           </DialogHeader>
           
           <div className="space-y-6">
             {/* Estadísticas */}
             <div className="grid grid-cols-3 gap-4">
               <StatCard
                 title="Usuarios Asignados"
                 value={impact.usersCount}
                 icon={<Users className="h-5 w-5" />}
                 color="blue"
               />
               <StatCard
                 title="Módulos con Acceso"
                 value={impact.modulesAccess.length}
                 icon={<Grid className="h-5 w-5" />}
                 color="green"
               />
               <StatCard
                 title="Permisos Totales"
                 value={countPermissions(role.permissions)}
                 icon={<Key className="h-5 w-5" />}
                 color="violet"
               />
             </div>
             
             {/* Usuarios con este rol */}
             <div>
               <h4 className="text-sm font-semibold text-gray-900 mb-2">
                 Usuarios con este rol
               </h4>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                 {impact.users.map(user => (
                   <div key={user.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                       {user.firstName[0]}{user.lastName[0]}
                     </div>
                     <div>
                       <p className="font-medium">{user.firstName} {user.lastName}</p>
                       <p className="text-xs text-gray-500">{user.email}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Módulos con acceso */}
             <div>
               <h4 className="text-sm font-semibold text-gray-900 mb-2">
                 Módulos con Acceso
               </h4>
               <div className="flex flex-wrap gap-2">
                 {impact.modulesAccess.map(module => (
                   <Badge key={module} variant="outline">
                     {module}
                   </Badge>
                 ))}
               </div>
             </div>
             
             {/* Últimos cambios */}
             <div>
               <h4 className="text-sm font-semibold text-gray-900 mb-2">
                 Últimos Cambios
               </h4>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                 {impact.lastChanges.map(log => (
                   <div key={log.id} className="text-sm p-2 bg-gray-50 rounded">
                     <p className="font-medium">{log.action}</p>
                     <p className="text-xs text-gray-500">
                       {log.user.username} - {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
           </div>
           
           <DialogFooter>
             <Button variant="outline" onClick={onClose}>Cerrar</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     );
   }
   ```

8. **Mejorar tabla de roles (components/roles/RolesTable.tsx):**
   
   Agregar columnas y acciones:
   
   - Columna "Permisos" con badge de cantidad
   - Columna "Usuarios" con badge de cantidad
   - Acción "Ver Impacto"
   - Acción "Duplicar Rol"
   - Mejores iconos y colores

9. **Crear comparador de roles (components/roles/RolesComparison.tsx):**
   
   Herramienta para comparar permisos entre roles:
   
   ```typescript
   export function RolesComparison({ roles }: RolesComparisonProps) {
     const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
     
     return (
       <div className="bg-white p-6 rounded-lg border border-gray-200">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">
           Comparador de Roles
         </h3>
         
         <div className="space-y-4">
           {/* Selector de roles */}
           <div className="flex gap-2">
             <Select onValueChange={addRoleToCompare}>
               <SelectTrigger>
                 <SelectValue placeholder="Agregar rol para comparar" />
               </SelectTrigger>
               <SelectContent>
                 {roles.map(role => (
                   <SelectItem key={role.id} value={role.id}>
                     {role.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           
           {/* Tabla de comparación */}
           {selectedRoles.length > 0 && (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                       Módulo / Permiso
                     </th>
                     {selectedRoles.map(roleId => {
                       const role = roles.find(r => r.id === roleId);
                       return (
                         <th key={roleId} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                           {role?.name}
                         </th>
                       );
                     })}
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {getAllPermissions().map(permission => (
                     <tr key={permission.key}>
                       <td className="px-4 py-2 text-sm font-medium text-gray-900">
                         {permission.label}
                       </td>
                       {selectedRoles.map(roleId => {
                         const role = roles.find(r => r.id === roleId);
                         const hasPermission = hasPermissionInRole(role, permission.key);
                         return (
                           <td key={roleId} className="px-4 py-2 text-center">
                             {hasPermission ? (
                               <Check className="h-5 w-5 text-green-600 mx-auto" />
                             ) : (
                               <X className="h-5 w-5 text-red-600 mx-auto" />
                             )}
                           </td>
                         );
                       })}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </div>
     );
   }
   ```

10. **Refactorizar página de roles (app/(dashboard)/admin/roles/page.tsx):**
    
    Diseño completamente renovado con analytics:
    
    - Sección de analytics en la parte superior
    - Tabs: "Lista de Roles", "Comparador", "Analytics"
    - Botón "Ver Impacto" en cada rol
    - Botón "Duplicar Rol" en cada rol
    - Diseño más limpio y organizado

**Criterios de Éxito:**
- ✅ Analytics de roles muestra información útil y clara
- ✅ Editor de permisos es intuitivo y fácil de usar
- ✅ Búsqueda de permisos funciona correctamente
- ✅ Plantillas predefinidas se aplican sin errores
- ✅ Tabs por categoría organizan permisos claramente
- ✅ Modal de impacto muestra información completa
- ✅ Duplicar rol funciona correctamente
- ✅ Comparador de roles es útil y funcional
- ✅ Diseño consistente con módulo de Reportes
- ✅ Cumple con principios de usabilidad y APA 7

**Testing Manual:**
1. Acceder a /admin/roles
2. Verificar analytics en la parte superior
3. Crear nuevo rol con plantilla predefinida
4. Usar búsqueda en editor de permisos
5. Cambiar entre tabs de categorías
6. Verificar resumen de permisos seleccionados
7. Ver impacto de un rol existente
8. Duplicar un rol
9. Usar comparador con 2-3 roles
10. Probar responsive en diferentes dispositivos

**Siguiente Paso:**
Con el módulo de roles perfeccionado, procederemos con PROMPT 010-3 para implementar profesionalmente la gestión de tipologías documentales.

---

### PROMPT 010-3: Implementación Profesional de Gestión de Tipologías Documentales (Oficinas, Tipos de Documento, Periodos)

**Contexto:**
Las APIs de tipologías (oficinas, tipos de documento, periodos) están funcionales con CRUD básico. Ahora las mejoraremos con un diseño unificado y profesional, estadísticas, importación/exportación masiva, y una interfaz intuitiva siguiendo el patrón del módulo de Reportes.

**Objetivo:**
Crear una experiencia profesional y cohesiva para la gestión de todas las tipologías documentales, con diseño moderno, estadísticas útiles, funcionalidades avanzadas de importación/exportación, y usabilidad CEO-ready cumpliendo con APA 7.

**Instrucciones:**

**BACKEND (Mejoras y Nuevas Funcionalidades):**

1. **Ampliar servicios de tipologías:**
   
   En `offices.service.ts`, `document-types.service.ts`, `periods.service.ts` agregar:
   
   - `getStats()`: Estadísticas generales (total activos/inactivos, más usados, últimos creados)
   - `exportToCSV(filters)`: Exportar datos filtrados a CSV
   - `exportToExcel(filters)`: Exportar datos filtrados a Excel
   - `importFromCSV(file)`: Importar desde CSV (validar duplicados, formato)
   - `importFromExcel(file)`: Importar desde Excel
   - `bulkCreate(items)`: Creación masiva de registros
   - `bulkUpdate(items)`: Actualización masiva
   - `bulkDelete(ids)`: Eliminación masiva

2. **Agregar endpoints de estadísticas y operaciones masivas:**
   
   ```
   GET  /api/offices/stats           - Estadísticas de oficinas
   GET  /api/offices/export/csv      - Exportar a CSV
   GET  /api/offices/export/excel    - Exportar a Excel
   POST /api/offices/import/csv      - Importar desde CSV
   POST /api/offices/import/excel    - Importar desde Excel
   POST /api/offices/bulk             - Operaciones masivas (create, update, delete)
   ```
   
   Replicar para `document-types` y `periods`

3. **Implementar validaciones de importación:**
   
   - Validar formato de archivos
   - Validar campos requeridos
   - Detectar y reportar duplicados
   - Transacciones para importaciones (todo o nada)
   - Retornar reporte detallado (exitosos, fallidos, motivos)

**FRONTEND (Rediseño Completo y Profesional):**

4. **Crear componente unificado de gestión de tipologías (components/typologies/TypologyManager.tsx):**
   
   Componente genérico reutilizable para gestionar cualquier tipología:
   
   - Props: tipo (office|documentType|period), configuración de campos, API endpoints
   - Dashboard con estadísticas en cards (total, activos, inactivos, recientes)
   - Gráficos de uso y distribución (si aplica)
   - Tabla con todas las funcionalidades: búsqueda, filtros, ordenamiento, paginación
   - Panel de acciones masivas: importar, exportar, operaciones en lote
   - Modales: crear, editar, detalle, importar, confirmar acciones masivas
   - Diseño consistente con módulo de Reportes

5. **Crear estadísticas visuales (components/typologies/TypologyStats.tsx):**
   
   - Cards de estadísticas usando StatCard reutilizable
   - Métricas clave: Total, Activos, Inactivos, Más Usados
   - Gráfico de barras para oficinas más activas (más documentos)
   - Gráfico de línea para tipos de documento más utilizados en el tiempo
   - Gráfico de distribución de documentos por periodo

6. **Crear panel de importación/exportación (components/typologies/ImportExportPanel.tsx):**
   
   - Botones de exportación (CSV, Excel) con filtros aplicados
   - Área de drag & drop para importar archivos
   - Validación de formato en frontend
   - Preview de datos antes de importar
   - Progreso de importación con loading bar
   - Reporte detallado de resultados (tabla con éxitos/errores)
   - Opción de descargar plantilla CSV/Excel
   - Tooltips explicativos en cada acción

7. **Crear tabla mejorada con selección múltiple (components/typologies/TypologyTable.tsx):**
   
   - Checkboxes para selección múltiple
   - Acciones masivas en header cuando hay selección
   - Columnas dinámicas según tipo de tipología
   - Badges de estado (activo/inactivo) con colores distintivos
   - Columna de uso (cantidad de documentos asociados)
   - Acciones individuales: Ver, Editar, Eliminar
   - Tooltips en acciones
   - Loading skeletons mejorados
   - Empty states personalizados

8. **Implementar páginas específicas con diseño unificado:**
   
   **app/(dashboard)/admin/oficinas/page.tsx:**
   **app/(dashboard)/admin/tipos-documento/page.tsx:**
   **app/(dashboard)/admin/periodos/page.tsx:**
   
   Estructura consistente para todas:
   
   ```typescript
   - Header con título, descripción y botón "Crear [Tipología]"
   - Sección de estadísticas (TypologyStats)
   - Grid con gráficos relevantes
   - Panel de importación/exportación
   - Filtros y búsqueda
   - Tabla de datos (TypologyTable)
   - Modales necesarios
   ```

9. **Crear modal de detalle extendido (components/typologies/TypologyDetailModal.tsx):**
   
   - Información completa de la tipología
   - Estadísticas de uso (documentos asociados, usuarios)
   - Histórico de cambios (auditoría)
   - Gráfico de evolución de uso en el tiempo
   - Lista de elementos relacionados (ej: documentos en esta oficina)
   - Botón para editar directamente desde detalle

10. **Implementar validaciones y mensajes informativos:**
    
    - No permitir eliminar oficinas/tipos/periodos con documentos asociados
    - Mostrar advertencia clara con cantidad de documentos afectados
    - Ofrecer alternativa: marcar como inactivo en lugar de eliminar
    - Confirmaciones claras y específicas para operaciones peligrosas
    - Mensajes de éxito con detalles de la operación
    - Toasts con iconos y colores según tipo de mensaje

**Mejoras de Usabilidad Específicas:**

11. **Para Oficinas:**
    - Mostrar organigrama o jerarquía (si aplica)
    - Indicador de oficinas más activas
    - Filtro rápido por estado y cantidad de documentos

12. **Para Tipos de Documento:**
    - Categorización por grupos (administrativos, técnicos, legales, etc.)
    - Indicador de tipos más utilizados
    - Sugerencias de tipos similares al crear uno nuevo

13. **Para Periodos:**
    - Vista de timeline de periodos
    - Indicador de periodo activo
    - Comparativa de documentos entre periodos
    - No permitir eliminar periodo actual
    - Validación de año (4 dígitos, no futuro lejano)

**Criterios de Éxito:**
- ✅ Diseño unificado y consistente para las 3 tipologías
- ✅ Estadísticas muestran información útil y clara
- ✅ Importación desde CSV funciona sin errores
- ✅ Importación desde Excel funciona correctamente
- ✅ Exportación incluye filtros aplicados
- ✅ Plantillas descargables tienen formato correcto
- ✅ Operaciones masivas funcionan correctamente
- ✅ Selección múltiple y acciones en lote operan bien
- ✅ No se pueden eliminar tipologías con referencias
- ✅ Validaciones previenen datos inconsistentes
- ✅ Mensajes y confirmaciones son claras
- ✅ Diseño responsive en todos los breakpoints
- ✅ Cumple con principios de usabilidad y APA 7

**Testing Manual:**
1. Gestión de Oficinas:
   - Crear oficina manualmente
   - Importar 5 oficinas desde CSV
   - Exportar oficinas a Excel
   - Editar oficina con selección múltiple
   - Intentar eliminar oficina con documentos
   - Ver detalle con estadísticas
   
2. Gestión de Tipos de Documento:
   - Crear tipo con código automático
   - Importar desde Excel con errores intencionados
   - Verificar reporte de importación
   - Usar filtros y búsqueda
   - Operaciones masivas de activación/desactivación
   
3. Gestión de Periodos:
   - Crear periodo actual
   - Ver timeline de periodos
   - Comparar estadísticas entre periodos
   - Intentar eliminar periodo actual
   - Exportar con filtros aplicados

**Siguiente Paso:**
Con las tipologías profesionalizadas, procederemos con PROMPT 010-3-1 para implementar la interfaz frontend profesional.

---

### PROMPT 010-3-1: Interfaz Frontend Profesional para Gestión de Tipologías Documentales

**Contexto:**
El backend de tipologías (oficinas, tipos de documento, periodos) está completo con todas las funcionalidades avanzadas: estadísticas, importación/exportación CSV/Excel, operaciones masivas, y validaciones robustas. Las páginas frontend actuales tienen CRUD básico funcional. Ahora crearemos una interfaz profesional y cohesiva que aproveche todas las capacidades del backend.

**Objetivo:**
Implementar una interfaz de usuario moderna, intuitiva y profesional para la gestión de tipologías documentales, con estadísticas visuales, importación/exportación mediante drag & drop, operaciones masivas con selección múltiple, y diseño consistente siguiendo el patrón del módulo de Reportes. La interfaz debe ser CEO-ready y cumplir con principios de usabilidad APA 7.

**Estado Actual:**
- ✅ Backend completo con todos los endpoints funcionales
- ✅ APIs del frontend configuradas (lib/api/offices.ts, document-types.ts, periods.ts)
- ✅ Páginas básicas existentes con CRUD funcional
- ⏳ Falta: Componentes visuales avanzados, estadísticas, importación/exportación UI

**Instrucciones:**

**COMPONENTES COMPARTIDOS (Reutilizables):**

1. **Crear components/typologies/StatCard.tsx:**
   
   Componente de tarjeta de estadística reutilizable:
   
   ```typescript
   interface StatCardProps {
     title: string;
     value: number | string;
     icon: React.ReactNode;
     description?: string;
     trend?: { value: number; isPositive: boolean };
     loading?: boolean;
   }
   ```
   
   - Diseño limpio con icono destacado
   - Animación de conteo para números
   - Indicador de tendencia opcional (↑ ↓)
   - Skeleton loader cuando loading=true
   - Colores dinámicos según tipo de métrica
   - Tooltip con descripción adicional

2. **Crear components/typologies/TypologyStats.tsx:**
   
   Panel de estadísticas con visualización de métricas clave:
   
   - Grid responsive de StatCards (2x2 en desktop, 1 columna en mobile)
   - Cards: Total, Activos, Inactivos, Creados Hoy
   - Gráfico de barras "Top 5 más usados" (usando Recharts)
   - Gráfico de línea "Evolución últimos 30 días" (opcional)
   - Loading state con skeletons
   - Empty state si no hay datos
   - Botón "Actualizar" para refrescar stats
   - Props: `type` ('office' | 'documentType' | 'period')

3. **Crear components/typologies/ImportExportPanel.tsx:**
   
   Panel de importación/exportación con drag & drop:
   
   **Sección de Exportación:**
   - Botón "Exportar CSV" con icono
   - Botón "Exportar Excel" con icono
   - Botón "Descargar Plantilla" para importación
   - Aplica filtros actuales de la tabla
   - Toast de confirmación al exportar
   
   **Sección de Importación:**
   - Área de drag & drop con react-dropzone
   - Acepta .csv y .xlsx
   - Preview de primeras 5 filas antes de importar
   - Validación de columnas requeridas
   - Botón "Confirmar Importación"
   - Progress bar durante importación
   - Dialog con reporte de resultados:
     - Tabla de éxitos (verde)
     - Tabla de errores con motivo (rojo)
     - Botón "Descargar reporte de errores"
   
   Props: `type`, `currentFilters`, `onImportComplete`

4. **Crear components/typologies/TypologyTable.tsx:**
   
   Tabla avanzada con selección múltiple:
   
   - Checkbox en header para "Seleccionar todos"
   - Checkbox por fila
   - Barra de acciones flotante cuando hay selección:
     - "X elementos seleccionados"
     - Botón "Eliminar seleccionados"
     - Botón "Activar/Desactivar seleccionados"
     - Botón "Cancelar selección"
   - Columnas dinámicas según tipo:
     - Oficinas: Código, Nombre, Descripción, Estado, Documentos, Acciones
     - Tipos Doc: Código, Nombre, Descripción, Estado, Documentos, Acciones
     - Periodos: Año, Descripción, Estado, Archivadores, Acciones
   - Badges de estado con colores (verde=activo, gris=inactivo)
   - Acciones por fila: Ver (ojo), Editar (lápiz), Eliminar (papelera)
   - Tooltips en todos los botones
   - Loading skeletons (6 filas)
   - Empty state personalizado por tipo
   - Paginación en footer
   
   Props: `type`, `data`, `loading`, `onEdit`, `onDelete`, `onView`, `onBulkAction`

5. **Crear components/typologies/TypologyDetailModal.tsx:**
   
   Modal de detalle extendido con información completa:
   
   - Header: Título con código y badge de estado
   - Sección "Información Básica":
     - Código (solo lectura)
     - Nombre
     - Descripción
     - Fecha de creación
     - Última actualización
   - Sección "Estadísticas de Uso":
     - Card: Total de documentos/archivadores asociados
     - Card: Documentos activos vs inactivos
     - Mini gráfico de uso en el tiempo (últimos 6 meses)
   - Sección "Elementos Relacionados":
     - Lista de últimos 5 documentos/archivadores
     - Link "Ver todos"
   - Sección "Historial de Cambios" (opcional):
     - Timeline de últimas 10 modificaciones
     - Usuario, fecha, acción
   - Footer:
     - Botón "Editar"
     - Botón "Cerrar"
   
   Props: `type`, `id`, `open`, `onClose`, `onEdit`

6. **Crear components/typologies/BulkActionDialog.tsx:**
   
   Dialog de confirmación para operaciones masivas:
   
   - Título dinámico según operación
   - Mensaje de advertencia claro
   - Lista de elementos afectados (scroll si >10)
   - Checkbox "Estoy seguro de esta acción"
   - Botones:
     - "Cancelar" (secondary)
     - "Confirmar [Acción]" (destructive si es delete)
   - Loading state durante ejecución
   - Toast de resultado con detalles
   
   Props: `operation`, `items`, `onConfirm`, `onCancel`

7. **Crear components/typologies/ImportPreviewTable.tsx:**
   
   Tabla de preview antes de importar:
   
   - Muestra primeras 5-10 filas del archivo
   - Columnas con colores:
     - Verde: Columna requerida encontrada
     - Amarillo: Columna opcional
     - Rojo: Columna faltante
   - Validación visual de datos
   - Contador de filas totales
   - Advertencias si hay problemas
   
   Props: `data`, `validation`

**HOOKS PERSONALIZADOS:**

8. **Crear hooks/useTypologyStats.ts:**
   
   Hook para manejar estadísticas:
   
   ```typescript
   export const useTypologyStats = (type: TypologyType) => {
     const [stats, setStats] = useState(null);
     const [loading, setLoading] = useState(true);
     
     const fetchStats = async () => {
       // Llamar a la API correspondiente
     };
     
     const refresh = () => fetchStats();
     
     return { stats, loading, refresh };
   };
   ```

9. **Crear hooks/useImportExport.ts:**
   
   Hook para manejar importación/exportación:
   
   ```typescript
   export const useImportExport = (type: TypologyType) => {
     const handleExportCSV = async (filters) => {
       // Descargar CSV
     };
     
     const handleImportCSV = async (file) => {
       // Parsear y enviar al backend
     };
     
     const parseCSV = (file) => {
       // Convertir a array de objetos
     };
     
     return { 
       handleExportCSV, 
       handleExportExcel, 
       handleImportCSV, 
       handleImportExcel,
       downloadTemplate 
     };
   };
   ```

10. **Crear hooks/useBulkOperations.ts:**
    
    Hook para operaciones masivas:
    
    ```typescript
    export const useBulkOperations = (type: TypologyType) => {
      const [selected, setSelected] = useState<string[]>([]);
      
      const toggleSelect = (id: string) => {
        // Toggle selección
      };
      
      const selectAll = () => {
        // Seleccionar todos
      };
      
      const clearSelection = () => {
        // Limpiar selección
      };
      
      const bulkDelete = async () => {
        // Eliminar seleccionados
      };
      
      const bulkUpdate = async (data) => {
        // Actualizar seleccionados
      };
      
      return { 
        selected, 
        toggleSelect, 
        selectAll, 
        clearSelection, 
        bulkDelete, 
        bulkUpdate 
      };
    };
    ```

**PÁGINAS MEJORADAS:**

11. **Actualizar app/(dashboard)/admin/oficinas/page.tsx:**
    
    Estructura completa de la página:
    
    ```typescript
    'use client';
    
    export default function OficinasPage() {
      // Estados y hooks
      const { offices, loading, pagination, fetchOffices } = useOffices();
      const { stats, loading: statsLoading } = useTypologyStats('office');
      const { selected, toggleSelect, bulkDelete } = useBulkOperations('office');
      const { handleExportCSV, handleImportCSV } = useImportExport('office');
      
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1>Gestión de Oficinas</h1>
              <p>Administre las oficinas del sistema</p>
            </div>
            <Button onClick={openCreateModal}>
              <Plus /> Crear Oficina
            </Button>
          </div>
          
          {/* Estadísticas */}
          <TypologyStats type="office" stats={stats} loading={statsLoading} />
          
          {/* Import/Export Panel */}
          <ImportExportPanel 
            type="office"
            currentFilters={filters}
            onImportComplete={fetchOffices}
          />
          
          {/* Filtros y búsqueda */}
          <Card>
            <Input placeholder="Buscar..." />
            <Select>Estado</Select>
            <Button>Buscar</Button>
          </Card>
          
          {/* Tabla con selección múltiple */}
          <TypologyTable
            type="office"
            data={offices}
            loading={loading}
            selected={selected}
            onSelect={toggleSelect}
            onBulkAction={bulkDelete}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onView={openDetailModal}
          />
          
          {/* Modales */}
          <CreateEditModal />
          <TypologyDetailModal />
          <BulkActionDialog />
        </div>
      );
    }
    ```

12. **Actualizar app/(dashboard)/admin/tipos-documento/page.tsx:**
    
    Usar la misma estructura pero con `type="documentType"`
    
    Agregar características específicas:
    - Filtro por categoría (si aplica)
    - Indicador de tipos más utilizados
    - Sugerencias de tipos similares al crear

13. **Actualizar app/(dashboard)/admin/periodos/page.tsx:**
    
    Usar la misma estructura pero con `type="period"`
    
    Agregar características específicas:
    - Timeline visual de periodos
    - Indicador de periodo actual
    - Comparativa entre periodos
    - Validación especial: no eliminar periodo actual

**UTILIDADES Y HELPERS:**

14. **Crear lib/utils/csvParser.ts:**
    
    Utilidades para parsear CSV/Excel:
    
    ```typescript
    export const parseCSV = (file: File): Promise<any[]> => {
      // Usar papaparse o similar
    };
    
    export const parseExcel = (file: File): Promise<any[]> => {
      // Usar xlsx o similar
    };
    
    export const generateTemplate = (type: TypologyType) => {
      // Generar CSV de plantilla
    };
    
    export const downloadFile = (data: any, filename: string) => {
      // Descargar archivo
    };
    ```

15. **Crear lib/utils/validation.ts:**
    
    Validaciones para importación:
    
    ```typescript
    export const validateImportData = (data: any[], type: TypologyType) => {
      const errors = [];
      
      data.forEach((row, index) => {
        // Validar campos requeridos
        // Validar formato
        // Detectar duplicados
      });
      
      return { valid: errors.length === 0, errors };
    };
    ```

**ESTILOS Y ANIMACIONES:**

16. **Agregar animaciones suaves:**
    
    - Transiciones en selección de filas
    - Fade in/out de modales
    - Loading spinners profesionales
    - Progress bars animadas
    - Toasts con slide-in
    - Skeleton loaders suaves

17. **Mejorar responsive design:**
    
    - Grid de stats: 4 columnas → 2 columnas → 1 columna
    - Tabla: scroll horizontal en mobile
    - Botones: stack vertical en mobile
    - Modales: full screen en mobile
    - Tooltips: posición adaptativa

**VALIDACIONES Y MENSAJES:**

18. **Implementar mensajes informativos:**
    
    - Toast de éxito con detalles:
      ```
      ✓ Oficina creada correctamente
        Código: 015 | Nombre: Recursos Humanos
      ```
    
    - Toast de error descriptivo:
      ```
      ✗ No se puede eliminar la oficina
        Hay 23 documentos asociados. Puede marcarla como inactiva.
      ```
    
    - Confirmación de operaciones masivas:
      ```
      ¿Eliminar 5 oficinas seleccionadas?
        Esta acción no se puede deshacer.
        ☐ Estoy seguro de esta acción
      ```
    
    - Reporte de importación:
      ```
      Importación completada
        ✓ 8 registros importados correctamente
        ✗ 2 registros con errores
        [Ver detalles] [Descargar reporte]
      ```

**MEJORAS DE UX ESPECÍFICAS:**

19. **Para Oficinas:**
    
    - Indicador visual de oficinas más activas (badge "🔥 Top")
    - Filtro rápido: "Solo con documentos" / "Solo vacías"
    - Color coding por cantidad de documentos:
      - Verde: >100 documentos
      - Amarillo: 10-100 documentos
      - Gris: <10 documentos

20. **Para Tipos de Documento:**
    
    - Agrupación por categoría con accordion
    - Badge "Más usado" en el top 3
    - Sugerencias al crear: "Tipos similares existentes"
    - Filtro por uso: "Más usados" / "Menos usados" / "Sin uso"

21. **Para Periodos:**
    
    - Timeline horizontal visual con años
    - Periodo actual con badge "Actual" y color destacado
    - Comparativa: "vs periodo anterior" con % de cambio
    - Bloqueo de eliminación con mensaje específico:
      ```
      No se puede eliminar el periodo actual (2025)
        Crear un nuevo periodo antes de modificar este.
      ```

**OPTIMIZACIONES DE RENDIMIENTO:**

22. **Implementar optimizaciones:**
    
    - Debounce en búsqueda (500ms)
    - Lazy loading de gráficos (solo cuando visible)
    - Memoización de componentes pesados
    - Virtualización de listas largas (si >100 items)
    - Cache de estadísticas (5 minutos)
    - Skeleton screens en lugar de spinners

**ACCESIBILIDAD:**

23. **Garantizar accesibilidad:**
    
    - Labels en todos los inputs
    - aria-labels en botones de iconos
    - Contraste de colores WCAG AA
    - Navegación por teclado completa
    - Focus visible en elementos interactivos
    - Screen reader compatible

**Criterios de Éxito:**
- ✅ Estadísticas se cargan y muestran correctamente
- ✅ Exportación CSV descarga archivo válido
- ✅ Exportación Excel descarga archivo válido
- ✅ Plantilla descargable tiene formato correcto
- ✅ Drag & drop acepta archivos y muestra preview
- ✅ Importación procesa archivos y muestra reporte
- ✅ Validaciones previas previenen errores
- ✅ Selección múltiple funciona correctamente
- ✅ Acciones masivas ejecutan y confirman
- ✅ Modal de detalle muestra toda la información
- ✅ Toasts son claros e informativos
- ✅ Design responsive en todos los breakpoints
- ✅ Loading states y empty states funcionan
- ✅ Animaciones son suaves y profesionales
- ✅ Navegación es intuitiva y fluida

**Testing Manual:**

1. **Estadísticas:**
   - Verificar que las cards muestran números correctos
   - Probar botón "Actualizar"
   - Verificar loading state

2. **Exportación:**
   - Exportar CSV sin filtros
   - Exportar CSV con filtros aplicados
   - Exportar Excel
   - Descargar plantilla
   - Verificar formato de archivos descargados

3. **Importación:**
   - Arrastrar archivo CSV válido
   - Ver preview de datos
   - Confirmar importación
   - Ver reporte de éxito
   - Importar archivo con errores
   - Verificar tabla de errores
   - Descargar reporte de errores

4. **Selección Múltiple:**
   - Seleccionar 3 filas individuales
   - Usar "Seleccionar todos"
   - Ver barra de acciones flotante
   - Eliminar seleccionados
   - Cancelar selección

5. **Modal de Detalle:**
   - Ver detalle de oficina
   - Verificar todas las secciones
   - Ver gráfico de uso
   - Ver elementos relacionados
   - Editar desde modal

6. **Responsividad:**
   - Probar en desktop (1920px)
   - Probar en tablet (768px)
   - Probar en mobile (375px)
   - Verificar que todo sea usable

7. **Validaciones:**
   - Intentar eliminar con documentos asociados
   - Verificar mensaje de error claro
   - Confirmar alternativa (marcar inactivo)
   - Probar validaciones de formularios

**Siguiente Paso:**
Con la interfaz frontend profesional completada, el sistema de tipologías estará listo. Procederemos con PROMPT 010-4 para mejorar el sistema de auditoría con visualización avanzada.

---

### PROMPT 010-4: Sistema de Auditoría con Visualización Avanzada y Análisis de Comportamiento

**Contexto:**
El sistema de auditoría registra todas las acciones pero la interfaz actual es básica. La mejoraremos con analytics avanzados, visualizaciones interactivas, detección de patrones, alertas de seguridad, y un diseño profesional siguiendo el patrón del módulo de Reportes.

**Objetivo:**
Transformar el módulo de auditoría en una herramienta profesional de monitoreo y análisis, con visualizaciones avanzadas, detección de anomalías, reportes personalizables, y diseño intuitivo que permita tomar decisiones informadas sobre la seguridad y uso del sistema.

**Instrucciones:**

**BACKEND (Analytics y Detección Avanzada):**

1. **Ampliar servicio de auditoría (src/services/audit.service.ts):**
   
   Agregar funciones avanzadas:
   
   - `getAdvancedAnalytics(dateRange)`: Analytics detallados
     * Acciones por día/hora/día de semana
     * Usuarios más activos y menos activos
     * Módulos más y menos utilizados
     * Picos de actividad (horarios, días)
     * Distribución de acciones por tipo (CREATE, UPDATE, DELETE, etc.)
     * Tendencias de uso (comparativa con periodos anteriores)
   
   - `detectAnomalies(thresholds)`: Detección de comportamientos anómalos
     * Accesos fuera de horario laboral
     * Múltiples intentos de login fallidos
     * Eliminaciones masivas inusuales
     * Accesos desde IPs desconocidas
     * Patrones inusuales de acceso a módulos sensibles
   
   - `getUserActivityPattern(userId, dateRange)`: Patrón de actividad de usuario
     * Horas preferidas de actividad
     * Módulos más utilizados
     * Acciones más frecuentes
     * Comparativa con promedio de usuarios
   
   - `getSecurityAlerts()`: Alertas de seguridad
     * Accesos sospechosos recientes
     * Cambios en configuraciones críticas
     * Intentos de acceso no autorizados
   
   - `generateCustomReport(filters, groupBy, metrics)`: Reportes personalizados
     * Agrupación flexible (por usuario, módulo, acción, fecha)
     * Métricas seleccionables
     * Formatos: JSON, CSV, Excel, PDF

2. **Crear endpoints de analytics:**
   
   ```
   GET  /api/audit/analytics/advanced          - Analytics avanzados
   GET  /api/audit/analytics/anomalies         - Detección de anomalías
   GET  /api/audit/analytics/user/:id/pattern  - Patrón de usuario
   GET  /api/audit/security/alerts             - Alertas de seguridad
   POST /api/audit/reports/custom              - Generar reporte personalizado
   ```

**FRONTEND (Rediseño Completo con Visualización Avanzada):**

3. **Crear dashboard de analytics avanzados (components/audit/AuditAnalyticsDashboard.tsx):**
   
   - Sección superior con cards de métricas clave (usando StatCard):
     * Total de acciones en periodo
     * Usuarios activos únicos
     * Módulos accedidos
     * Alertas de seguridad pendientes
   
   - Grid con gráficos interactivos usando recharts:
     * Línea temporal de actividad (últimos 30 días) - interactivo
     * Heatmap de actividad por día/hora
     * Top 10 usuarios más activos (barras horizontales)
     * Distribución de acciones por módulo (pie chart)
     * Distribución de tipos de acción (dona chart)
     * Gráfico de líneas comparativo (mes actual vs anterior)
   
   - Selector de rango de fechas con presets (Hoy, Última semana, Último mes, Personalizado)
   - Botones de acceso rápido a secciones específicas

4. **Crear panel de detección de anomalías (components/audit/AnomaliesPanel.tsx):**
   
   - Lista de anomalías detectadas con prioridad (Alta, Media, Baja)
   - Card por anomalía con:
     * Tipo de anomalía y descripción
     * Usuario y timestamp
     * Detalles técnicos (IP, User Agent, módulo)
     * Acciones: Ver detalle, Marcar como revisada, Ignorar
     * Estado: Nueva, En revisión, Resuelta
   - Filtros por tipo de anomalía y estado
   - Contador de anomalías nuevas en tiempo real
   - Notificaciones en navbar cuando hay anomalías críticas

5. **Crear visualización de patrón de usuario (components/audit/UserActivityPattern.tsx):**
   
   - Gráfico de radar mostrando uso de módulos
   - Heatmap de horas de actividad (días de la semana x horas del día)
   - Timeline de acciones recientes
   - Comparativa con promedio del sistema
   - Métricas destacadas (módulo favorito, hora preferida, acción más común)
   - Botón para ver perfil completo del usuario

6. **Mejorar tabla de auditoría (components/audit/AuditTable.tsx):**
   
   - Filtros avanzados en columnas
   - Color coding por tipo de acción (verde=create, azul=update, rojo=delete, etc.)
   - Iconos representativos por módulo
   - Columna de "Impacto" (bajo, medio, alto) según tipo de acción
   - Expandible para ver detalles sin modal
   - Agrupación por sesión de usuario
   - Exportación de logs filtrados

7. **Crear modal de detalle avanzado (components/audit/AuditDetailAdvancedModal.tsx):**
   
   - Tabs organizados:
     * Información general
     * Cambios realizados (diff visual mejorado con syntax highlighting)
     * Contexto de la acción (acciones antes/después)
     * Información técnica (IP, User Agent parseado, geolocalización si disponible)
     * Usuario y sesión
   - Línea de tiempo de la sesión completa
   - Botón para ver todas las acciones del usuario ese día
   - Botón para generar reporte de esta acción

8. **Crear generador de reportes personalizados (components/audit/CustomReportGenerator.tsx):**
   
   - Selector de rango de fechas
   - Filtros múltiples (usuarios, módulos, acciones, IPs)
   - Opciones de agrupación (por día, semana, mes, usuario, módulo)
   - Selección de métricas a incluir
   - Preview del reporte antes de generar
   - Opciones de formato (CSV, Excel, PDF)
   - Guardar configuración de reporte para reutilizar
   - Programar reportes recurrentes (opcional)

9. **Implementar panel de alertas de seguridad (components/audit/SecurityAlertsPanel.tsx):**
   
   - Cards de alertas con severidad codificada por color
   - Detalles de cada alerta: tipo, usuario, timestamp, descripción
   - Acciones rápidas: Ver detalle, Resolver, Escalar
   - Filtros por severidad y estado
   - Historial de alertas resueltas
   - Configuración de umbrales de detección

10. **Refactorizar página de auditoría (app/(dashboard)/admin/auditoria/page.tsx):**
    
    Diseño con Tabs principales:
    
    - **Tab "Dashboard"**: AuditAnalyticsDashboard completo
    - **Tab "Logs"**: Tabla mejorada con filtros avanzados
    - **Tab "Anomalías"**: AnomaliesPanel
    - **Tab "Reportes"**: CustomReportGenerator
    - **Tab "Alertas"**: SecurityAlertsPanel
    
    Header consistente con:
    - Título con icono
    - Selector de rango de fechas global
    - Botón de "Actualizar datos"
    - Indicador de última actualización
    - Botones de acceso rápido

**Mejoras de Usabilidad y Funcionalidad:**

11. **Sistema de notificaciones:**
    - Badge en sidebar con contador de alertas
    - Notificaciones toast para anomalías críticas
    - Panel de notificaciones en navbar

12. **Búsqueda inteligente:**
    - Búsqueda global en todos los logs
    - Autocompletado con sugerencias
    - Búsqueda por IP, User Agent, términos en cambios
    - Guardado de búsquedas frecuentes

13. **Comparativas y tendencias:**
    - Comparar periodos (este mes vs mes pasado)
    - Tendencias con flechas (↑↓) en métricas
    - Predicciones simples (si continúa esta tendencia...)

**Criterios de Éxito:**
- ✅ Dashboard de analytics muestra información valiosa y accionable
- ✅ Gráficos son interactivos y responsive
- ✅ Detección de anomalías identifica comportamientos sospechosos
- ✅ Alertas de seguridad son claras y priorizadas
- ✅ Patrón de usuario es fácil de entender
- ✅ Generador de reportes personalizados es flexible
- ✅ Tabla mejorada con todas las funcionalidades
- ✅ Modal de detalle proporciona contexto completo
- ✅ Exportación de datos funciona en todos los formatos
- ✅ Diseño es moderno, limpio y profesional
- ✅ Navegación entre secciones es intuitiva
- ✅ Cumple con estándares de usabilidad y APA 7

**Testing Manual:**
1. Dashboard de Analytics:
   - Verificar métricas en cards
   - Interactuar con gráficos (hover, click)
   - Cambiar rango de fechas
   - Ver comparativas de periodos

2. Detección de Anomalías:
   - Verificar lista de anomalías
   - Ver detalle de una anomalía
   - Marcar como revisada
   - Filtrar por tipo y severidad

3. Reportes Personalizados:
   - Configurar filtros complejos
   - Seleccionar métricas
   - Preview del reporte
   - Generar en CSV, Excel y PDF
   - Guardar configuración

4. Logs y Búsqueda:
   - Usar filtros avanzados
   - Buscar término específico
   - Ver detalle expandido
   - Exportar logs filtrados

5. Alertas de Seguridad:
   - Ver alertas pendientes
   - Resolver una alerta
   - Verificar historial

**Siguiente Paso:**
Con el sistema de auditoría avanzado, procederemos con PROMPT 010-5 para el perfeccionamiento final de usabilidad y accesibilidad en todo el módulo de administración.

---

### PROMPT 010-5: Perfeccionamiento de Usabilidad, Accesibilidad y Consistencia Final del Módulo de Administración

**Contexto:**
Los módulos de Usuarios, Roles, Tipologías y Auditoría han sido mejorados individualmente. Ahora realizaremos un perfeccionamiento final para garantizar consistencia total, excelente usabilidad, accesibilidad WCAG 2.1 AA, y cumplimiento estricto de normas APA 7 para un sistema CEO-ready de nivel empresarial.

**Objetivo:**
Pulir y perfeccionar todo el módulo de administración para alcanzar los más altos estándares de usabilidad, accesibilidad, consistencia visual, y experiencia de usuario, asegurando que el sistema sea intuitivo, accesible para todos los usuarios, y cumpla con normativas internacionales.

**Instrucciones:**

**CONSISTENCIA VISUAL Y DE DISEÑO:**

1. **Crear sistema de diseño documentado (Design System):**
   
   En `frontend/lib/design-system.md` documentar:
   
   - Paleta de colores oficial con nombres semánticos
   - Tipografía: tamaños, pesos, line-heights para cada elemento
   - Espaciado: sistema de spacing (4, 8, 16, 24, 32, 48, 64px)
   - Componentes: estados (default, hover, active, disabled, loading)
   - Iconografía: set de iconos usado y guías de uso
   - Animaciones: duraciones y easing estándar
   - Layouts: patrones de grid y alineaciones

2. **Estandarizar todos los componentes:**
   
   Revisar y homogeneizar:
   
   - Botones: tamaños (sm, md, lg), variantes consistentes
   - Cards: padding, bordes, sombras uniformes
   - Modales: tamaños máximos, espaciado interno consistente
   - Formularios: etiquetas alineadas, mensajes de error posicionados igual
   - Tablas: altura de filas, padding de celdas, colores alternos
   - Badges: tamaños y colores según propósito
   - Tooltips: posicionamiento y estilos uniformes

3. **Implementar tema oscuro (opcional pero recomendado):**
   
   - Crear paleta de colores para tema oscuro
   - Toggle en configuración de usuario
   - Guardar preferencia en localStorage
   - Aplicar tema en todos los componentes

**USABILIDAD Y EXPERIENCIA DE USUARIO:**

4. **Mejorar feedback visual en toda la aplicación:**
   
   - Loading states en todos los botones con spinner
   - Skeleton loaders consistentes mientras cargan datos
   - Animaciones de transición suaves (fade, slide)
   - Confirmación visual de acciones exitosas (checkmark animation)
   - Progress indicators para operaciones largas
   - Estados vacíos atractivos e informativos (empty states)
   - Estados de error informativos con sugerencias de solución

5. **Implementar sistema de notificaciones mejorado:**
   
   - Toast notifications con tipos: success, error, warning, info
   - Posicionamiento consistente (top-right recomendado)
   - Auto-dismiss con tiempo configurable
   - Opción de deshacer acciones recientes (undo)
   - Cola de notificaciones para múltiples
   - Notificaciones persistentes para alertas críticas
   - Sonido opcional para notificaciones importantes

6. **Crear sistema de ayuda contextual:**
   
   - Tooltips informativos en cada campo de formulario
   - Iconos de ayuda (?) con información detallada
   - Tour guiado para nuevos usuarios (intro.js o similar)
   - Sección de ayuda con FAQs por módulo
   - Links a documentación relevante
   - Videos tutoriales embed (si disponibles)
   - Chatbot de ayuda básico (opcional)

7. **Implementar atajos de teclado:**
   
   - Documentar atajos en modal de ayuda
   - Atajos globales:
     * Ctrl+K: Búsqueda global
     * Ctrl+S: Guardar formulario actual
     * Esc: Cerrar modal/dialog actual
     * Alt+N: Crear nuevo (en página de lista)
   - Atajos específicos por módulo
   - Indicadores visuales de atajos disponibles

**ACCESIBILIDAD (WCAG 2.1 AA):**

8. **Garantizar navegación por teclado:**
   
   - Todos los elementos interactivos accesibles con Tab
   - Orden de tabulación lógico y predecible
   - Focus indicators visibles y de alto contraste
   - Skip links para saltar navegación
   - Escape para cerrar modales
   - Flechas para navegar en menús

9. **Implementar ARIA labels y roles:**
   
   - aria-label en iconos sin texto
   - aria-describedby en campos con ayuda contextual
   - role="alert" en mensajes de error
   - aria-live para actualizaciones dinámicas
   - aria-expanded en menús desplegables
   - aria-selected en tabs activos
   - aria-hidden en elementos decorativos

10. **Asegurar contraste de colores:**
    
    - Ratio mínimo 4.5:1 para texto normal
    - Ratio mínimo 3:1 para texto grande
    - Verificar con herramientas (WebAIM, WAVE)
    - Ajustar colores que no cumplan
    - No usar solo color para comunicar información

11. **Hacer formularios completamente accesibles:**
    
    - Labels asociados correctamente con inputs (htmlFor/id)
    - Mensajes de error asociados con aria-describedby
    - Required fields indicados visualmente (*) y con aria-required
    - Instrucciones claras antes de cada sección
    - Validación en tiempo real con feedback inmediato
    - Autocomplete hints apropiados

**RESPONSIVE DESIGN Y MOBILE-FIRST:**

12. **Optimizar para móviles y tablets:**
    
    - Testear en breakpoints: 320px, 768px, 1024px, 1440px
    - Menú hamburger funcional en mobile
    - Tablas scrollables horizontalmente o con vista alternativa en mobile
    - Modales full-screen en mobile
    - Botones con área de toque mínima 44x44px
    - Inputs con tamaño adecuado para touch
    - Espaciado generoso para evitar clicks accidentales

**CUMPLIMIENTO DE NORMAS APA 7:**

13. **Estandarizar formato de textos:**
    
    - Títulos: usar jerarquía clara (H1, H2, H3)
    - Capitalización: Title Case para títulos, Sentence case para descripciones
    - Números: formato consistente (1.000 vs 1,000)
    - Fechas: formato estándar (DD/MM/YYYY)
    - Horas: formato 24h o 12h consistente
    - Unidades: con espacios adecuados

14. **Garantizar lenguaje claro y profesional:**
    
    - Evitar jerga técnica en mensajes al usuario
    - Usar voz activa y presente
    - Mensajes de error constructivos (qué pasó + cómo solucionarlo)
    - Confirmaciones claras sin ambigüedades
    - Consistencia terminológica (no variar términos para lo mismo)

**RENDIMIENTO Y OPTIMIZACIÓN:**

15. **Optimizar carga y rendimiento:**
    
    - Lazy loading de componentes pesados
    - Imágenes optimizadas y con lazy loading
    - Code splitting por rutas
    - Debounce en búsquedas y filtros
    - Memoización de cálculos pesados
    - Virtual scrolling en listas largas
    - Cache de peticiones frecuentes

16. **Implementar Progressive Web App (PWA) básico:**
    
    - Service worker para cache de assets
    - Manifest.json con iconos y metadata
    - Funciona offline (al menos mostrar mensaje)
    - Installable desde navegador

**TESTING Y VALIDACIÓN FINAL:**

17. **Realizar auditorías:**
    
    - Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
    - Objetivo: scores > 90 en todos
    - axe DevTools para accesibilidad automática
    - Pruebas manuales con lectores de pantalla (NVDA/JAWS)

18. **Testing cross-browser:**
    
    - Chrome (última versión)
    - Firefox (última versión)
    - Safari (última versión)
    - Edge (última versión)
    - Documentar cualquier incompatibilidad

19. **Testing con usuarios reales:**
    
    - Pruebas con usuarios finales (administradores reales)
    - Recopilar feedback de usabilidad
    - Identificar puntos de fricción
    - Iterar según feedback

**DOCUMENTACIÓN FINAL:**

20. **Crear guías de usuario:**
    
    - Manual de usuario por rol (Administrador, Operador)
    - Capturas de pantalla de cada funcionalidad
    - Videos tutoriales cortos (2-3 min cada uno)
    - FAQs comunes
    - Troubleshooting básico

21. **Documentación técnica:**
    
    - Arquitectura de componentes
    - Guía de contribución
    - Estándares de código
    - Proceso de deploy
    - API documentation actualizada

**Criterios de Éxito:**
- ✅ Diseño 100% consistente en todo el módulo de administración
- ✅ Todos los componentes siguen el design system
- ✅ Usabilidad excelente con feedback visual claro
- ✅ Accesibilidad WCAG 2.1 AA completa
- ✅ Navegación por teclado funciona perfectamente
- ✅ Contraste de colores cumple estándares
- ✅ Responsive design funciona en todos los dispositivos
- ✅ Cumplimiento de normas APA 7 en textos
- ✅ Performance Lighthouse > 90 en todos los aspectos
- ✅ Testing cross-browser exitoso
- ✅ Documentación completa y clara

**Testing Final Completo:**

1. Auditoría de Accesibilidad:
   - Usar NVDA para navegar toda la aplicación
   - Verificar todos los elementos con axe DevTools
   - Testear solo con teclado (sin mouse)
   - Verificar contraste de colores

2. Auditoría de Usabilidad:
   - Completar tareas comunes sin instrucciones
   - Medir tiempo de completación
   - Identificar puntos de confusión
   - Verificar feedback en todas las acciones

3. Auditoría de Performance:
   - Lighthouse en diferentes páginas
   - Network throttling (3G, 4G)
   - Verificar tiempos de carga
   - Optimizar donde sea necesario

4. Auditoría de Diseño:
   - Verificar consistencia visual
   - Revisar todos los estados de componentes
   - Validar responsive en múltiples dispositivos
   - Screenshots de referencia

5. Testing de Integración:
   - Flujos completos end-to-end
   - Crear usuario → asignar rol → permisos → auditoría
   - Importar tipologías → usar en documentos → reportes
   - Verificar que todo funciona cohesivamente

**Entrega Final:**

Documentar y entregar:

- ✅ Código limpio y comentado
- ✅ Tests de componentes críticos
- ✅ Documentación técnica y de usuario
- ✅ Videos tutoriales
- ✅ Guías de accesibilidad implementadas
- ✅ Reporte de auditorías con scores
- ✅ Lista de mejoras futuras (opcional)

**Siguiente Paso:**
Con el Módulo de Administración completamente perfeccionado y profesionalizado, el sistema está listo para proceder con la FASE 3: MÓDULO DE ARCHIVO DIGITAL con el mismo nivel de calidad y profesionalismo.

---

## 🎯 FASE 3: MÓDULO DE ARCHIVO DIGITAL

---

### PROMPT 011: Gestión de Archivadores (Backend)

**Contexto:**
El módulo de administración está completo. Ahora iniciaremos el módulo de archivo digital, comenzando con la gestión de archivadores físicos.

**Objetivo:**
Crear API completa para gestión de archivadores con validaciones, búsqueda, y estadísticas.

**Instrucciones:**

1. **Crear servicio de archivadores (src/services/archivadores.service.ts):**
   
   - `getAllArchivadores(filters, pagination)`:
     * Filtros: periodId, search (código o nombre)
     * Paginación
     * Incluir: period, creator, count de documentos
     * Ordenar por: código ASC
   
   - `getArchivadorById(id)`:
     * Incluir: period, creator, documentos
     * Estadísticas: total documentos, total folios
   
   - `createArchivador(data)`:
     * Validar código único
     * Validar que periodo existe
     * Guardar ubicación física (JSON)
     * Registrar creador
     * Auditoría
   
   - `updateArchivador(id, data)`:
     * No permitir cambiar código
     * Validar periodo si cambia
     * Auditoría
   
   - `deleteArchivador(id)`:
     * Validar que no tenga documentos
     * Soft delete
     * Auditoría
   
   - `searchArchivadores(query)`:
     * Buscar en código y nombre
     * Retornar top 10
   
   - `getArchivadorStats(id)`:
     * Total documentos
     * Total folios
     * Documentos por tipo
     * Documentos por oficina

2. **Crear validaciones (src/utils/validators.ts):**
   
   ```typescript
   archivadorSchema = {
     code: Joi.string().required(),
     name: Joi.string().required(),
     periodId: Joi.string().uuid().required(),
     physicalLocation: Joi.object({
       estante: Joi.string().required(),
       modulo: Joi.string().required(),
       descripcion: Joi.string().optional()
     }).required()
   }
   ```

3. **Crear controlador (src/controllers/archivadores.controller.ts):**
   
   - getAll, getById, create, update, delete
   - search, getStats

4. **Crear rutas (src/routes/archivadores.routes.ts):**
   
   ```
   GET    /api/archivadores              - Listar
   GET    /api/archivadores/search       - Buscar
   GET    /api/archivadores/:id          - Obtener
   GET    /api/archivadores/:id/stats    - Estadísticas
   POST   /api/archivadores              - Crear (admin, operador)
   PUT    /api/archivadores/:id          - Actualizar (admin, operador)
   DELETE /api/archivadores/:id          - Eliminar (admin)
   ```

5. **Integrar en app.ts**

**Criterios de Éxito:**
- ✅ CRUD de archivadores funciona
- ✅ Validación de código único
- ✅ Ubicación física se guarda correctamente
- ✅ No se puede eliminar con documentos
- ✅ Búsqueda funciona
- ✅ Estadísticas se calculan
- ✅ Auditoría registra acciones

**Siguiente Paso:**
PROMPT 012 para crear la interfaz de archivadores.

---

### PROMPT 012: Gestión de Archivadores (Frontend)

**Contexto:**
La API de archivadores está funcionando. Ahora crearemos la interfaz completa de gestión.

**Objetivo:**
Implementar interfaz de gestión de archivadores con formulario de ubicación física, búsqueda, y vista de detalles.

**Instrucciones:**

1. **Crear tipos (types/archivador.types.ts):**
   
   ```typescript
   interface PhysicalLocation {
     estante: string;
     modulo: string;
     descripcion?: string;
   }
   
   interface Archivador {
     id: string;
     code: string;
     name: string;
     period: {
       id: string;
       year: number;
     };
     physicalLocation: PhysicalLocation;
     creator: {
       id: string;
       fullName: string;
     };
     documentCount: number;
     createdAt: string;
   }
   ```

2. **Crear servicio de API (lib/api/archivadores.ts)**

3. **Crear hook (hooks/useArchivadores.ts)**

4. **Crear formulario (components/archivadores/ArchivadorForm.tsx):**
   
   Campos:
   - Código (requerido)
   - Nombre (requerido)
   - Periodo (select, requerido)
   - Ubicación Física:
     * Estante (requerido)
     * Módulo (requerido)
     * Descripción referencial (opcional, textarea)
   
   Validaciones con zod

5. **Crear tabla (components/archivadores/ArchivadoresTable.tsx):**
   
   Columnas:
   - Código
   - Nombre
   - Periodo
   - Ubicación (estante - módulo)
   - Documentos (count)
   - Acciones

6. **Crear vista de detalles (components/archivadores/ArchivadorDetail.tsx):**
   
   Mostrar:
   - Información completa
   - Ubicación física detallada
   - Estadísticas
   - Lista de documentos (preview)
   - Botón ver todos los documentos

7. **Crear página (app/(dashboard)/archivo/archivadores/page.tsx):**
   
   - Tabla de archivadores
   - Filtros: periodo, búsqueda
   - Modal crear/editar
   - Modal detalles

8. **Agregar al sidebar:**
   - Sección "Archivo Digital"
   - Archivadores (admin, operador)

**Criterios de Éxito:**
- ✅ Tabla muestra archivadores
- ✅ Formulario valida correctamente
- ✅ Ubicación física se guarda
- ✅ Búsqueda funciona
- ✅ Vista de detalles completa
- ✅ Estadísticas se muestran
- ✅ CRUD completo funciona

**Siguiente Paso:**
PROMPT 013 para implementar la ingesta de documentos (backend).

---

### PROMPT 013: Ingesta de Documentos - Backend (Carga de Archivos)

**Contexto:**
Los archivadores están listos. Ahora implementaremos el sistema de carga de documentos con validación de PDFs, almacenamiento, y metadatos.

**Objetivo:**
Crear sistema completo de ingesta de documentos con validación de archivos, almacenamiento seguro, y procesamiento de metadatos.

**Instrucciones:**

1. **Configurar multer (src/config/multer.config.ts):**
   
   ```typescript
   const storage = multer.diskStorage({
     destination: (req, file, cb) => {
       cb(null, 'uploads/documents/');
     },
     filename: (req, file, cb) => {
       const uniqueName = `${Date.now()}-${uuidv4()}.pdf`;
       cb(null, uniqueName);
     }
   });
   
   const fileFilter = (req, file, cb) => {
     if (file.mimetype === 'application/pdf') {
       cb(null, true);
     } else {
       cb(new Error('Solo archivos PDF permitidos'), false);
     }
   };
   
   export const upload = multer({
     storage,
     fileFilter,
     limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
   });
   ```

2. **Crear servicio de almacenamiento (src/services/storage.service.ts):**
   
   - `saveFile(file)`: Guardar archivo y retornar path
   - `deleteFile(path)`: Eliminar archivo
   - `getFile(path)`: Obtener archivo
   - `validatePDF(file)`: Validar formato PDF
   - `getFileSize(path)`: Obtener tamaño
   - `generateUniqueName()`: Generar nombre único

3. **Crear servicio de documentos (src/services/documents.service.ts):**
   
   - `createDocument(fileData, metadata)`:
     * Validar que archivador existe
     * Validar que tipo de documento existe
     * Validar que oficina existe
     * Guardar archivo con storage.service
     * Crear registro en base de datos
     * Iniciar proceso OCR (asíncrono)
     * Registrar en auditoría
     * Retornar documento creado
   
   - `createDocumentsBatch(files, commonMetadata, specificMetadata)`:
     * Procesar múltiples archivos
     * Validar cada archivo
     * Guardar todos los archivos
     * Crear registros en batch
     * Iniciar OCR para todos
     * Retornar resumen (exitosos, fallidos)
   
   - `getDocumentById(id)`:
     * Incluir: archivador, tipo, oficina, creator, versiones
   
   - `getAllDocuments(filters, pagination)`:
     * Filtros: archivadorId, documentTypeId, officeId, dateFrom, dateTo
     * Paginación
     * Incluir relaciones
   
   - `updateDocument(id, metadata)`:
     * Solo actualizar metadatos
     * No permitir cambiar archivo
     * Auditoría
   
   - `deleteDocument(id)`:
     * Soft delete
     * No eliminar archivo físico (mantener historial)
     * Auditoría
   
   - `downloadDocument(id)`:
     * Validar permisos
     * Registrar descarga en auditoría
     * Retornar stream del archivo

4. **Crear validaciones (src/utils/validators.ts):**
   
   ```typescript
   documentSchema = {
     archivadorId: Joi.string().uuid().required(),
     documentTypeId: Joi.string().uuid().required(),
     officeId: Joi.string().uuid().required(),
     documentNumber: Joi.string().required(),
     documentDate: Joi.date().required(),
     sender: Joi.string().required(),
     folioCount: Joi.number().integer().min(1).required(),
     annotations: Joi.string().allow('').optional()
   }
   ```

5. **Crear controlador (src/controllers/documents.controller.ts):**
   
   - `upload`: POST /api/documents/upload
     * Usar multer middleware
     * Validar metadata
     * Llamar a service.createDocument
   
   - `uploadBatch`: POST /api/documents/upload-batch
     * Usar multer.array middleware
     * Validar metadata común y específica
     * Llamar a service.createDocumentsBatch
   
   - `getAll`: GET /api/documents
   - `getById`: GET /api/documents/:id
   - `update`: PUT /api/documents/:id
   - `delete`: DELETE /api/documents/:id
   - `download`: GET /api/documents/:id/download

6. **Crear middleware de upload (src/middlewares/upload.middleware.ts):**
   
   - Validar tamaño de archivo
   - Validar tipo MIME
   - Manejar errores de multer
   - Limpiar archivos en caso de error

7. **Crear rutas (src/routes/documents.routes.ts):**
   
   ```
   POST   /api/documents/upload         - Subir documento (admin, operador)
   POST   /api/documents/upload-batch   - Subir múltiples (admin, operador)
   GET    /api/documents                - Listar documentos
   GET    /api/documents/:id            - Obtener documento
   GET    /api/documents/:id/download   - Descargar documento
   PUT    /api/documents/:id            - Actualizar metadatos (admin, operador)
   DELETE /api/documents/:id            - Eliminar documento (admin)
   ```

8. **Integrar en app.ts**

**Criterios de Éxito:**
- ✅ Carga de archivo individual funciona
- ✅ Carga masiva funciona
- ✅ Validación de PDF funciona
- ✅ Archivos se guardan correctamente
- ✅ Metadatos se guardan en BD
- ✅ Descarga de documentos funciona
- ✅ Auditoría registra cargas y descargas
- ✅ Manejo de errores robusto

**Testing Manual:**
```bash
# Subir documento
POST http://localhost:5000/api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer [token]

file: [archivo.pdf]
archivadorId: [uuid]
documentTypeId: [uuid]
officeId: [uuid]
documentNumber: "001-2025"
documentDate: "2025-01-15"
sender: "Juan Pérez"
folioCount: 5
annotations: "Informe mensual"
```

**Siguiente Paso:**
PROMPT 014 para crear la interfaz de ingesta de documentos.

---

### PROMPT 014: Ingesta de Documentos - Frontend (Interfaz de Carga)

**Contexto:**
La API de documentos está funcionando. Ahora crearemos la interfaz de carga con drag & drop, preview, y formulario de metadatos.

**Objetivo:**
Implementar interfaz completa de ingesta de documentos con carga individual y masiva, validaciones, y feedback visual.

**Instrucciones:**

1. **Crear tipos (types/document.types.ts):**
   
   ```typescript
   interface Document {
     id: string;
     archivador: {
       id: string;
       code: string;
       name: string;
     };
     documentType: {
       id: string;
       name: string;
     };
     office: {
       id: string;
       name: string;
     };
     documentNumber: string;
     documentDate: string;
     sender: string;
     folioCount: number;
     annotations: string;
     fileName: string;
     fileSize: number;
     currentVersion: number;
     creator: {
       id: string;
       fullName: string;
     };
     createdAt: string;
   }
   
   interface DocumentMetadata {
     archivadorId: string;
     documentTypeId: string;
     officeId: string;
     documentNumber: string;
     documentDate: string;
     sender: string;
     folioCount: number;
     annotations?: string;
   }
   ```

2. **Crear servicio de API (lib/api/documents.ts):**
   
   ```typescript
   export const documentsApi = {
     upload: (file: File, metadata: DocumentMetadata) => {
       const formData = new FormData();
       formData.append('file', file);
       Object.keys(metadata).forEach(key => {
         formData.append(key, metadata[key]);
       });
       return api.post('/documents/upload', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
     },
     
     uploadBatch: (files: File[], commonMetadata, specificMetadata) => {
       const formData = new FormData();
       files.forEach(file => formData.append('files', file));
       formData.append('commonMetadata', JSON.stringify(commonMetadata));
       formData.append('specificMetadata', JSON.stringify(specificMetadata));
       return api.post('/documents/upload-batch', formData);
     },
     
     getAll: (params) => api.get('/documents', { params }),
     getById: (id) => api.get(`/documents/${id}`),
     download: (id) => api.get(`/documents/${id}/download`, {
       responseType: 'blob'
     }),
     update: (id, data) => api.put(`/documents/${id}`, data),
     delete: (id) => api.delete(`/documents/${id}`)
   };
   ```

3. **Crear hook (hooks/useDocuments.ts)**

4. **Crear componente de carga de archivos (components/documents/FileUploader.tsx):**
   
   Features:
   - Drag & drop zone
   - Click para seleccionar
   - Múltiples archivos
   - Preview de archivos seleccionados
   - Validación de tipo (solo PDF)
   - Validación de tamaño (max 50MB)
   - Mostrar tamaño de cada archivo
   - Botón para remover archivos
   - Barra de progreso de carga
   
   Usar react-dropzone

5. **Crear formulario de metadatos (components/documents/DocumentMetadataForm.tsx):**
   
   Campos:
   - Archivador (select con búsqueda)
   - Tipo de documento (select)
   - Oficina (select con búsqueda)
   - Número de documento (input)
   - Fecha del documento (date picker)
   - Remitente (input)
   - Número de folios (number input)
   - Anotaciones (textarea)
   
   Validaciones con zod

6. **Crear página de carga individual (app/(dashboard)/archivo/documentos/nuevo/page.tsx):**
   
   Layout:
   - Paso 1: Seleccionar archivo (FileUploader)
   - Paso 2: Ingresar metadatos (DocumentMetadataForm)
   - Paso 3: Confirmar y subir
   
   Wizard con pasos:
   - Indicador de paso actual
   - Botones: Anterior, Siguiente, Cancelar, Subir
   - Validar cada paso antes de avanzar

7. **Crear página de carga masiva (app/(dashboard)/archivo/documentos/carga-masiva/page.tsx):**
   
   Layout:
   - Seleccionar múltiples archivos
   - Ingresar metadatos comunes (archivador, periodo, oficina)
   - Tabla para ingresar metadatos específicos de cada archivo:
     * Columnas: Archivo, Tipo, Número, Fecha, Remitente, Folios, Anotaciones
     * Editable inline
   - Botón procesar carga
   - Mostrar progreso global
   - Mostrar progreso por archivo
   - Reporte final (exitosos/fallidos)

8. **Crear componente de preview PDF (components/documents/PDFPreview.tsx):**
   
   - Usar react-pdf
   - Mostrar primera página
   - Controles: zoom, página siguiente/anterior
   - Botón pantalla completa

9. **Crear tabla de documentos (components/documents/DocumentsTable.tsx):**
   
   Columnas:
   - Número
   - Fecha
   - Tipo
   - Remitente
   - Oficina
   - Archivador
   - Folios
   - Acciones (ver, descargar, editar, eliminar)

10. **Crear página de lista de documentos (app/(dashboard)/archivo/documentos/page.tsx):**
    
    - Tabla de documentos
    - Filtros avanzados
    - Búsqueda
    - Botones: Nuevo documento, Carga masiva

11. **Agregar rutas al sidebar:**
    - Documentos
    - Nuevo Documento
    - Carga Masiva

**Criterios de Éxito:**
- ✅ Drag & drop funciona
- ✅ Validación de archivos funciona
- ✅ Preview de PDF funciona
- ✅ Formulario de metadatos valida
- ✅ Carga individual exitosa
- ✅ Carga masiva funciona
- ✅ Progreso se muestra correctamente
- ✅ Tabla de documentos muestra datos
- ✅ Descarga de documentos funciona
- ✅ Filtros funcionan

**Testing Manual:**
1. Ir a Nuevo Documento
2. Arrastrar PDF
3. Llenar metadatos
4. Subir documento
5. Verificar en lista
6. Probar carga masiva
7. Descargar documento

**Siguiente Paso:**
PROMPT 015 para implementar el sistema de versiones y OCR.

---

### PROMPT 015: Sistema de Versiones y Procesamiento OCR (Backend)

**Contexto:**
La ingesta de documentos está funcionando. Ahora implementaremos el sistema de versiones y el procesamiento OCR para búsqueda de texto completo.

**Objetivo:**
Crear sistema de versiones automático y procesamiento OCR asíncrono para extracción de texto.

**Instrucciones:**

1. **Instalar dependencias:**
   ```
   npm install tesseract.js pdf-parse
   ```

2. **Crear servicio de OCR (src/services/ocr.service.ts):**
   
   ```typescript
   import Tesseract from 'tesseract.js';
   import pdfParse from 'pdf-parse';
   
   class OCRService {
     async extractTextFromPDF(filePath: string): Promise<string> {
       try {
         // Leer PDF
         const dataBuffer = fs.readFileSync(filePath);
         const pdfData = await pdfParse(dataBuffer);
         
         // Si el PDF ya tiene texto, retornarlo
         if (pdfData.text && pdfData.text.length > 100) {
           return pdfData.text;
         }
         
         // Si no, usar OCR (PDF escaneado)
         const text = await this.performOCR(filePath);
         return text;
       } catch (error) {
         console.error('Error en OCR:', error);
         throw error;
       }
     }
     
     private async performOCR(filePath: string): Promise<string> {
       // Convertir PDF a imágenes y aplicar OCR
       // Implementar lógica de OCR con Tesseract
       // Retornar texto extraído
     }
     
     async processDocument(documentId: string): Promise<void> {
       // Obtener documento de BD
       // Extraer texto
       // Actualizar campo ocrContent
       // Actualizar estado de procesamiento
     }
   }
   ```

3. **Crear servicio de versiones (src/services/versions.service.ts):**
   
   - `createVersion(documentId, filePath, description, userId)`:
     * Incrementar número de versión
     * Copiar archivo a nueva ubicación
     * Crear registro en DocumentVersion
     * Actualizar currentVersion en Document
     * Auditoría
   
   - `getVersions(documentId)`:
     * Listar todas las versiones
     * Ordenar por versionNumber DESC
   
   - `getVersionById(versionId)`:
     * Obtener versión específica
   
   - `restoreVersion(documentId, versionId, userId)`:
     * Validar permisos
     * Crear nueva versión con archivo de versión anterior
     * Actualizar currentVersion
     * Auditoría
   
   - `downloadVersion(versionId)`:
     * Retornar archivo de versión específica
     * Auditoría

4. **Crear cola de procesamiento (src/services/queue.service.ts):**
   
   Usar un sistema simple de cola en memoria o Redis:
   
   ```typescript
   class QueueService {
     private queue: Array<{id: string, documentId: string}> = [];
     private processing = false;
     
     async addToQueue(documentId: string) {
       this.queue.push({ id: uuidv4(), documentId });
       this.processQueue();
     }
     
     private async processQueue() {
       if (this.processing || this.queue.length === 0) return;
       
       this.processing = true;
       const item = this.queue.shift();
       
       try {
         await ocrService.processDocument(item.documentId);
       } catch (error) {
         console.error('Error procesando:', error);
       }
       
       this.processing = false;
       this.processQueue();
     }
   }
   ```

5. **Integrar OCR en documents.service:**
   
   En `createDocument`:
   ```typescript
   // Después de guardar documento
   await queueService.addToQueue(document.id);
   ```

6. **Crear endpoints de versiones:**
   
   En src/controllers/versions.controller.ts:
   - getVersions: GET /api/documents/:id/versions
   - getVersion: GET /api/documents/:id/versions/:versionId
   - restoreVersion: POST /api/documents/:id/versions/:versionId/restore
   - downloadVersion: GET /api/documents/:id/versions/:versionId/download

7. **Crear endpoints de OCR:**
   
   En src/controllers/documents.controller.ts:
   - getOCRStatus: GET /api/documents/:id/ocr-status
   - reprocessOCR: POST /api/documents/:id/reprocess-ocr

8. **Actualizar schema de Prisma:**
   
   Agregar campo en Document:
   ```prisma
   ocrStatus String @default("PENDING") // PENDING, PROCESSING, COMPLETED, ERROR
   ocrError String?
   ```

9. **Crear rutas:**
   ```
   GET  /api/documents/:id/versions
   GET  /api/documents/:id/versions/:versionId
   POST /api/documents/:id/versions/:versionId/restore
   GET  /api/documents/:id/versions/:versionId/download
   GET  /api/documents/:id/ocr-status
   POST /api/documents/:id/reprocess-ocr
   ```

**Criterios de Éxito:**
- ✅ OCR procesa documentos automáticamente
- ✅ Texto extraído se guarda en BD
- ✅ Cola de procesamiento funciona
- ✅ Versiones se crean correctamente
- ✅ Restaurar versión funciona
- ✅ Descarga de versiones funciona
- ✅ Estado de OCR se actualiza
- ✅ Reprocesar OCR funciona

**Testing Manual:**
1. Subir documento
2. Verificar que OCR inicia
3. Consultar estado de OCR
4. Verificar texto extraído
5. Crear nueva versión (al firmar)
6. Listar versiones
7. Restaurar versión anterior
8. Descargar versión específica

**Siguiente Paso:**
PROMPT 016 para implementar la gestión de expedientes electrónicos.

---

### PROMPT 016: Gestión de Expedientes Electrónicos (Backend)

**Contexto:**
El sistema de versiones y OCR está implementado. Ahora crearemos la API para gestionar expedientes electrónicos, permitiendo agrupar documentos relacionados.

**Objetivo:**
Crear la API completa para la gestión de expedientes electrónicos, incluyendo operaciones CRUD y la asociación de documentos.

**Instrucciones:**

1. **Actualizar `prisma/schema.prisma`:**
   
   Agregar el modelo `Expediente`:
   ```prisma
   model Expediente {
     id            String     @id @default(uuid())
     code          String     @unique
     name          String
     description   String?
     documents     Document[] // Relación con Document
     createdBy     User       @relation(fields: [createdById], references: [id])
     createdById   String
     createdAt     DateTime   @default(now())
     updatedAt     DateTime   @updatedAt
   
     @@map("expedientes")
   }
   
   // Actualizar modelo Document para incluir relación con Expediente
   model Document {
     // ... campos existentes ...
     expedienteId  String?    // FK a Expediente (opcional, un documento puede no estar en un expediente)
     expediente    Expediente? @relation(fields: [expedienteId], references: [id])
     // ... otras relaciones ...
   }
   ```
   
   - Ejecutar `npx prisma migrate dev --name add_expediente_model`
   - Ejecutar `npx prisma generate`

2. **Crear servicio de expedientes (src/services/expedientes.service.ts):**
   
   Implementar las siguientes funciones:
   
   - `getAllExpedientes(filters, pagination)`:
     * Filtros: search (código o nombre)
     * Paginación: page (default 1), limit (default 10)
     * Incluir count de documentos asociados
     * Ordenar por: createdAt DESC
     * Retornar: { expedientes, total, page, totalPages }
   
   - `getExpedienteById(id)`:
     * Incluir: documentos asociados (con metadatos básicos)
     * Lanzar error si no existe
   
   - `createExpediente(data)`:
     * Validar código único
     * Registrar creador
     * Auditoría
   
   - `updateExpediente(id, data)`:
     * No permitir cambiar código
     * Auditoría
   
   - `deleteExpediente(id)`:
     * Soft delete (o eliminar si no tiene documentos asociados, según RF-016)
     * Auditoría
   
   - `addDocumentsToExpediente(expedienteId, documentIds)`:
     * Validar que expediente y documentos existan
     * Validar que documentos no estén ya en otro expediente (o permitir, según RF-016)
     * Actualizar `expedienteId` en los documentos
     * Auditoría
   
   - `removeDocumentsFromExpediente(expedienteId, documentIds)`:
     * Validar que expediente y documentos existan
     * Poner `expedienteId` a null en los documentos
     * Auditoría

3. **Crear validaciones (src/utils/validators.ts):**
   
   Esquemas Joi para:
   
   - `createExpedienteSchema`:
     ```typescript
     {
       code: Joi.string().required(),
       name: Joi.string().required(),
       description: Joi.string().optional()
     }
     ```
   
   - `updateExpedienteSchema`:
     ```typescript
     {
       name: Joi.string().optional(),
       description: Joi.string().optional()
     }
     ```
   
   - `addRemoveDocumentsSchema`:
     ```typescript
     {
       documentIds: Joi.array().items(Joi.string().uuid()).min(1).required()
     }
     ```

4. **Crear controlador de expedientes (src/controllers/expedientes.controller.ts):**
   
   Implementar:
   
   - `getAll`: GET /api/expedientes
   - `getById`: GET /api/expedientes/:id
   - `create`: POST /api/expedientes
   - `update`: PUT /api/expedientes/:id
   - `delete`: DELETE /api/expedientes/:id
   - `addDocuments`: POST /api/expedientes/:id/documents
   - `removeDocuments`: DELETE /api/expedientes/:id/documents

5. **Crear rutas de expedientes (src/routes/expedientes.routes.ts):**
   
   ```
   GET    /api/expedientes                 - Listar expedientes (autenticado)
   GET    /api/expedientes/:id             - Obtener expediente (autenticado)
   POST   /api/expedientes                 - Crear expediente (autenticado, admin, operador)
   PUT    /api/expedientes/:id             - Actualizar expediente (autenticado, admin, operador)
   DELETE /api/expedientes/:id             - Eliminar expediente (autenticado, admin)
   POST   /api/expedientes/:id/documents   - Agregar documentos (autenticado, admin, operador)
   DELETE /api/expedientes/:id/documents   - Remover documentos (autenticado, admin, operador)
   ```
   
   Aplicar middlewares de autenticación y autorización.

6. **Integrar auditoría en `expedientes.service`:**
   
   - Registrar creación, actualización, eliminación, adición/remoción de documentos.

7. **Integrar rutas en `app.ts`**

**Criterios de Éxito:**
- ✅ Migración de Prisma ejecutada y modelo `Expediente` creado.
- ✅ CRUD de expedientes funciona correctamente.
- ✅ Se pueden agregar y remover documentos de un expediente.
- ✅ La validación de documentos en expedientes funciona (ej. no duplicados).
- ✅ La auditoría registra las acciones sobre expedientes.
- ✅ Las rutas están protegidas por autenticación y autorización.

**Testing Manual:**
```bash
# Crear expediente
POST http://localhost:5000/api/expedientes
Authorization: Bearer [token]
{
  "code": "EXP-001",
  "name": "Expediente de Contratos 2025",
  "description": "Contratos de servicios del año 2025"
}

# Agregar documentos a expediente
POST http://localhost:5000/api/expedientes/[expedienteId]/documents
Authorization: Bearer [token]
{
  "documentIds": ["[documentId1]", "[documentId2]"]
}

# Obtener expediente con documentos
GET http://localhost:5000/api/expedientes/[expedienteId]
Authorization: Bearer [token]
```

**Siguiente Paso:**
PROMPT 017 para crear la interfaz de gestión de expedientes en el frontend.

---

### PROMPT 016-1: Auditoría UX/UI y alineación visual del Módulo de Archivo Digital

**Contexto:**
Los submódulos de Archivadores, Documentos y Expedientes se implementaron con diseño funcional, pero aún presentan discrepancias visuales frente al módulo de Reportes y Analítica. Es necesario unificar la experiencia con un estilo minimalista, fondo blanco predominante, alto contraste y componentes limpios para mejorar usabilidad, accesibilidad (WCAG 2.1 AA) y cumplimiento de estándares ISO de gestión documental.

**Objetivo:**
Realizar una auditoría integral de UX/UI para la Fase 3, definir lineamientos visuales alineados al módulo de Reportes y Analítica, y entregar un Design Spec reutilizable que guíe los prompts siguientes.

**Instrucciones:**

1. **Inventario visual y funcional:**
   - Capturar screenshots de las vistas actuales de Archivadores, Documentos (lista, detalle, creación, carga masiva) y Expedientes (lista, detalle, modal de gestión de documentos).
   - Documentar componentes reutilizados (Cards, Tables, Dialogs, Badges, Tabs, Stepper) y variaciones ad-hoc.
   - Identificar inconsistencias frente al diseño de Reportes (espaciados, tipografías, uso de color, elevaciones, iconografía, badges, alerts, tablas).

2. **Definir Design Tokens y layout guidelines:**
   - Establecer paleta principal con fondo blanco (#FFFFFF), acentos en azul (#2563EB), gris neutro para texto (#111827, #4B5563) y estados de sistema (verde éxito, ámbar advertencia, rojo error) alineados con tailwind config.
   - Definir escala tipográfica (H1-H3, body, caption) y pesos según Inter/Roboto.
   - Definir espaciados verticales (24px secciones, 16px entre elementos), radio de bordes (12px en contenedores, 8px en inputs), sombras suaves (rgba(15,23,42,0.1)).
   - Especificar estados interactivos (hover, focus-visible con outline azul 2px, disabled, loading).

3. **Estándares de componentes clave:**
   - Tablas: encabezado sticky, zebra rows suaves (#F9FAFB), toolbars con filtros alineados, paginación consistente.
   - Cards y métricas: altura mínima 180px, iconografía atenuada, títulos en semibold, descripciones en muted.
   - Modals/Dialog: fondo blanco, padding 32px, títulos con icono, botones primarios/ secundarios, altura máxima 80vh con scroll interno.
   - Steppers y timelines: círculos con borde azul, líneas conectores finas, estados completado/en curso/pending.

4. **Accesibilidad y SEO interno:**
   - Checklist WCAG para contraste texto/fondo ≥ 4.5.
   - Garantizar navegación por teclado (tabindex, focus traps en modals, skip links si aplica).
   - Etiquetas ARIA en tablas, botones de acción, badges de estado.
   - Recomendaciones SEO interno: títulos H1/H2 semánticos, meta descriptions para vistas públicas (si existieran), breadcrumbs coherentes.

5. **Entregables:**
   - Documento `frontend/design/archivo-digital-style-guide.md` con capturas, hallazgos, tokens y guidelines.
   - Board Figma/penpot opcional, o JSON de tokens en `frontend/styles/tokens/archivo-digital.json` listo para consumo.
   - Plan de actualización incremental (prioridad alta para tablas y modals, media para cards, baja para microcopys).

**Criterios de Éxito:**
- ✅ Se documentan todas las inconsistencias visuales y funcionales.
- ✅ Se publica la guía de estilo con tokens y lineamientos aplicables.
- ✅ Los componentes clave tienen especificaciones claras compatibles con shadcn/ui.
- ✅ Checklist WCAG y recomendaciones SEO están completas.
- ✅ Existe plan de implementación priorizado para prompts posteriores.

**Siguiente Paso:**
Con los lineamientos definidos, proceder con PROMPT 016-2 para refactorizar la experiencia de Archivadores.

---

### PROMPT 016-2: Refactor de UX/UI de Archivadores con dashboards operativos

**Contexto:**
La vista actual de Archivadores ofrece CRUD funcional, pero requiere un rediseño que adopte la guía creada en PROMPT 016-1, incorporando dashboards, métricas claras y flujos más intuitivos para usuarios no técnicos.

**Objetivo:**
Refactorizar las pantallas de Archivadores (lista, modales de creación/edición, detalle) con un layout moderno, limpio, accesible y alineado al módulo de Reportes.

**Instrucciones:**

1. **Reestructurar la vista principal (`app/dashboard/archivo/archivadores/page.tsx`):**
   - Implementar un header con métricas cards (total archivadores, ocupación promedio, top periodos) utilizando nuevos componentes `MetricCard`.
   - Convertir filtros en un `FiltersToolbar` responsivo con chips activos y botón “Limpiar”.
   - Reemplazar tabla por `EnhancedDataTable` con sticky header, zebra rows, botones en toolbar (exportar CSV/Excel, ver estadísticas).
   - Agregar vista alterna tipo grid cards (toggle Tabla/Cards) para usuarios que prefieren visual.

2. **Modal de creación/edición:**
   - Usar componente `FormDialog` generalizado con layout de dos columnas, labels arriba, inputs con hints.
   - Añadir validaciones inline y toast de éxito/error centralizado.
   - Proporcionar sección tooltip “Guía rápida” con tips de codificación ISO/periodo.

3. **Detalle de archivador (`getArchivadorById` vista modal/drawer):**
   - Cambiar modal por `RightPanelDrawer` ancho 480px, con tabs: Información, Documentos Recientes, Analítica.
   - Graficar distribución por tipo/oficina con microcharts (sparkline/pie mini) usando `ResponsiveSparkChart` reutilizable.
   - Añadir CTA “Ver todos los documentos” y breadcrumbs.

4. **Componentización y estilos:**
   - Crear carpeta `components/archivo/archivadores/` con: `ArchivadorMetrics`, `ArchivadoresToolbar`, `ArchivadoresTable`, `ArchivadorDrawer`.
   - Centralizar estilos en `frontend/styles/archivo-digital.scss` o tailwind plugin custom, siguiendo tokens de PROMPT 016-1.
   - Garantizar responsividad (breakpoints md, lg, xl) y preferencia de modo claro.

5. **Backend y performance:**
   - Exponer endpoint `GET /api/archivadores/analytics/overview` para métricas iniciales usando servicio `getArchivadoresGeneralStats` ya disponible.
   - Agregar cache layer (in-memory/zod-swr) para métricas de dashboard, invalidando tras CRUD.

**Criterios de Éxito:**
- ✅ La vista adopta el nuevo layout y respeta tokens definidos.
- ✅ Los formularios son accesibles, con validaciones claras y tooltips contextuales.
- ✅ El drawer de detalles muestra analítica visual limpia y exportable.
- ✅ Métricas iniciales cargan rápido (<500ms) y se cachean.
- ✅ Pruebas de usabilidad confirman que un usuario puede crear y localizar un archivador en <30s.

**Siguiente Paso:**
PROMPT 016-3 refactorizará las vistas del submódulo Documentos con la misma línea de diseño.

---

### PROMPT 016-3: Rediseño del ciclo de Documentos y flujos guiados

**Contexto:**
El módulo de Documentos cuenta con listado, detalle, wizard de carga y carga masiva. Es necesario unificar estilos, simplificar filtros, potenciar visualizaciones y agregar ayudas contextuales para usuarios sin formación técnica.

**Objetivo:**
Modernizar todas las vistas del submódulo Documentos, integrando dashboards, filtros avanzados accesibles, wizard guiado y detalle enriquecido con tabs coherentes.

**Instrucciones:**

1. **Página principal de Documentos (`app/dashboard/archivo/documentos/page.tsx`):**
   - Incorporar `DocumentsOverview` con tarjetas de métricas (nuevos, firmados, pendientes OCR) y gráfico de tendencia semanal.
   - Reemplazar filtros actuales por `AdvancedFilterPanel` colapsable con chips seleccionables y quick presets (Hoy, Últimos 7 días, Mes actual).
   - Tabla `DocumentsTable` debe soportar columnas configurables, densidad ajustable y resaltado de filas según estado (OCR_ERROR en ámbar, firmas pendientes en azul).
   - Añadir acciones masivas (descargar lote, asignar expediente, exportar) con barra contextual al seleccionar filas.

2. **Wizard de nuevo documento (`documentos/nuevo`):**
   - Adoptar stepper horizontal con estados “Archivo”, “Metadatos”, “Confirmar”, “Resumen final”.
   - Incluir validaciones en tiempo real, resumen de errores, indicadores de progreso.
   - Mostrar checklist de requisitos (PDF < 50MB, metadatos completos) y sección FAQ lateral.
   - Tras completar, presentar pantalla de éxito con CTA “Ver documento”, “Crear otro” y compartir enlace.

3. **Carga masiva:**
   - Rediseñar interfaz en dos paneles: lista de archivos con estado (pendiente, validado, error) y tabla editable de metadatos.
   - Implementar import/export de plantilla CSV para completar metadatos offline.
   - Añadir barra de progreso global y timeline de eventos.

4. **Detalle de documento (`documentos/[id]/page.tsx`):**
   - Ajustar header con breadcrumbs (Archivo Digital / Documentos / Número).
   - Tabs reorganizadas: Información, Versiones, Firmas, OCR, Expediente.
   - Integrar visor PDF en panel blanco con toolbar flotante minimalista.
   - Añadir timeline audit (acciones recientes) y sección de recomendaciones (ej. “Agregar a expediente”).

5. **Ayudas y accesibilidad:**
   - Incluir tooltips, glosario emergente (documentNumber, folios, etc.).
   - Soporte teclado completo y lectura de screen readers (labels aria, roles correctos en tabla).
   - Realizar test con Lighthouse (Performance, Accessibility, Best Practices, SEO ≥ 90) y documentar resultados.

**Criterios de Éxito:**
- ✅ Lista, wizard, carga masiva y detalle comparten visual limpio y minimalista.
- ✅ Filtros avanzados reducen el tiempo para localizar documentos a <15s.
- ✅ Carga masiva muestra feedback claro por archivo y plantilla CSV funciona.
- ✅ Pantalla de detalle ofrece navegación fluida entre tabs y visor.
- ✅ Auditoría y pruebas de accesibilidad superan umbrales definidos.

**Siguiente Paso:**
Continuar con PROMPT 016-4 para modernizar la experiencia de Expedientes.

---

### PROMPT 016-4: Experiencia integral de Expedientes con gestión visual

**Contexto:**
El submódulo de Expedientes ya permite CRUD y asociación de documentos, pero requiere un rediseño acorde a los nuevos lineamientos, con énfasis en organización visual, timeline de actividades y gestión masiva.

**Objetivo:**
Transformar las vistas de Expedientes para facilitar la consulta y administración de documentos relacionados mediante una interfaz moderna, blanca y ordenada.

**Instrucciones:**

1. **Listado de expedientes:**
   - Añadir hero con métricas (expedientes activos, documentos asociados, pendientes de completar).
   - Tabla avanzada con filtros por periodo, oficina, estado (activo/incompleto) y búsqueda semántica.
   - Vista tipo kanban opcional agrupada por estado o periodo.
   - Botón “Crear expediente” abre `FormDrawer` de ancho fijo con validación en tiempo real.

2. **Detalle de expediente (`expedientes/[id]`):**
   - Encabezado con resumen visual (código, nombre, propietario, fecha).
   - Tabs: Resumen, Documentos, Timeline, Auditoría.
   - Timeline cronológico de eventos (documento agregado/removido, versión actualizada, firma revertida) usando componentes reutilizables del módulo de auditoría.
   - En la tab Documentos, usar `DocumentsTable` adaptado con acciones específicas (quitar, ver, gestionar firma).

3. **Gestión de documentos en expediente:**
   - Convertir `AddRemoveDocumentsModal` en `DualListManager` accesible con listas virtualizadas, búsqueda con debounce y contador de selección.
   - Permitir filtro por estado de firma/ocr en disponibilidad.
   - Añadir resumen antes de guardar (x añadidos, y removidos) y soportar undo inmediato.

4. **Integraciones adicionales:**
   - Endpoint `GET /api/expedientes/:id/activity` para timeline (con paginación).
   - Servicios frontend con SWR caching e invalidación post mutaciones.
   - Hooks personalizados `useExpedienteActivity`, `useExpedienteMetrics`.

5. **Doc y pruebas:**
   - Actualizar historias en Storybook/Chromatic para nuevos componentes.
   - Pruebas de regresión visual y test de accesibilidad (axe-core) en rutas clave.

**Criterios de Éxito:**
- ✅ Listado y detalle siguen guía de diseño minimalista y clara.
- ✅ Timeline refleja eventos del expediente en orden y con iconografía consistente.
- ✅ DualListManager simplifica agregados/remociones con feedback inmediato.
- ✅ Integraciones backend responden en <400ms y usan cache local.
- ✅ Storybook refleja componentes renovados y pruebas pasan sin regresiones.

**Siguiente Paso:**
PROMPT 016-5 incorporará ayudas contextuales, onboarding y mejoras de microcopy.

---

### PROMPT 016-5: Onboarding, ayudas contextuales y microcopy profesional

**Contexto:**
Tras el rediseño visual, se requiere asegurar que usuarios novatos comprendan los flujos y terminología del Archivo Digital mediante onboarding ligero, tooltips contextuales y textos objetivo alineados con estándares ISO y SEO interno.

**Objetivo:**
Implementar ayudas proactivas, microcopys consistentes y recursos de aprendizaje in-app para toda la Fase 3.

**Instrucciones:**

1. **Onboarding progresivo:**
   - Integrar `CoachMarks` (librería ligera o componente propio) que guíe primeras acciones en Archivadores, Documentos y Expedientes.
   - Persistir estado de onboarding por usuario (localStorage + backend flag) para no mostrar repetidamente.
   - Incluir botón “Ver tour nuevamente” en help dropdown.

2. **Tooltips y glosario:**
   - Crear `HelpTooltip` componente que aporte definiciones claras (folio, expediente, OCR, versión).
   - Vincular glosario con ícono “?” en formularios y tablas.
   - Asegurar accesibilidad: tooltips activables con teclado, lecturas aria-live.

3. **Microcopy y textos estratégicos:**
   - Revisar todos los títulos, subtítulos, placeholders, mensajes vacíos y toasts para adoptar tono profesional, claro y motivador.
   - Ajustar mensajes de error a formato: “Qué sucedió + Cómo resolverlo”.
   - Añadir metadatos SEO (title/description) en layout de secciones (Next.js metadata API) con palabras clave relevantes.

4. **Centro de ayuda in-app:**
   - Crear `HelpCenterDrawer` con FAQs, enlaces a manuales, videos e índice rápido.
   - Integrar buscador interno.

5. **Pruebas con usuarios:**
   - Conducir pruebas de usabilidad moderadas (≥5 personas), recopilar feedback y sintetizar mejoras pendientes.
   - Documentar hallazgos en `docs/usability/fase3-onboarding-report.md` con acciones propuestas.

**Criterios de Éxito:**
- ✅ Onboarding muestra los pasos iniciales sin saturar y se puede reactivar.
- ✅ Tooltips y glosario cubren términos clave, son accesibles y útiles.
- ✅ Microcopy mantiene consistencia, tono profesional y cumple estándares ISO/SEO.
- ✅ Centro de ayuda funcional con contenido estructurado y buscable.
- ✅ Reporte de pruebas de usuario contiene insights accionables y plan de seguimiento.

**Siguiente Paso:**
PROMPT 016-6 optimizará el backend y servicios compartidos para soportar la nueva experiencia.

---

### PROMPT 016-6: Optimización backend y servicios compartidos para la nueva experiencia

**Contexto:**
Las mejoras frontend requieren endpoints más eficientes, caches y servicios consistentes que respalden dashboards, timelines y filtros avanzados sin degradar performance.

**Objetivo:**
Actualizar el backend de la Fase 3 para proveer datos agregados, optimizar consultas, estandarizar respuestas y asegurar tiempos de respuesta acordes a la nueva UX.

**Instrucciones:**

1. **Endpoints de métricas y dashboards:**
   - Crear endpoints REST específicos:
     * `GET /api/archivo/overview` (métricas globales Archivadores/Documentos/Expedientes).
     * `GET /api/archivadores/:id/analytics` (usar y extender `getArchivadorAnalytics`).
     * `GET /api/documents/metrics` (nuevos, firmados, errores OCR, por periodo).
     * `GET /api/expedientes/:id/activity` (timeline paginado).
   - Implementar DTOs tipados y respuestas consistentes `{ status, message, data }`.

2. **Optimización de consultas:**
   - Revisar prisma queries para evitar N+1 (usar `include/select` necesarios, `count` agregados).
   - Agregar índices en campos usados en filtros (documentDate, signatureStatus, expedienteId).
   - Incluir caching (Redis/opcional) para métricas pesadas con invalidación en mutaciones.

3. **Servicios compartidos:**
   - Crear `analytics.service.ts` centralizando lógica de métricas comunes.
   - Añadir `timeline.service.ts` para construir timelines reutilizables (Archivadores, Documentos, Expedientes).
   - Implementar polices de autorización específicas (ej. solo roles con permiso `documents.export` pueden exportar).

4. **Testing y calidad:**
   - Agregar pruebas unitarias con Jest/ts-node para servicios y controladores nuevos.
   - Escribir pruebas de integración para endpoints de métricas (datos semilla).
   - Verificar logs y auditoría registran nuevas operaciones.

5. **Documentación técnica:**
   - Actualizar `backend/docs/api-archivo-digital.md` con endpoints, ejemplos payload.
   - Añadir diagramas de flujo (PlantUML/Mermaid) describiendo interacción front-back para dashboards y timelines.

**Criterios de Éxito:**
- ✅ Endpoints de métricas responden <300ms en promedio y retornan datos consistentes.
- ✅ Consultas optimizadas eliminan N+1 y tienen índices adecuados.
- ✅ Servicios compartidos centralizan lógica reduciendo duplicidad.
- ✅ Pruebas unitarias/integración cubren casos críticos con resultados positivos.
- ✅ Documentación actualizada permite a otros desarrolladores consumir los endpoints fácilmente.

**Siguiente Paso:**
Con backend optimizado, continuar con PROMPT 017 para la interfaz de expedientes u otras fases según la hoja de ruta.

---

## 🎯 FASE 4: MÓDULO DE BÚSQUEDA AVANZADA

---

### PROMPT 018: Motor de Búsqueda (Backend)

**Contexto:**
El módulo de archivo digital está completo. Ahora implementaremos el motor de búsqueda avanzada, que permitirá buscar documentos por metadatos y texto completo (Full-Text Search).

**Objetivo:**
Crear una API de búsqueda unificada que combine búsqueda por metadatos y Full-Text Search en el contenido OCR y anotaciones, con filtros, paginación y ordenamiento.

**Instrucciones:**

1. **Actualizar `prisma/schema.prisma`:**
   
   Asegurarse de que los campos `annotations` y `ocrContent` en el modelo `Document` tengan índices de texto completo (Full-Text Search) configurados. Para MySQL, esto implica usar `@@fulltext`.
   
   ```prisma
   model Document {
     // ... campos existentes ...
     annotations String? @db.Text
     ocrContent  String? @db.Text
     // ... otros campos ...
   
     @@index([documentNumber, documentDate, sender, officeId, documentTypeId, archivadorId, expedienteId])
     @@fulltext([annotations, ocrContent]) // Para Full-Text Search
   }
   ```
   
   - Ejecutar `npx prisma migrate dev --name add_fulltext_index` (si no se hizo antes).
   - Ejecutar `npx prisma generate`.

2. **Crear servicio de búsqueda (src/services/search.service.ts):**
   
   Implementar la función `searchDocuments(query, filters, pagination, sort)`:
   
   - `query`: String para búsqueda de texto completo (en `ocrContent`, `annotations`, `documentNumber`, `sender`, `name` de `DocumentType`, `Office`, `Archivador`).
   - `filters`: Objeto con filtros por metadatos:
     * `documentNumber`: String (búsqueda exacta o LIKE)
     * `dateFrom`, `dateTo`: Rango de fechas para `documentDate`
     * `documentTypeId`: UUID
     * `sender`: String (LIKE)
     * `officeId`: UUID
     * `archivadorId`: UUID
     * `periodId`: UUID (a través de `Archivador`)
     * `expedienteId`: UUID
   - `pagination`: `page`, `limit`.
   - `sort`: `field`, `order` (ej. `documentDate`, `desc`).
   
   Lógica de búsqueda:
   - Combinar `WHERE` cláusulas para metadatos.
   - Usar `MATCH AGAINST` para Full-Text Search en `ocrContent` y `annotations` (si `query` no está vacío).
   - Priorizar resultados de Full-Text Search si aplica.
   - Incluir relaciones: `archivador`, `documentType`, `office`, `creator`.
   - Retornar: `{ documents, total, page, totalPages }`.
   
   - `getSearchSuggestions(query)`:
     * Buscar en campos relevantes (`documentNumber`, `sender`, `annotations`, `ocrContent`)
     * Retornar una lista de sugerencias de autocompletado.

3. **Crear controlador de búsqueda (src/controllers/search.controller.ts):**
   
   Implementar:
   
   - `search`: GET /api/search/documents
     * Recibir `query`, `filters`, `pagination`, `sort` como query params.
     * Llamar a `search.service.searchDocuments`.
     * Retornar 200 con resultados.
   
   - `suggestions`: GET /api/search/suggestions
     * Recibir `q` como query param.
     * Llamar a `search.service.getSearchSuggestions`.
     * Retornar 200 con sugerencias.

4. **Crear rutas de búsqueda (src/routes/search.routes.ts):**
   
   ```
   GET /api/search/documents   - Búsqueda avanzada de documentos (autenticado)
   GET /api/search/suggestions - Sugerencias de búsqueda (autenticado)
   ```
   
   Aplicar middleware de autenticación.

5. **Integrar auditoría en `search.service`:**
   
   - Registrar cada búsqueda realizada (usuario, query, filtros).

6. **Integrar rutas en `app.ts`**

**Criterios de Éxito:**
- ✅ La búsqueda por metadatos funciona correctamente con todos los filtros.
- ✅ La Full-Text Search en `ocrContent` y `annotations` retorna resultados relevantes.
- ✅ La paginación y el ordenamiento funcionan.
- ✅ Las sugerencias de búsqueda se generan adecuadamente.
- ✅ La auditoría registra las búsquedas.
- ✅ Las rutas están protegidas por autenticación.

**Testing Manual:**
```bash
# Búsqueda por metadatos
GET http://localhost:5000/api/search/documents?documentTypeId=[uuid]&dateFrom=2025-01-01&dateTo=2025-12-31
Authorization: Bearer [token]

# Búsqueda de texto completo
GET http://localhost:5000/api/search/documents?query=contrato&page=1&limit=10
Authorization: Bearer [token]

# Búsqueda combinada
GET http://localhost:5000/api/search/documents?query=informe&officeId=[uuid]&sortField=documentDate&sortOrder=desc
Authorization: Bearer [token]

# Sugerencias
GET http://localhost:5000/api/search/suggestions?q=contr
Authorization: Bearer [token]
```

**Siguiente Paso:**
PROMPT 019 para crear la interfaz de búsqueda avanzada en el frontend.

---

### PROMPT 019: Interfaz de Búsqueda (Frontend)

**Contexto:**
El motor de búsqueda backend está funcionando. Ahora crearemos la interfaz de usuario para la búsqueda avanzada, incluyendo filtros, autocompletado y visualización de resultados.

**Objetivo:**
Implementar una página de búsqueda avanzada con una barra de búsqueda global, formulario de filtros detallados, tabla de resultados paginada y vista previa rápida de documentos.

**Instrucciones:**

1. **Crear tipos TypeScript (types/search.types.ts):**
   
   ```typescript
   interface SearchResultDocument {
     id: string;
     documentNumber: string;
     documentDate: string;
     sender: string;
     office: { name: string };
     documentType: { name: string };
     archivador: { code: string };
     annotations?: string;
     ocrContent?: string;
     // ... otros metadatos relevantes para mostrar en resultados
   }
   
   interface SearchFilters {
     documentNumber?: string;
     dateFrom?: string;
     dateTo?: string;
     documentTypeId?: string;
     sender?: string;
     officeId?: string;
     archivadorId?: string;
     periodId?: string;
     expedienteId?: string;
   }
   ```

2. **Crear servicio de API (lib/api/search.ts):**
   
   ```typescript
   export const searchApi = {
     searchDocuments: (query: string, filters: SearchFilters, pagination, sort) => {
       return api.get("/search/documents", { params: { query, ...filters, ...pagination, ...sort } });
     },
     getSuggestions: (q: string) => api.get("/search/suggestions", { params: { q } })
   };
   ```

3. **Crear hook personalizado (hooks/useSearch.ts):**
   
   - `fetchSearchResults(query, filters, pagination, sort)`
   - `fetchSuggestions(query)`
   - Manejo de estados de carga, errores y paginación.

4. **Crear componente de barra de búsqueda global (components/shared/GlobalSearchBar.tsx):**
   
   - Input de texto con icono de búsqueda.
   - Autocompletado de sugerencias (usando `searchApi.getSuggestions`).
   - Debounce para las sugerencias.
   - Al presionar Enter o seleccionar sugerencia, redirigir a la página de búsqueda con el query.
   - Visible en el `Navbar.tsx`.

5. **Crear formulario de filtros avanzados (components/search/AdvancedSearchFilters.tsx):**
   
   - Campos de metadatos:
     * Input para `documentNumber`.
     * `DatePicker` para `dateFrom` y `dateTo`.
     * `Select` para `documentTypeId`, `officeId`, `archivadorId`, `periodId`, `expedienteId` (obtener opciones de las APIs de tipologías).
     * Input para `sender`.
   - Botón "Aplicar Filtros".
   - Botón "Limpiar Filtros".
   - Manejo de estado del formulario con `react-hook-form` y `zod`.

6. **Crear tabla de resultados de búsqueda (components/search/SearchResultsTable.tsx):**
   
   Columnas:
   - Número de Documento
   - Fecha
   - Tipo
   - Remitente
   - Oficina
   - Archivador
   - Folios
   - Acciones (Ver, Descargar, Ver Expediente).
   
   Features: Paginación, ordenamiento por columnas, loading skeleton.
   - Resaltar términos de búsqueda en `annotations` y `ocrContent` (si se muestran).

7. **Crear modal de vista previa rápida (components/search/QuickPreviewModal.tsx):**
   
   - Mostrar `PDFViewer` del documento seleccionado.
   - Mostrar metadatos relevantes del documento.
   - Botones para descargar o ir a la vista completa del documento.

8. **Crear página de búsqueda avanzada (app/(dashboard)/consultas/busqueda/page.tsx):**
   
   Integrar:
   - `GlobalSearchBar` (o un input de búsqueda principal).
   - `AdvancedSearchFilters` (colapsable o en un sidebar).
   - `SearchResultsTable`.
   - `QuickPreviewModal`.
   - Mostrar el número total de resultados.
   - Manejar la sincronización de URL query params con los filtros y la paginación.

9. **Actualizar `Sidebar.tsx`:**
   
   Agregar enlace a `/consultas/busqueda` bajo la sección "Consultas".
   - Visible para todos los roles.

**Criterios de Éxito:**
- ✅ La barra de búsqueda global funciona con sugerencias y redirige correctamente.
- ✅ El formulario de filtros avanzados permite combinar múltiples criterios.
- ✅ La tabla de resultados muestra los documentos encontrados con paginación y ordenamiento.
- ✅ La vista previa rápida de documentos funciona.
- ✅ Los términos de búsqueda se resaltan en los resultados.
- ✅ La interfaz es responsive y fácil de usar.

**Testing Manual:**
1. Usar la barra de búsqueda global para buscar un término.
2. Aplicar diferentes filtros en la página de búsqueda avanzada.
3. Verificar que los resultados se actualizan y se resaltan los términos.
4. Abrir la vista previa rápida de un documento.
5. Probar la paginación y el ordenamiento de los resultados.

**Siguiente Paso:**
PROMPT 020 para iniciar la integración con Firma Perú (backend).

---

### PROMPT 019-1: Refactor UX/UI de Búsqueda Avanzada (Frontend)

**Contexto:**
La búsqueda avanzada ya está operativa, pero su interfaz necesita alinearse con el lenguaje visual minimalista de los módulos de archivo digital, garantizando lectura clara sobre fondos blancos y una jerarquía visual consistente con ISO 9241-110 y WCAG 2.1 AA.

**Objetivo:**
Rediseñar la experiencia de búsqueda avanzada con superficies blancas, tipografía legible y componentes ordenados, asegurando una apariencia moderna, accesible y coherente con el resto del frontend.

**Instrucciones:**

1. **Actualizar tokens de diseño globales:**
   - En `frontend/app/globals.css`, define variables CSS dedicadas al módulo (`--search-surface`, `--search-border`, `--search-muted`, `--search-highlight`) y verifica contraste ≥ 4.5:1.
   - Ajusta los estilos base de tablas y tarjetas para que adopten fondos blancos, bordes sutiles (`border-slate-200`) y sombras suaves (`shadow-sm`).

2. **Reestructurar la página principal de búsqueda:**
   - En `frontend/app/dashboard/consultas/busqueda/page.tsx`, encapsula el encabezado y la barra principal dentro de un contenedor `div` con `data-tour="search-header"`.
   - Reemplaza el `Card` actual por una sección con layout `grid` (1 columna móvil, 3 columnas en desktop) donde la barra de búsqueda se destaque dentro de un `Card` elevado (`rounded-xl bg-white p-6 shadow-sm`).
   - Implementa un componente `PageHeader` reutilizable (si ya existe en otros módulos) para mostrar título, subtítulo y botón de ayuda.

3. **Modernizar filtros avanzados:**
   - En `frontend/components/search/AdvancedSearchFilters.tsx`:
     * Cambia los `<select>` nativos por los componentes `Select` de shadcn/ui para uniformar el estilo.
     * Divide las secciones en grupos temáticos con subtítulos (“Identificación”, “Ubicación”, “Fechas”).
     * Envuelve el formulario en `ScrollArea` para evitar largos desplazamientos en pantallas pequeñas y agrega `data-tour="search-filters"` en el contenedor.
     * Asegura que los mensajes de error o ayuda utilicen `text-sm text-slate-500` y mantengan legibilidad.

4. **Perfeccionar la tabla de resultados:**
   - En `frontend/components/search/SearchResultsTable.tsx`:
     * Añade cabecera sticky (`sticky top-0 bg-white/95 backdrop-blur`) y filas con zebra (`odd:bg-slate-50`).
     * Incorpora botones de ordenamiento reutilizando un componente `SortableHeader` (crearlo en `frontend/components/search/SortableHeader.tsx` si aún no existe) para `Número`, `Fecha` y `Remitente`.
     * Añade `data-tour="search-results-table"` y `data-tour="search-result-row"` en filas para usarse en el tour.
     * Mejora el indicador de coincidencias usando badges con `bg-amber-100 text-amber-700` y textos accesibles.

5. **Crear resumen visual de resultados:**
   - Implementa `frontend/components/search/SearchSummary.tsx` para mostrar tarjetas con métricas clave: total de resultados, filtros activos, fecha/hora de la última búsqueda y tiempo de respuesta (puede derivarse del `searchInfo`).
   - Usa este componente debajo del header cuando exista una búsqueda activa y añade `data-tour="search-summary"`.

6. **Unificar modales y botones secundarios:**
   - Ajusta `frontend/components/search/QuickPreviewModal.tsx` para que adopte el nuevo esquema de colores (fondos blancos, secciones delineadas) y utilice botones secundarios con `variant="secondary"` y `variant="outline"`.
   - Propaga las nuevas clases a cualquier `Dialog` relacionado para mantener consistencia.

7. **Accesibilidad y responsividad:**
   - Garantiza que todos los inputs tengan `aria-label` o `aria-describedby` y que el formulario se pueda navegar con teclado.
   - Revisa la experiencia en tamaños `sm`, `md` y `lg`, priorizando un layout de columnas que no requiera zoom ni desplazamiento lateral.

8. **Verificación:**
   - Ejecuta `cd frontend && npm run lint` y `npm run build` para validar que no existan errores.
   - Realiza pruebas manuales en navegadores Chromium y Firefox.

**Criterios de Éxito:**
- ✅ El módulo presenta superficies claras, tipografía legible y jerarquía de títulos coherente con los módulos de archivo digital.
- ✅ Filtros y tabla mantienen consistencia visual con componentes shadcn/ui y ofrecen estados hover/focus accesibles.
- ✅ El resumen de resultados muestra métricas clave sin saturar la interfaz.
- ✅ Las pruebas de lint/build finalizan sin errores.

**Siguiente Paso:**
PROMPT 019-2 para incorporar búsquedas guiadas, filtros guardados y ayudas contextuales.

---

### PROMPT 019-2: Experiencia Asistida, Filtros Guardados y Ayudas Contextuales (Frontend)

**Contexto:**
Tras modernizar la interfaz, se requiere facilitar el uso por parte de usuarios sin experiencia técnica, proporcionando guías, filtros predefinidos, búsquedas guardadas y accesos rápidos.

**Objetivo:**
Agregar funcionalidades de asistencia inteligente que permitan guardar escenarios de búsqueda, reutilizar filtros frecuentes y mostrar recomendaciones paso a paso sin sobrecargar visualmente la pantalla.

**Instrucciones:**

1. **Persistencia de preferencias:**
   - Crea `frontend/store/searchPreferences.store.ts` usando Zustand con `persist` para guardar `savedSearches`, `recentQueries`, `defaultSort` y `lastUsedFilters` en `localStorage` (`key: 'sad-search-preferences'`).
   - Expone acciones `addSavedSearch`, `updateSavedSearch`, `removeSavedSearch`, `applySavedSearch`, `clearRecentQueries`.

2. **Búsquedas guardadas:**
   - Añade un componente `frontend/components/search/SavedSearchBar.tsx` que muestre chips con búsquedas guardadas (máximo 6 visibles) y un botón “Ver todas” que abra un `Dialog` con listado completo.
   - Permite nombrar cada búsqueda; utiliza `Dialog` + `react-hook-form` + `zod` para validar nombres (3-40 caracteres, únicos).
   - Ubica el componente bajo la barra principal (`data-tour="search-saved"`).

3. **Filtros rápidos recomendados:**
   - Define presets en `frontend/lib/search-presets.ts` (ej. “Documentos firmados esta semana”, “Oficios pendientes de OCR”).
   - Renderiza estos presets como botones `ghost` con iconografía contextual; al hacer clic, aplica filtros predefinidos y registra el uso en el store (`trackPresetUsage`).

4. **Asistente contextual:**
   - Inserta un componente `SearchAssistBanner` (puede reutilizar `Alert` de shadcn) que explique en lenguaje simple cómo utilizar la búsqueda; incluye enlaces a filtros guardados y un botón “Ver guía rápida”.
   - Proporciona un atajo de teclado (`?`) para abrir la guía (usa `useHotkeys` del hook propio o implementar con `useEffect`).

5. **Sincronización URL ↔ guardados:**
   - Cuando se aplica una búsqueda guardada, sincroniza parámetros con la URL para mantener deep-linking.
   - Marca visualmente qué filtros provienen de una búsqueda guardada (badge “Guardado”).

6. **Historial y recientes:**
   - Muestra las últimas 5 consultas en un dropdown dentro del input principal, con opción de limpiarlas.
   - Evita duplicados y respeta privacidad (no guardar consultas vacías ni menores a 2 caracteres).

7. **Auditoría ampliada:**
   - En `frontend/hooks/useSearch.ts`, cuando se usa un preset o búsqueda guardada, envía en `searchDocuments` un parámetro `source` (`'manual' | 'saved' | 'preset'`).
   - Ajusta `backend/src/services/search.service.ts` para registrar el `source` en el log de auditoría.

8. **Validación:**
   - Ejecuta `npm run lint` y `npm run build` en frontend.
   - Prueba guardar, renombrar y eliminar búsquedas; confirma persistencia tras recargar.

**Criterios de Éxito:**
- ✅ Los usuarios pueden guardar, aplicar y administrar búsquedas sin abandonar la pantalla.
- ✅ Existen filtros rápidos preconfigurados y el asistente contextual guía los primeros pasos.
- ✅ El historial reciente se gestiona de forma clara y puede limpiarse.
- ✅ Auditoría refleja el origen de cada búsqueda.

**Siguiente Paso:**
PROMPT 019-3 para perfeccionar la vista rápida, coincidencias y detalles enriquecidos.

---

### PROMPT 019-3: Vista Rápida Enriquecida y Detalles Profesionales (Frontend & Backend)

**Contexto:**
El modal de vista rápida funciona, pero debe ofrecer una presentación más profesional, resaltar coincidencias con claridad y mostrar información adicional sin saturar la interfaz.

**Objetivo:**
Refactorizar la vista rápida y la capa de datos de soporte para ofrecer snippets resaltados, documentación contextual, timeline de versiones y acciones claras en un diseño moderno.

**Instrucciones:**

1. **Componente de resaltado reutilizable:**
   - Crea `frontend/components/search/HighlightedText.tsx` para encapsular la lógica de realce, recibiendo `text` y `terms`, utilizando `<mark>` con clases `bg-amber-100 text-amber-900` y garantizando sanitización.
   - Sustituye la lógica inline en `SearchResultsTable` y `QuickPreviewModal` por este componente.

2. **QuickPreview rediseñado:**
   - En `frontend/components/search/QuickPreviewModal.tsx`:
     * Ajusta el layout a `grid` (col-span-2 para preview, col-span-1 para metadata) con `bg-white` y `border-slate-200`.
     * Integra `Skeleton` mientras se descarga el PDF y muestra estados de error con `Alert`.
     * Añade un panel “Coincidencias relevantes” utilizando `HighlightedText` y badges diferenciadas (“OCR”, “Anotaciones”).
     * Incorpora botones alineados a la derecha con `variant="default"` (Ver detalle), `variant="secondary"` (Descargar) y `variant="outline"` (Ver expediente).

3. **Timeline de versiones y actividad:**
   - Implementa `frontend/components/search/DocumentTimeline.tsx` que consuma `GET /documents/:id/history` (si ya existe) o, en su defecto, crea un nuevo endpoint en `backend/src/routes/documents.routes.ts` para devolver versiones y firmas.
   - Muestra en el modal un acordeón con: versiones, firmas registradas y auditoría reciente (limitado a los últimos 5 eventos).

4. **Reutilizar datos enriquecidos:**
   - Amplía `backend/src/services/search.service.ts` para incluir opcionalmente (`?includeTimeline=true`) metadatos básicos de versiones (`versionNumber`, `createdAt`, `createdBy`), sin comprometer el rendimiento.
   - Asegúrate de que la respuesta respete las reglas de seguridad (no exponer rutas internas).

5. **Accesibilidad:**
   - Añade `aria-labelledby`, `aria-describedby` y asegura el foco inicial en el título del modal.
   - Permite cerrar con `Esc` y con el botón superior derecho, manteniendo fondo semitransparente blanco (`bg-white/80 backdrop-blur`).

6. **Testing y QA:**
   - Ejecuta `npm run lint` en frontend y, si se creó endpoint nuevo, `cd backend && npm run build`.
   - Verifica que los snippets resaltados no rompen palabras compuestas y que la descarga sigue funcionando.

**Criterios de Éxito:**
- ✅ El modal presenta un diseño limpio, profesional y alineado con el resto de la aplicación.
- ✅ Los términos coincidentes se resaltan de forma consistente en tabla y vista rápida.
- ✅ Hay acceso a la historia del documento sin abandonar el modal.
- ✅ Los usuarios pueden identificar acciones principales en un vistazo.

**Siguiente Paso:**
PROMPT 019-4 para documentar tours interactivos del módulo y guiar a nuevos usuarios.

---

### PROMPT 019-4: Tours Interactivos del Módulo de Búsqueda (Frontend)

**Contexto:**
El sistema ya emplea tours para otros módulos; se debe ofrecer un recorrido específico que explique la búsqueda avanzada y sus nuevas funcionalidades asistidas.

**Objetivo:**
Agregar un tour completo y moderno para el módulo de búsqueda, cubriendo barra principal, filtros, resumen, tabla, vista rápida y búsquedas guardadas.

**Instrucciones:**

1. **Definir tour en la librería central:**
   - En `frontend/lib/tours.ts`, agrega un nuevo objeto `busqueda-tour` con pasos que apunten a los `data-tour` incorporados en prompts previos (`search-header`, `search-filters`, `search-saved`, `search-summary`, `search-results-table`, `search-result-row`).
   - Incluye mensajes breves, lenguaje llano y orientado a usuarios no técnicos.

2. **Integración con la página:**
   - En `frontend/app/dashboard/consultas/busqueda/page.tsx`, importa el hook o componente utilizado para lanzar tours (p. ej. `useCoachMarks` o `TourLauncher`).
   - Añade un botón “Iniciar tour” en el header (icono `Wand2` o `HelpCircle`) visible solo para usuarios con permiso de búsqueda (`permissions.search.view`).

3. **Puntos de anclaje:**
   - Asegura que cada elemento clave tenga el atributo `data-tour` correspondiente y, en caso de contenido dinámico (tabla vacía), renderiza un placeholder con el mismo atributo.

4. **Accesibilidad y reusabilidad:**
   - Configura el tour para respetar `prefers-reduced-motion`, evita mensajes superiores a 180 caracteres y provee un botón “Saltar”.
   - Registra en el store `searchPreferences` un flag `hasCompletedTour` para no reabrir automáticamente.

5. **Verificación:**
   - Ejecuta el tour en desktop y mobile asegurando que todos los pasos encuentran su target.
   - Actualiza pruebas manuales indicando cómo relanzar el tour desde el botón de ayuda.

**Criterios de Éxito:**
- ✅ Existe un tour dedicado al módulo de búsqueda con pasos claros y concisos.
- ✅ Los pasos resaltan los nuevos componentes (búsquedas guardadas, filtros rápidos, resumen, tabla, vista rápida).
- ✅ El tour respeta accesibilidad y no se dispara automáticamente al completar por primera vez.

**Siguiente Paso:**
PROMPT 019-5 para evolucionar la búsqueda global con una experiencia inteligente y moderna.

---

### PROMPT 019-5: Búsqueda Global Inteligente y Accesos Rápidos (Frontend)

**Contexto:**
La barra de búsqueda global funciona, pero se puede potenciar con un panel de resultados contextual, atajos de teclado y agrupaciones por entidad, similar a un Command Palette moderno.

**Objetivo:**
Reimaginar la búsqueda global como un modal tipo command palette minimalista, con resultados agrupados, acciones inmediatas y accesibilidad total, manteniendo coherencia con el diseño del módulo.

**Instrucciones:**

1. **Command Palette:**
   - Implementa `frontend/components/search/GlobalSearchCommand.tsx` reutilizando los componentes `Command`, `CommandDialog`, `CommandGroup`, `CommandItem` de shadcn/ui.
   - Soporta apertura con `Ctrl/Cmd + K`, `Ctrl/Cmd + F` y un botón en la navbar (`data-tour="global-search"`).

2. **Resultados agrupados:**
   - Agrupa sugerencias en secciones: Documentos, Expedientes, Archivadores, Búsquedas guardadas y Consultas recientes.
   - Para expedientes y archivadores, reutiliza los endpoints existentes (`/expedientes/search`, `/archivadores/search`) o crea, de ser necesario, endpoints ligeros que devuelvan `id`, `code`, `name`.

3. **Acciones rápidas:**
   - Cada item debe ofrecer atajos visibles (ej. `Enter` para abrir, `Shift+Enter` para vista previa, `Alt+D` para descargar documentos).
   - Implementa `onAction` para documentos que reutilice `QuickPreviewModal` en modo compacto (abre modal desde cualquier página).

4. **Integración con preferencias:**
   - Muestra búsquedas guardadas provenientes de `searchPreferences.store.ts`, permitiendo ejecutarlas directamente desde la palette.
   - Marca con badges (`Saved`, `Recent`) según origen.

5. **Feedback instantáneo:**
   - Mientras carga información, muestra `CommandItem` skeletons y un mensaje “Buscando…”.
   - Si no hay resultados, proporciona mensajes amigables con recomendaciones.

6. **Alineación visual:**
   - Utiliza fondos blancos (`bg-white`), sombras suaves y bordes `border-slate-200` para mantener el look & feel.
   - Respeta accesibilidad (foco visible, navegación con flechas, soporte mouse/teclado).

7. **Verificación:**
   - Ejecuta `npm run lint` y `npm run build` en frontend.
   - Prueba atajos en Windows y macOS; verifica que la palette sea responsiva.

**Criterios de Éxito:**
- ✅ La búsqueda global se abre como command palette con atajos y grupos por entidad.
- ✅ Las búsquedas guardadas y recientes están disponibles desde el panel.
- ✅ Las acciones rápidas funcionan y respetan accesibilidad.
- ✅ Las pruebas lint/build pasan sin errores.

**Siguiente Paso:**
Continuar con PROMPT 020 para mantener el roadmap de Firma Perú (backend).

---

## 🎯 FASE 5: MÓDULO DE FIRMA DIGITAL

---

### PROMPT 020: Integración con Firma Perú (Backend) - Parte 1

**Contexto:**
El módulo de búsqueda avanzada está completo. Ahora iniciaremos la integración con la plataforma Firma Perú para la validación y firma de documentos digitales, siguiendo la documentación proporcionada [1].

**Objetivo:**
Configurar la integración inicial con el servicio web de Firma Perú, incluyendo la configuración de credenciales, el cliente SOAP/REST, y las funciones base para interactuar con la API de validación.

**Instrucciones:**

1. **Revisar la documentación de Firma Perú:**
   
   - El documento `validador-servicio-web.md` detalla la especificación del API REST [1].
   - Los endpoints clave son `/validador/api/info`, `/validador/api/validation`, y `/validador/api/clean_temp`.
   - La comunicación es vía POST con `form-data` para `validation`.
   - Se requiere una `credential` y `documentExtension` en el `param` JSON.
   - El servicio de validación debe ser desplegado en la red interna de servidores y no expuesto directamente a internet.

2. **Configurar variables de entorno (`.env.example`):**
   
   ```
   FIRMA_PERU_API_URL=http://[IP_SERVIDOR_VALIDADOR]:8080/validador/api
   FIRMA_PERU_CREDENTIAL=your-secure-credential-here
   ```
   
   - Asegurarse de que `IP_SERVIDOR_VALIDADOR` sea la IP interna donde se desplegará el servicio de Firma Perú.

3. **Crear archivo de configuración para Firma Perú (src/config/firma-peru.ts):**
   
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();
   
   export const FIRMA_PERU_CONFIG = {
     API_URL: process.env.FIRMA_PERU_API_URL || 'http://localhost:8080/validador/api',
     CREDENTIAL: process.env.FIRMA_PERU_CREDENTIAL || 'default-credential',
   };
   ```

4. **Crear servicio de integración con Firma Perú (src/services/firma-peru.service.ts):**
   
   Utilizar `axios` para realizar las peticiones HTTP.
   
   - `getServiceInfo()`:
     * Realizar un GET a `/info`.
     * Retornar la información de configuración del servicio.
   
   - `validateSignature(signedDocumentBuffer: Buffer, originalDocumentBuffer?: Buffer, documentExtension: string)`:
     * Endpoint: `POST /validation`.
     * `Content-Type`: `multipart/form-data`.
     * Parámetros:
       - `param`: JSON string `{"documentExtension": "pdf"}`.
       - `credential`: `FIRMA_PERU_CONFIG.CREDENTIAL`.
       - `signed`: Archivo binario del documento firmado.
       - `original`: Archivo binario del documento original (si `signed` es `.p7s`).
     * Retornar la respuesta JSON del servicio de validación.
     * Manejar errores de conexión y respuestas del servicio.
   
   - `cleanTemp()`:
     * Realizar un POST a `/clean_temp`.
     * `Content-Type`: `application/x-www-form-urlencoded`.
     * Parámetros:
       - `credential`: `FIRMA_PERU_CONFIG.CREDENTIAL`.
     * Retornar la respuesta del servicio.

5. **Crear modelo `Signature` en `prisma/schema.prisma` (si no existe o actualizar):**
   
   Asegurarse de que el modelo `Signature` contenga los campos necesarios para almacenar la información de la firma y el certificado.
   
   ```prisma
   model Signature {
     id                String    @id @default(uuid())
     documentId        String
     document          Document  @relation(fields: [documentId], references: [id])
     documentVersionId String?   // Opcional, si se asocia a una versión específica
     documentVersion   DocumentVersion? @relation(fields: [documentVersionId], references: [id])
     signerId          String
     signer            User      @relation(fields: [signerId], references: [id])
     signatureData     Json      // JSON con los datos de la firma de Firma Perú
     certificateData   Json      // JSON con los datos del certificado
     timestamp         DateTime
     isValid           Boolean   @default(true)
     status            String    // VÁLIDO, NO VÁLIDO, INDETERMINADO
     observations      String[]  // Observaciones de la validación
     createdAt         DateTime  @default(now())
   
     @@map("signatures")
   }
   ```
   
   - Ejecutar `npx prisma migrate dev --name update_signature_model` (si aplica).
   - Ejecutar `npx prisma generate`.

6. **Crear controladores y rutas para pruebas iniciales:**
   
   - `src/controllers/firma.controller.ts`:
     * `getInfo`: GET /api/firma/info
     * `testValidation`: POST /api/firma/test-validation (para probar la validación con un documento de prueba).
   
   - `src/routes/firma.routes.ts`:
     * `GET /api/firma/info` (protegida para admin/operador)
     * `POST /api/firma/test-validation` (protegida para admin/operador, recibe un archivo PDF)

7. **Integrar rutas en `app.ts`**

**Criterios de Éxito:**
- ✅ Las variables de entorno para Firma Perú están configuradas.
- ✅ El servicio `firma-peru.service.ts` puede comunicarse con el endpoint `/info` del validador.
- ✅ El servicio `firma-peru.service.ts` puede enviar un documento a `/validation` y recibir una respuesta.
- ✅ El modelo `Signature` en Prisma está actualizado para almacenar los datos de la respuesta de Firma Perú.
- ✅ Las rutas de prueba iniciales funcionan y retornan la información esperada.

**Testing Manual:**
1. Asegurarse de que el servicio de Firma Perú esté desplegado y accesible en la `FIRMA_PERU_API_URL`.
2. Realizar un GET a `http://localhost:5000/api/firma/info` (con token de admin/operador) y verificar que retorna la información del validador.
3. Realizar un POST a `http://localhost:5000/api/firma/test-validation` (con token de admin/operador) enviando un archivo PDF (firmado o sin firmar) y verificar la respuesta de validación.

**Siguiente Paso:**
PROMPT 021 para implementar la firma individual y múltiple de documentos.

---

### PROMPT 021: Firma Individual y Múltiple de Documentos (Backend)

**Contexto:**
La integración base con Firma Perú está establecida. Ahora implementaremos la lógica backend para permitir a los usuarios firmar documentos individualmente y en lote, utilizando el servicio de Firma Perú.

**Objetivo:**
Desarrollar las funciones de backend para la firma de documentos, incluyendo la preparación del documento, el envío al servicio de Firma Perú, la recepción del documento firmado, la creación de una nueva versión y el registro de la firma.

**Instrucciones:**

1. **Actualizar `documents.service.ts`:**
   
   - `getDocumentFileBuffer(documentId)`: Función para obtener el contenido binario de un documento (PDF) dado su ID.
   
   - `updateDocumentSignedFile(documentId, signedFileBuffer, signatureData, certificateData, signerId, validationStatus, observations)`:
     * Guardar el `signedFileBuffer` como una nueva versión del documento.
     * Actualizar el `filePath` y `fileName` del documento principal.
     * Crear un nuevo registro en el modelo `Signature` con los datos de la firma, certificado, timestamp, estado de validación y observaciones.
     * Actualizar el `currentVersion` del documento.
     * Registrar en auditoría.

2. **Crear servicio de firma (src/services/signature.service.ts):**
   
   - `signDocument(documentId: string, signerId: string, documentExtension: string, certificateFile: Buffer)`:
     * Obtener el documento original usando `documents.service.getDocumentFileBuffer`.
     * Preparar el documento para el envío a Firma Perú (si es necesario alguna transformación).
     * Llamar a `firma-peru.service.validateSignature` (asumiendo que este endpoint también maneja la firma, o que hay un endpoint de firma separado si la API de Firma Perú lo ofrece. Si no, se asume que el proceso de firma se realiza en el cliente y el backend solo valida y almacena).
     * **Nota:** La documentación de `validador-servicio-web.pdf` se enfoca en la *validación*. Si Firma Perú tiene un servicio de *firma*, se debe integrar aquí. Si la firma se realiza en el cliente (ej. con un certificado local), entonces este servicio solo se encargaría de la *validación* post-firma y el almacenamiento.
     * Para este prompt, asumiremos que el servicio `validateSignature` de Firma Perú también retorna el documento firmado o que el documento ya viene firmado del cliente y solo se valida.
     * Si el documento ya viene firmado del cliente, el `signedDocumentBuffer` sería el documento ya firmado y el `originalDocumentBuffer` sería el documento sin firmar (si aplica para `.p7s`).
     * **Aclaración:** Dada la documentación de Firma Perú (`validador-servicio-web.pdf`), parece que el servicio principal es de *validación*. La firma en sí misma (generación del archivo firmado) podría ocurrir en el cliente (ej. con un applet o software local que usa el certificado del usuario). Para el contexto de este sistema, asumiremos que el documento *firmado* es el que se envía al backend para *validación* y almacenamiento. El `certificateFile` se usaría para identificar al firmante y sus datos.
     * **Revisión:** El requerimiento RF-023 dice "Debe solicitar certificado digital del usuario" y "Debe enviar documento a Firma Perú". Esto implica que el backend podría estar orquestando la firma. Si Firma Perú no ofrece un API de firma directa, se necesitaría un componente cliente para la firma. Para simplificar, asumiremos que el backend recibe el documento ya firmado y lo valida con Firma Perú, o que Firma Perú tiene un endpoint de firma no documentado en el PDF de validación.
     * **Alternativa:** Si Firma Perú solo valida, entonces el `signDocument` en el backend sería más bien `processSignedDocument`, donde se recibe el PDF ya firmado desde el frontend (donde el usuario lo firmó con su certificado local), se envía a `firma-peru.service.validateSignature`, y luego se almacena la respuesta de validación y el documento firmado.
     * **Para este prompt, nos centraremos en la validación y almacenamiento post-firma.**
     * Recibir la respuesta de validación de Firma Perú.
     * Extraer `signatureData`, `certificateData`, `timestamp`, `isValid`, `status`, `observations` de la respuesta.
     * Llamar a `documents.service.updateDocumentSignedFile` para guardar la nueva versión y la firma.
     * Retornar el resultado de la firma/validación.
   
   - `signMultipleDocuments(documentIds: string[], signerId: string, documentExtension: string, certificateFile: Buffer)`:
     * Iterar sobre `documentIds`.
     * Llamar a `signDocument` para cada uno.
     * Procesar de forma asíncrona (ej. usando `Promise.all` o una cola de tareas si es muy intensivo).
     * Retornar un resumen de resultados (exitosos/fallidos).

3. **Crear controladores de firma (src/controllers/firma.controller.ts):**
   
   - `signIndividualDocument`: POST /api/firma/sign-document/:documentId
     * Recibir `documentId`, `signerId` (del usuario autenticado), `documentExtension` y el archivo PDF (ya firmado o para firmar).
     * Usar `multer` para el archivo PDF.
     * Llamar a `signature.service.signDocument`.
     * Retornar el resultado.
   
   - `signBatchDocuments`: POST /api/firma/sign-documents-batch
     * Recibir `documentIds` (array), `signerId`, `documentExtension` y los archivos PDF (si se envían).
     * Usar `multer.array` para múltiples archivos.
     * Llamar a `signature.service.signMultipleDocuments`.
     * Retornar el resumen de resultados.

4. **Crear rutas de firma (src/routes/firma.routes.ts):**
   
   ```
   POST /api/firma/sign-document/:documentId      - Firmar documento individual (autenticado, admin, operador)
   POST /api/firma/sign-documents-batch           - Firmar múltiples documentos (autenticado, admin, operador)
   ```
   
   Aplicar middlewares de autenticación y autorización.

5. **Integrar auditoría en `signature.service`:**
   
   - Registrar cada intento de firma (exitoso o fallido).

**Criterios de Éxito:**
- ✅ El backend puede recibir un documento y enviarlo a Firma Perú para validación/firma.
- ✅ Se crea una nueva versión del documento con el archivo firmado.
- ✅ Los datos de la firma y el certificado se almacenan en la base de datos.
- ✅ La firma de múltiples documentos procesa todos los archivos y retorna un resumen.
- ✅ La auditoría registra las acciones de firma.
- ✅ Las rutas están protegidas por autenticación y autorización.

**Siguiente Paso:**
PROMPT 022 para implementar los flujos de firma.

---

### PROMPT 022: Flujos de Firma (Backend)

**Contexto:**
La firma individual y múltiple está implementada. Ahora desarrollaremos la lógica backend para gestionar flujos de firma, permitiendo que varios usuarios firmen un documento en un orden específico.

**Objetivo:**
Crear la API para la gestión de flujos de firma, incluyendo la creación, asignación de firmantes, seguimiento del estado y notificaciones.

**Instrucciones:**

1. **Actualizar `prisma/schema.prisma`:**
   
   Asegurarse de que el modelo `SignatureFlow` contenga los campos necesarios.
   
   ```prisma
   model SignatureFlow {
     id            String     @id @default(uuid())
     name          String
     documentId    String
     document      Document   @relation(fields: [documentId], references: [id])
     signers       Json       // Array de objetos { userId: string, order: number, signedAt: DateTime?, status: String }
     currentStep   Int        @default(0) // Índice del firmante actual en el array 'signers'
     status        String     @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
     createdBy     User       @relation(fields: [createdById], references: [id])
     createdById   String
     createdAt     DateTime   @default(now())
     updatedAt     DateTime   @updatedAt
   
     @@map("signature_flows")
   }
   ```
   
   - Ejecutar `npx prisma migrate dev --name update_signature_flow_model` (si aplica).
   - Ejecutar `npx prisma generate`.

2. **Crear servicio de flujos de firma (src/services/signature-flow.service.ts):**
   
   - `createSignatureFlow(documentId: string, name: string, signers: Array<{ userId: string, order: number }>, createdById: string)`:
     * Validar que el documento exista.
     * Validar que los `userId` de los firmantes existan.
     * Ordenar los firmantes por `order`.
     * Crear el `SignatureFlow` con estado `PENDING`.
     * Enviar notificación al primer firmante.
     * Auditoría.
   
   - `getSignatureFlowById(id)`:
     * Incluir documento y firmantes (con datos de usuario).
   
   - `getAllSignatureFlows(filters, pagination)`:
     * Filtros: `documentId`, `status`, `signerId`.
     * Paginación.
     * Retornar flujos.
   
   - `advanceSignatureFlow(flowId: string, signedDocumentBuffer: Buffer, signerId: string, documentExtension: string)`:
     * Obtener el flujo de firma.
     * Validar que `signerId` sea el firmante actual (`currentStep`).
     * Llamar a `signature.service.signDocument` para validar y guardar la firma del documento.
     * Actualizar el estado del firmante actual en el array `signers` (ej. `signedAt`, `status: 'SIGNED'`).
     * Incrementar `currentStep`.
     * Si `currentStep` > número de firmantes, cambiar estado a `COMPLETED`.
     * Enviar notificación al siguiente firmante o al creador si el flujo ha terminado.
     * Auditoría.
   
   - `cancelSignatureFlow(flowId: string, userId: string)`:
     * Validar permisos (solo creador o admin).
     * Cambiar estado a `CANCELLED`.
     * Notificar a todos los firmantes.
     * Auditoría.
   
   - `getPendingSignatureFlows(userId: string)`:
     * Obtener flujos donde el `userId` es el `currentStep` y el estado es `IN_PROGRESS` o `PENDING`.

3. **Crear controladores de flujos de firma (src/controllers/signature-flow.controller.ts):**
   
   - `create`: POST /api/firma/flows
   - `getById`: GET /api/firma/flows/:id
   - `getAll`: GET /api/firma/flows
   - `advance`: POST /api/firma/flows/:id/advance (recibe el documento firmado y la extensión)
   - `cancel`: POST /api/firma/flows/:id/cancel
   - `getPending`: GET /api/firma/flows/pending

4. **Crear rutas de flujos de firma (src/routes/firma.routes.ts):**
   
   ```
   POST /api/firma/flows                 - Crear flujo de firma (autenticado, admin, operador)
   GET  /api/firma/flows                 - Listar flujos de firma (autenticado)
   GET  /api/firma/flows/pending         - Obtener flujos pendientes del usuario (autenticado)
   GET  /api/firma/flows/:id             - Obtener detalle de flujo (autenticado)
   POST /api/firma/flows/:id/advance     - Avanzar flujo de firma (autenticado, firmante actual)
   POST /api/firma/flows/:id/cancel      - Cancelar flujo de firma (autenticado, creador o admin)
   ```
   
   Aplicar middlewares de autenticación y autorización.

5. **Integrar auditoría en `signature-flow.service`:**
   
   - Registrar creación, avance, cancelación de flujos.

6. **Integrar notificaciones (src/services/notification.service.ts - nuevo o existente):**
   
   - `sendEmail(to, subject, body)`: Función dummy por ahora, se implementará más adelante si es necesario.
   - Usar esta función para notificar a los firmantes.

**Criterios de Éxito:**
- ✅ Se pueden crear flujos de firma con múltiples firmantes y orden.
- ✅ El estado del flujo avanza correctamente cuando un firmante firma.
- ✅ Las notificaciones se envían al firmante correcto en cada paso.
- ✅ Se puede cancelar un flujo de firma con los permisos adecuados.
- ✅ La auditoría registra las acciones sobre los flujos de firma.
- ✅ Las rutas están protegidas por autenticación y autorización.

**Testing Manual:**
1. Crear un documento.
2. Crear un flujo de firma para ese documento con 2-3 firmantes.
3. Iniciar sesión como el primer firmante y avanzar el flujo (simulando la firma).
4. Verificar que el estado del flujo cambia y se notifica al siguiente firmante.
5. Iniciar sesión como el segundo firmante y avanzar el flujo.
6. Verificar que el flujo se completa.
7. Probar cancelar un flujo como creador y como admin.

**Siguiente Paso:**
PROMPT 023 para implementar la verificación de firma digital.

---

### PROMPT 023: Interfaz de Validación Externa de Firma Digital (Frontend)

**Contexto:**
Los flujos de firma están implementados. Ahora crearemos una interfaz profesional para redirigir a los usuarios al validador oficial de Firma Perú, ya que no se dispone de un servicio de validación propio en el backend.

**Objetivo:**
Implementar una página profesional y moderna que permita a los usuarios acceder al validador oficial de Firma Perú para verificar la validez de documentos firmados digitalmente.

**Instrucciones:**

1. **Crear página de validación externa (app/(dashboard)/firma/validar/page.tsx):**
   
   La página debe incluir:
   
   - **Header con título e información:**
     * Título: "Validación de Firma Digital"
     * Subtítulo explicativo sobre el servicio oficial de Firma Perú
     * Icono de escudo o certificado para dar confianza
   
   - **Card informativa con instrucciones:**
     * Texto: "Para realizar la validación de un documento firmado digitalmente, será redirigido al Validador Oficial de Firma Perú."
     * Lista de pasos que seguirá el usuario:
       1. Será redirigido al portal oficial de Firma Perú
       2. Deberá cargar el documento PDF firmado en el validador
       3. El sistema mostrará el estado de la firma digital
       4. Podrá descargar el reporte de validación
   
   - **Información sobre el validador:**
     * Badge o etiqueta: "Servicio Oficial del Estado Peruano"
     * Breve descripción: "El validador de Firma Perú es el servicio oficial del Estado Peruano para verificar la autenticidad de firmas digitales."
     * Lista de qué verifica:
       - Validez del certificado digital
       - Integridad del documento
       - Vigencia de la firma
       - Cadena de confianza
   
   - **Botón principal:**
     * Texto: "Ir al Validador de Firma Perú"
     * Icono: External Link
     * Color: Primario destacado
     * Al hacer clic: Abrir `https://apps.firmaperu.gob.pe/web/validador.xhtml` en nueva pestaña
     * Tooltip: "Se abrirá en una nueva ventana"
   
   - **Card de ayuda adicional:**
     * Título: "¿Necesita ayuda?"
     * Enlaces útiles:
       - Guía de uso del validador (link a documentación si existe)
       - Preguntas frecuentes
       - Soporte técnico

2. **Diseño profesional y moderno:**
   
   - Usar componentes de shadcn/ui (Card, Button, Badge, Alert)
   - Layout centrado con máximo ancho de 800px
   - Espaciado generoso entre elementos
   - Iconos de Lucide React (Shield, CheckCircle, ExternalLink, HelpCircle)
   - Colores institucionales de DISA
   - Animaciones sutiles (hover effects, fade-in)
   - Responsive para móviles y tablets

3. **Agregar funcionalidad de auditoría:**
   
   - Registrar en el hook `useAudit` cada vez que un usuario accede a la página de validación
   - Acción: "EXTERNAL_VALIDATOR_ACCESS"
   - Módulo: "FIRMA_DIGITAL"

4. **Crear componente reutilizable (components/firma/ExternalValidatorCard.tsx):**
   
   Componente que encapsule toda la lógica de presentación:
   
   ```typescript
   interface ExternalValidatorCardProps {
     title: string;
     description: string;
     validatorUrl: string;
     validatorName: string;
   }
   ```
   
   Para futuro uso si se necesitan otros validadores externos.

5. **Actualizar navegación:**
   
   - En `Sidebar.tsx`, agregar enlace "Validar Firma" bajo la sección "Firma Digital"
   - Icono: Shield o CheckCircle
   - Visible para todos los roles autenticados
   - Ordenar menú: Firmar Documento > Flujos de Firma > Validar Firma

6. **Agregar información contextual:**
   
   - Si el usuario llega desde un documento específico (query param `?documentId=xxx`):
     * Mostrar información del documento en la parte superior
     * Botón secundario: "Descargar documento para validar"
     * Texto: "Descargue el documento y luego valídelo en el portal oficial"

**Criterios de Éxito:**
- ✅ La página se muestra profesional y moderna
- ✅ Las instrucciones son claras y fáciles de seguir
- ✅ El botón redirige correctamente al validador oficial
- ✅ El diseño es responsive en todos los dispositivos
- ✅ La navegación está correctamente integrada en el sidebar
- ✅ Se registra el acceso en auditoría
- ✅ La experiencia de usuario es fluida y confiable

**Testing Manual:**
1. Navegar a /firma/validar
2. Verificar que la página carga correctamente
3. Leer las instrucciones y verificar claridad
4. Hacer clic en "Ir al Validador de Firma Perú"
5. Verificar que se abre en nueva pestaña
6. Probar con query param ?documentId=xxx
7. Verificar diseño responsive en móvil
8. Verificar registro en auditoría

**Siguiente Paso:**
PROMPT 024 para implementar el control de versiones y reversión de firmas.

---

### PROMPT 024: Control de Versiones y Reversión de Firmas (Backend + Frontend)

**Contexto:**
La interfaz de validación externa está implementada. Ahora desarrollaremos un sistema profesional y robusto de control de versiones de documentos con firmas, permitiendo a los administradores gestionar el historial completo, revertir a versiones específicas, y mantener un registro detallado de todas las operaciones.

**Objetivo:**
Crear un sistema completo de gestión de versiones de documentos firmados que permita visualizar el historial, comparar versiones, revertir a estados anteriores, y mantener la trazabilidad completa de todas las firmas aplicadas y revertidas.

**Instrucciones:**

**BACKEND:**

1. **Actualizar modelo de base de datos en `prisma/schema.prisma`:**
   
   Agregar campo `isReverted` y `revertedAt` al modelo `Signature`:
   
   ```prisma
   model Signature {
     // ... campos existentes ...
     isReverted        Boolean   @default(false)
     revertedAt        DateTime?
     revertedBy        String?
     revertedByUser    User?     @relation("RevertedSignatures", fields: [revertedBy], references: [id])
     revertReason      String?   @db.Text
   }
   ```
   
   Agregar campo `signatureStatus` al modelo `Document`:
   
   ```prisma
   model Document {
     // ... campos existentes ...
     signatureStatus   String    @default("UNSIGNED") // UNSIGNED, SIGNED, PARTIALLY_SIGNED, REVERTED
     lastSignedAt      DateTime?
     signedBy          String?   // ID del último firmante
   }
   ```
   
   Ejecutar migración: `npx prisma migrate dev --name add_signature_control`

2. **Crear servicio completo de versiones (src/services/versions.service.ts):**
   
   - `getAllVersions(documentId: string)`:
     * Obtener todas las versiones del documento
     * Incluir información de firmas asociadas a cada versión
     * Incluir información del creador
     * Ordenar por versionNumber DESC
     * Retornar con metadata (tamaño, fecha, cambios)
   
   - `getVersionById(versionId: string)`:
     * Obtener versión específica con todos sus detalles
     * Incluir firmas asociadas
     * Incluir documento padre
   
   - `compareVersions(versionId1: string, versionId2: string)`:
     * Comparar metadatos de dos versiones
     * Comparar firmas de cada versión
     * Retornar diferencias en estructura JSON
   
   - `getLatestUnsignedVersion(documentId: string)`:
     * Buscar última versión sin firmas activas
     * Validar que exista
     * Retornar versión o null
   
   - `restoreVersion(documentId: string, versionId: string, userId: string, reason: string)`:
     * Validar permisos
     * Obtener versión a restaurar
     * Crear nueva versión con contenido de la versión antigua
     * Actualizar documento principal
     * Marcar firmas actuales como revertidas
     * Registrar auditoría detallada
     * Retornar nueva versión

3. **Crear servicio de reversión profesional (src/services/signature-reversion.service.ts):**
   
   - `revertDocumentSignatures(documentId: string, userId: string, reason: string, options: RevertOptions)`:
     * Validar permisos (solo Administrador)
     * Validar que el documento tenga firmas activas
     * Obtener todas las firmas activas del documento
     * Marcar todas las firmas como `isReverted = true`
     * Registrar `revertedAt`, `revertedBy`, `revertReason`
     * Actualizar `signatureStatus` del documento a "REVERTED"
     * Crear notificaciones para todos los firmantes afectados
     * Registrar en auditoría con detalles completos
     * Retornar resumen de la operación
   
   - `revertToVersion(documentId: string, versionId: string, userId: string, reason: string)`:
     * Similar a revertDocumentSignatures pero restaura una versión específica
     * Llamar a `versions.service.restoreVersion`
     * Gestionar firmas intermedias
     * Mantener historial completo
   
   - `getReversionHistory(documentId: string)`:
     * Obtener historial completo de reversiones
     * Incluir quién revirtió, cuándo, y por qué
     * Incluir firmas que fueron revertidas
     * Ordenar cronológicamente
   
   - `canRevert(documentId: string, userId: string)`:
     * Validar si el documento puede revertirse
     * Verificar permisos del usuario
     * Verificar estado actual del documento
     * Retornar boolean con razones

4. **Crear controladores (src/controllers/versions.controller.ts y firma.controller.ts):**
   
   En `versions.controller.ts`:
   - `getAllVersions`: GET /api/documents/:documentId/versions
   - `getVersionById`: GET /api/versions/:versionId
   - `compareVersions`: GET /api/versions/compare?v1=xxx&v2=yyy
   - `downloadVersion`: GET /api/versions/:versionId/download
   
   En `firma.controller.ts`:
   - `revertSignatures`: POST /api/firma/revert/:documentId
   - `revertToVersion`: POST /api/firma/revert/:documentId/version/:versionId
   - `getReversionHistory`: GET /api/firma/revert/:documentId/history
   - `canRevert`: GET /api/firma/revert/:documentId/can-revert

5. **Crear rutas protegidas:**
   
   ```
   GET    /api/documents/:documentId/versions        - Listar versiones (autenticado)
   GET    /api/versions/:versionId                   - Obtener versión (autenticado)
   GET    /api/versions/compare                      - Comparar versiones (autenticado)
   GET    /api/versions/:versionId/download          - Descargar versión (autenticado)
   
   POST   /api/firma/revert/:documentId              - Revertir firmas (admin)
   POST   /api/firma/revert/:documentId/version/:versionId - Revertir a versión (admin)
   GET    /api/firma/revert/:documentId/history      - Historial reversiones (admin)
   GET    /api/firma/revert/:documentId/can-revert   - Verificar si puede revertir (admin)
   ```

**FRONTEND:**

6. **Crear componente de historial de versiones (components/documents/VersionHistory.tsx):**
   
   - Timeline visual de todas las versiones
   - Cada versión muestra:
     * Número de versión
     * Fecha de creación
     * Usuario que la creó
     * Cambios realizados
     * Firmas asociadas (si las tiene)
     * Estado (actual, firmada, revertida)
     * Tamaño del archivo
   - Acciones por versión:
     * Ver detalles
     * Descargar
     * Comparar con otra versión
     * Restaurar (solo admin y solo para versiones sin firma)
   - Filtros: mostrar solo firmadas, sin firma, revertidas
   - Diseño: usar componentes shadcn/ui (Timeline, Card, Badge)

7. **Crear modal de reversión de firma (components/firma/RevertSignatureModal.tsx):**
   
   - Título: "Revertir Firmas del Documento"
   - Información del documento actual
   - Lista de firmas que serán revertidas:
     * Nombre del firmante
     * Fecha de firma
     * Estado actual
   - Campo obligatorio: Razón de la reversión (textarea)
   - Opciones:
     * Revertir solo las firmas (mantener última versión del contenido)
     * Revertir a versión específica sin firma (select de versiones)
   - Advertencia destacada: "Esta acción no se puede deshacer automáticamente"
   - Checkbox de confirmación: "Entiendo las implicaciones de revertir las firmas"
   - Botones: Confirmar Reversión (destructive) / Cancelar

8. **Crear modal de comparación de versiones (components/documents/CompareVersionsModal.tsx):**
   
   - Selectores para elegir dos versiones
   - Vista comparativa lado a lado:
     * Metadatos (tamaño, fecha, usuario)
     * Firmas de cada versión
     * Diferencias resaltadas
   - Botón para descargar ambas versiones
   - Opción para restaurar una de las versiones (solo admin)

9. **Crear panel de control de versiones en detalle de documento:**
   
   En `app/(dashboard)/archivo/documentos/[id]/page.tsx`, agregar:
   
   - Tab "Historial de Versiones"
   - Tab "Firmas" (si el documento tiene firmas)
   - En el tab de Firmas:
     * Lista de todas las firmas (activas y revertidas)
     * Indicador visual de estado
     * Historial de reversiones si las hay
     * Botón "Revertir Firmas" (solo admin)
   - En el tab de Historial:
     * Componente VersionHistory
     * Botones de comparación
     * Estadísticas: total de versiones, versiones firmadas, reversiones

10. **Actualizar indicadores visuales:**
    
    - En la tabla de documentos, agregar columna "Estado de Firma":
      * Badge "Firmado" (verde) si tiene firmas activas
      * Badge "Sin Firmar" (gris) si no tiene firmas
      * Badge "Parcialmente Firmado" (amarillo) si está en flujo de firma
      * Badge "Revertido" (rojo) si las firmas fueron revertidas
    
    - En el detalle del documento, mostrar:
      * Icono de firma en el header si está firmado
      * Tooltip con información rápida de las firmas
      * Timeline de eventos de firma/reversión

**Criterios de Éxito:**
- ✅ El historial completo de versiones es visible y navegable
- ✅ Se pueden comparar versiones del documento
- ✅ Los administradores pueden revertir firmas con razón obligatoria
- ✅ Se pueden restaurar versiones anteriores sin firma
- ✅ El estado de firma se muestra claramente en toda la interfaz
- ✅ Todas las operaciones quedan registradas en auditoría
- ✅ Las notificaciones se envían a usuarios afectados
- ✅ Los badges de estado son claros y consistentes
- ✅ La experiencia es intuitiva y profesional

**Testing Manual:**
1. Crear un documento nuevo (versión 1)
2. Firmarlo (versión 2 con firma)
3. Modificar metadatos (versión 3 con firma)
4. Ver historial de versiones → verificar 3 versiones
5. Como admin, revertir las firmas con razón
6. Verificar que estado cambió a "Revertido"
7. Verificar historial de reversiones
8. Comparar versión 1 con versión 3
9. Restaurar a versión 1
10. Verificar auditoría completa

**Siguiente Paso:**
PROMPT 025 ya está implementado (Interfaz de Firma Digital). Continuar con PROMPT 026 para agregar estado de firma en documentos.

---

### PROMPT 026: Estado de Firma y Metadatos Visuales en Documentos (Backend + Frontend)

**Contexto:**
El control de versiones y reversión de firmas está implementado. Ahora agregaremos un sistema profesional de visualización de estado de firma en todos los documentos del sistema, con indicadores visuales claros, metadatos detallados, y actualización en tiempo real del estado.

**Objetivo:**
Implementar un sistema completo de seguimiento y visualización del estado de firma de documentos, con badges profesionales, tooltips informativos, y un panel de control que permita ver de un vistazo el estado de firma de toda la documentación.

**Instrucciones:**

**BACKEND:**

1. **Crear servicio de estado de firma (src/services/signature-status.service.ts):**
   
   - `getDocumentSignatureStatus(documentId: string)`:
     * Retornar estado completo de firma del documento:
       - `status`: UNSIGNED, SIGNED, PARTIALLY_SIGNED, REVERTED, IN_FLOW
       - `totalSignatures`: número total de firmas activas
       - `revertedSignatures`: número de firmas revertidas
       - `activeFlows`: flujos de firma activos para el documento
       - `lastSignedAt`: fecha de última firma
       - `lastSignedBy`: usuario que firmó por última vez
       - `signersInfo`: array con info de todos los firmantes
     * Incluir metadatos de confiabilidad de las firmas
   
   - `updateDocumentSignatureStatus(documentId: string)`:
     * Función que recalcula el estado basándose en:
       - Firmas activas vs revertidas
       - Flujos de firma pendientes/activos
       - Versiones del documento
     * Actualizar campo `signatureStatus` en el documento
     * Actualizar `lastSignedAt` y `signedBy`
     * Retornar nuevo estado
   
   - `getSignatureMetadata(signatureId: string)`:
     * Obtener metadatos completos de una firma específica:
       - Información del certificado
       - Cadena de confianza
       - Timestamp de la firma
       - Hash del documento al momento de firmar
       - Estado de validez
     * Formato JSON estructurado
   
   - `getBatchSignatureStatus(documentIds: string[])`:
     * Obtener estado de firma de múltiples documentos a la vez
     * Optimizado para consultas masivas
     * Retornar array de estados
   
   - `getSignatureStatistics()`:
     * Estadísticas generales del sistema:
       - Total documentos firmados
       - Total firmas realizadas
       - Firmas por usuario
       - Documentos revertidos
       - Flujos activos
       - Tendencia de firmas (últimos 30 días)

2. **Crear middleware de actualización automática de estado:**
   
   En `src/middlewares/signature-status-updater.middleware.ts`:
   
   - Hook que se ejecuta después de operaciones de firma:
     * Después de firma individual → actualizar estado
     * Después de avance de flujo → actualizar estado
     * Después de reversión → actualizar estado
   - Usar eventos o callbacks para mantener consistencia
   - Asegurar que el estado siempre esté sincronizado

3. **Actualizar endpoints existentes:**
   
   Agregar campo `signatureStatus` a las respuestas de:
   - GET /api/documents (lista de documentos)
   - GET /api/documents/:id (detalle de documento)
   - GET /api/documents/search (búsqueda)
   
   Agregar endpoint nuevo:
   - GET /api/documents/signature-status/batch (consulta masiva de estados)
   - GET /api/documents/signature-status/statistics (estadísticas)

**FRONTEND:**

4. **Crear componente de badge de estado (components/documents/SignatureStatusBadge.tsx):**
   
   Componente reutilizable que muestra el estado visual:
   
   ```typescript
   interface SignatureStatusBadgeProps {
     status: 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';
     size?: 'sm' | 'md' | 'lg';
     showIcon?: boolean;
     showTooltip?: boolean;
   }
   ```
   
   - Diseño:
     * `UNSIGNED`: Badge gris con icono FileX
     * `SIGNED`: Badge verde con icono CheckCircle
     * `PARTIALLY_SIGNED`: Badge amarillo con icono Clock
     * `REVERTED`: Badge rojo con icono XCircle
     * `IN_FLOW`: Badge azul con icono ArrowRightCircle
   
   - Tooltip con información detallada:
     * Número de firmas
     * Último firmante
     * Fecha de última firma
     * Estado de flujo si aplica
   
   - Animación sutil de cambio de estado
   - Responsive y accesible

5. **Crear componente de panel de firmas (components/documents/SignaturePanel.tsx):**
   
   Panel expandible en el detalle del documento:
   
   - Header con resumen:
     * Badge de estado principal
     * Número total de firmas
     * Botón "Ver todas las firmas"
   
   - Lista de firmas (expandida):
     * Avatar y nombre del firmante
     * Fecha y hora de firma
     * Tipo de certificado usado
     * Estado de la firma (válida, revertida)
     * Botón "Ver detalles del certificado"
   
   - Información de flujos activos:
     * Nombre del flujo
     * Progreso visual (barra o stepper)
     * Siguiente firmante
     * Tiempo estimado
   
   - Acciones rápidas:
     * Descargar documento firmado
     * Validar firma externamente
     * Revertir firmas (solo admin)
     * Ver historial completo

6. **Actualizar tabla de documentos (components/documents/DocumentsTable.tsx):**
   
   Agregar columna "Estado de Firma":
   - Mostrar SignatureStatusBadge
   - Ordenable por estado
   - Filtrable por estado
   - Click para ver quick preview de firmas

7. **Crear componente de filtro por estado de firma:**
   
   En `components/documents/DocumentsFilters.tsx`, agregar:
   - Select de estado de firma
   - Opciones: Todos, Firmados, Sin Firmar, En Proceso, Revertidos
   - Badge con contador de documentos por estado
   - Aplicar filtro en búsqueda y listados

8. **Crear dashboard de firmas (components/firma/SignatureDashboard.tsx):**
   
   Panel de control con métricas visuales:
   
   - Cards con estadísticas principales:
     * Total documentos firmados (con trend)
     * Firmas pendientes (flujos activos)
     * Firmas realizadas este mes
     * Documentos revertidos
   
   - Gráficos:
     * Línea de tiempo: Firmas por día/semana/mes
     * Donut: Distribución de estados
     * Barras: Firmas por usuario
   
   - Lista de acciones recientes:
     * Últimas firmas realizadas
     * Reversiones recientes
     * Flujos iniciados
   
   - Accesos rápidos:
     * Firmar documento
     * Ver flujos pendientes
     * Validar firma

9. **Crear página de dashboard (app/(dashboard)/firma/dashboard/page.tsx):**
   
   - Integrar SignatureDashboard
   - Filtros de fecha
   - Exportar estadísticas
   - Agregar al sidebar como "Dashboard de Firmas"

10. **Implementar actualización en tiempo real:**
    
    - Usar polling o WebSockets (simple con polling cada 30s)
    - Actualizar badges automáticamente cuando hay cambios
    - Notificación visual cuando un documento cambia de estado
    - Hook `useSignatureStatus(documentId)` que se actualiza automáticamente

**Criterios de Éxito:**
- ✅ Todos los documentos muestran su estado de firma claramente
- ✅ Los badges son consistentes en toda la aplicación
- ✅ Los tooltips proporcionan información útil
- ✅ El panel de firmas muestra detalles completos
- ✅ Los filtros por estado funcionan correctamente
- ✅ El dashboard muestra métricas actualizadas
- ✅ Los gráficos se renderizan correctamente
- ✅ La actualización de estado es automática y rápida
- ✅ La interfaz es profesional y moderna
- ✅ La experiencia de usuario es fluida

**Testing Manual:**
1. Listar documentos → verificar badges de estado
2. Firmar un documento → verificar cambio de estado inmediato
3. Ver detalle de documento firmado → panel de firmas completo
4. Filtrar por estado "Firmados" → ver solo firmados
5. Acceder a dashboard → verificar métricas
6. Crear flujo de firma → ver estado "En Proceso"
7. Revertir firma → ver estado "Revertido"
8. Hover sobre badge → ver tooltip informativo
9. Verificar actualización automática después de 30s
10. Probar responsive en móvil

**Siguiente Paso:**
PROMPT 027 para implementar notificaciones y alertas del sistema de firma.

---

### PROMPT 027: Notificaciones y Alertas del Sistema de Firma Digital (Backend + Frontend)

**Contexto:**
El estado de firma se visualiza claramente. Ahora implementaremos un sistema completo de notificaciones y alertas para mantener a los usuarios informados sobre todas las acciones relacionadas con firmas digitales en tiempo real.

**Objetivo:**
Crear un sistema profesional de notificaciones que alerte a los usuarios sobre eventos importantes de firma: documentos pendientes de firma, flujos que requieren acción, firmas completadas, reversiones, y vencimientos de certificados.

**Instrucciones:**

**BACKEND:**

1. **Crear modelo de notificaciones en `prisma/schema.prisma`:**
   
   ```prisma
   model Notification {
     id              String    @id @default(uuid())
     userId          String
     user            User      @relation(fields: [userId], references: [id])
     type            String    // SIGNATURE_PENDING, SIGNATURE_COMPLETED, FLOW_STARTED, FLOW_COMPLETED, SIGNATURE_REVERTED, CERTIFICATE_EXPIRING
     title           String
     message         String    @db.Text
     data            Json?     // Datos adicionales (documentId, flowId, etc.)
     isRead          Boolean   @default(false)
     readAt          DateTime?
     priority        String    @default("NORMAL") // LOW, NORMAL, HIGH, URGENT
     actionUrl       String?   // URL para acción rápida
     actionLabel     String?   // Texto del botón de acción
     createdAt       DateTime  @default(now())
     expiresAt       DateTime? // Las notificaciones pueden expirar
     
     @@index([userId, isRead])
     @@index([createdAt])
     @@map("notifications")
   }
   ```
   
   Ejecutar migración: `npx prisma migrate dev --name add_notifications`

2. **Crear servicio de notificaciones (src/services/notifications.service.ts):**
   
   - `createNotification(userId, type, title, message, data, priority, actionUrl, actionLabel)`:
     * Crear notificación en base de datos
     * Si priority es URGENT, enviar también por email (si está configurado)
     * Retornar notificación creada
   
   - `createSignaturePendingNotification(userId, documentId, documentName)`:
     * Notificación específica para firma pendiente
     * Acción: "Firmar Ahora" → /firma/firmar?documentId=xxx
   
   - `createFlowAdvanceNotification(userId, flowId, flowName, documentName)`:
     * Notificación cuando es turno del usuario en un flujo
     * Acción: "Continuar Flujo" → /firma/flujos/[flowId]
   
   - `createSignatureCompletedNotification(userIds, documentId, documentName, signerName)`:
     * Notificar a usuarios interesados cuando se completa una firma
     * Para creador del documento, otros firmantes, etc.
   
   - `createSignatureRevertedNotification(userIds, documentId, documentName, reason)`:
     * Notificar a firmantes cuando sus firmas son revertidas
     * Incluir razón de la reversión
   
   - `createFlowCompletedNotification(userIds, flowId, flowName, documentName)`:
     * Notificar cuando un flujo de firma se completa totalmente
   
   - `getUserNotifications(userId, filters)`:
     * Obtener notificaciones del usuario
     * Filtros: isRead, type, priority, dateFrom
     * Paginación
     * Ordenar por priority DESC, createdAt DESC
   
   - `markAsRead(notificationId, userId)`:
     * Marcar notificación como leída
     * Validar que pertenece al usuario
   
   - `markAllAsRead(userId)`:
     * Marcar todas las notificaciones del usuario como leídas
   
   - `deleteNotification(notificationId, userId)`:
     * Eliminar notificación
     * Validar permisos
   
   - `getUnreadCount(userId)`:
     * Contar notificaciones no leídas del usuario
     * Para badge en navbar
   
   - `cleanExpiredNotifications()`:
     * Job que elimina notificaciones expiradas
     * Ejecutar diariamente (cron job)

3. **Integrar notificaciones en servicios de firma:**
   
   En `signature.service.ts`:
   - Después de firma exitosa → `createSignatureCompletedNotification`
   
   En `signature-flow.service.ts`:
   - Al crear flujo → notificar al primer firmante
   - Al avanzar flujo → notificar al siguiente firmante
   - Al completar flujo → notificar a todos los involucrados
   
   En `signature-reversion.service.ts`:
   - Al revertir firma → notificar a todos los firmantes afectados

4. **Crear controladores de notificaciones (src/controllers/notifications.controller.ts):**
   
   - `getUserNotifications`: GET /api/notifications
   - `getUnreadCount`: GET /api/notifications/unread-count
   - `markAsRead`: PUT /api/notifications/:id/read
   - `markAllAsRead`: PUT /api/notifications/read-all
   - `deleteNotification`: DELETE /api/notifications/:id

5. **Crear rutas de notificaciones:**
   
   ```
   GET    /api/notifications                  - Listar notificaciones del usuario (autenticado)
   GET    /api/notifications/unread-count     - Contar no leídas (autenticado)
   PUT    /api/notifications/:id/read         - Marcar como leída (autenticado)
   PUT    /api/notifications/read-all         - Marcar todas como leídas (autenticado)
   DELETE /api/notifications/:id              - Eliminar notificación (autenticado)
   ```

**FRONTEND:**

6. **Crear componente de campana de notificaciones (components/layout/NotificationBell.tsx):**
   
   En la navbar:
   
   - Icono de campana (Bell de Lucide)
   - Badge con número de no leídas (si > 0)
   - Click para abrir dropdown
   - Animación de "shake" cuando llega nueva notificación
   
   Dropdown:
   - Header: "Notificaciones" con botón "Marcar todas como leídas"
   - Lista de notificaciones recientes (últimas 10)
   - Cada notificación:
     * Icono según tipo
     * Título en negrita
     * Mensaje (truncado)
     * Tiempo relativo ("hace 5 minutos")
     * Punto azul si no leída
     * Botón de acción si tiene
     * Click para marcar como leída y ver más
   - Footer: "Ver todas" → /notificaciones
   - Scroll si hay muchas
   - Empty state si no hay notificaciones

7. **Crear página completa de notificaciones (app/(dashboard)/notificaciones/page.tsx):**
   
   - Header con título y stats:
     * Total notificaciones
     * No leídas
   
   - Filtros:
     * Por tipo (select múltiple)
     * Por prioridad
     * Por fecha
     * Solo no leídas (toggle)
   
   - Lista completa de notificaciones:
     * Agrupadas por fecha (Hoy, Ayer, Esta semana, etc.)
     * Cada notificación expandible
     * Mensaje completo
     * Botones de acción
     * Botón "Eliminar"
     * Click para marcar como leída
   
   - Acciones masivas:
     * Marcar seleccionadas como leídas
     * Eliminar seleccionadas
   
   - Paginación

8. **Crear hook de notificaciones (hooks/useNotifications.ts):**
   
   ```typescript
   export function useNotifications() {
     const [notifications, setNotifications] = useState([]);
     const [unreadCount, setUnreadCount] = useState(0);
     const [loading, setLoading] = useState(false);
     
     const fetchNotifications = async (filters) => {
       // Implementar
     };
     
     const fetchUnreadCount = async () => {
       // Implementar
     };
     
     const markAsRead = async (id) => {
       // Implementar y actualizar estado local
     };
     
     const markAllAsRead = async () => {
       // Implementar
     };
     
     const deleteNotification = async (id) => {
       // Implementar
     };
     
     // Polling cada 30 segundos para nuevas notificaciones
     useEffect(() => {
       const interval = setInterval(() => {
         fetchUnreadCount();
       }, 30000);
       return () => clearInterval(interval);
     }, []);
     
     return {
       notifications,
       unreadCount,
       loading,
       fetchNotifications,
       markAsRead,
       markAllAsRead,
       deleteNotification
     };
   }
   ```

9. **Crear componente de alerta urgente (components/notifications/UrgentAlert.tsx):**
   
   - Toast especial para notificaciones urgentes
   - Aparece automáticamente cuando llega notificación URGENT
   - Diseño destacado (rojo o amarillo)
   - Sonido opcional (si el usuario lo permite)
   - Botón de acción directa
   - Auto-cierre después de 10 segundos (o hasta que usuario actúe)

10. **Integrar notificaciones en toda la aplicación:**
    
    - En Navbar: NotificationBell
    - En Dashboard: Widget de "Mis Notificaciones Pendientes"
    - En Detalle de Documento: Mostrar notificaciones relacionadas
    - En Flujos de Firma: Resaltar flujos que tienen notificaciones
    - Toast global para nuevas notificaciones (usando react-hot-toast)

**Criterios de Éxito:**
- ✅ Las notificaciones se crean correctamente en eventos de firma
- ✅ El badge de la campana muestra el número correcto de no leídas
- ✅ El dropdown de notificaciones es funcional e intuitivo
- ✅ La página de notificaciones lista todas correctamente
- ✅ Marcar como leída actualiza el estado inmediatamente
- ✅ Los filtros funcionan correctamente
- ✅ Las acciones rápidas redirigen correctamente
- ✅ Las notificaciones urgentes se destacan visualmente
- ✅ El polling actualiza el contador automáticamente
- ✅ El diseño es profesional y consistente

**Testing Manual:**
1. Firmar un documento → verificar notificación al creador
2. Crear flujo de firma → verificar notificación al primer firmante
3. Avanzar flujo → verificar notificación al siguiente
4. Revertir firma → verificar notificaciones a firmantes
5. Ver campana de notificaciones → badge correcto
6. Abrir dropdown → ver últimas notificaciones
7. Click en notificación → marcar como leída
8. Ir a página completa → ver todas las notificaciones
9. Filtrar por tipo → ver solo ese tipo
10. Marcar todas como leídas → badge desaparece

**Siguiente Paso:**
PROMPT 028 para implementar dashboard analítico de firma digital.

---

### PROMPT 028: Dashboard Analítico y Reportes de Firma Digital (Frontend)

**Contexto:**
El sistema de notificaciones está completo. Ahora crearemos un dashboard analítico profesional que proporcione insights valiosos sobre el uso del sistema de firma digital, patrones de firma, y métricas de rendimiento.

**Objetivo:**
Implementar un dashboard completo con visualizaciones interactivas, métricas clave, reportes exportables, y análisis de tendencias para el módulo de firma digital.

**Instrucciones:**

1. **Crear servicio de analíticas en backend (src/services/signature-analytics.service.ts):**
   
   - `getSignatureMetrics(dateFrom, dateTo)`:
     * Total firmas realizadas en el período
     * Promedio de firmas por día
     * Total documentos firmados vs sin firmar
     * Tasa de adopción de firma digital
     * Tiempo promedio para completar flujos
   
   - `getSignaturesByPeriod(period: 'day' | 'week' | 'month', dateFrom, dateTo)`:
     * Firmas agrupadas por período
     * Para gráfico de líneas o barras
   
   - `getSignaturesByUser(limit, dateFrom, dateTo)`:
     * Top usuarios que más firman
     * Para ranking
   
   - `getFlowStatistics(dateFrom, dateTo)`:
     * Flujos creados, completados, cancelados
     * Tiempo promedio de finalización
     * Tasa de éxito
   
   - `getDocumentTypeDistribution(dateFrom, dateTo)`:
     * Distribución de firmas por tipo de documento
     * Para gráfico circular
   
   - `getReversionAnalytics(dateFrom, dateTo)`:
     * Total reversiones
     * Razones más comunes
     * Usuarios que más revierten
   
   - `exportAnalyticsReport(type: 'pdf' | 'xlsx' | 'csv', filters)`:
     * Generar reporte descargable
     * Incluir todas las métricas y gráficos

2. **Crear endpoints en backend:**
   
   ```
   GET /api/firma/analytics/metrics          - Métricas generales
   GET /api/firma/analytics/by-period        - Firmas por período
   GET /api/firma/analytics/by-user          - Ranking de usuarios
   GET /api/firma/analytics/flows            - Estadísticas de flujos
   GET /api/firma/analytics/document-types   - Distribución por tipo
   GET /api/firma/analytics/reversions       - Analítica de reversiones
   GET /api/firma/analytics/export           - Exportar reporte
   ```

3. **Crear componente de métricas principales (components/firma/analytics/MetricsCards.tsx):**
   
   - Grid de 4-6 cards con métricas:
     * Total Firmas Realizadas (con trend ↑↓)
     * Documentos Firmados Este Mes
     * Flujos Activos
     * Tiempo Promedio de Flujo
     * Tasa de Adopción (%)
     * Reversiones del Mes
   
   - Cada card:
     * Número grande y destacado
     * Icono representativo
     * Indicador de tendencia (comparado con período anterior)
     * Mini gráfico de sparkline
     * Color según métrica (verde para positivas, rojo para alertas)

4. **Crear gráfico de tendencia de firmas (components/firma/analytics/SignatureTrendChart.tsx):**
   
   - Gráfico de líneas o área
   - Eje X: tiempo (días, semanas, meses)
   - Eje Y: número de firmas
   - Tooltip interactivo
   - Leyenda
   - Exportable como imagen
   - Usar recharts

5. **Crear gráfico de distribución (components/firma/analytics/DistributionChart.tsx):**
   
   - Gráfico circular (donut chart)
   - Mostrar distribución por:
     * Tipo de documento
     * Estado de documentos
     * Tipo de flujo
   - Leyenda interactiva
   - Click en segmento para ver detalles

6. **Crear tabla de ranking (components/firma/analytics/TopSignersTable.tsx):**
   
   - Tabla con top 10 firmantes
   - Columnas:
     * Posición (#)
     * Usuario (con avatar)
     * Total de Firmas
     * Documentos Firmados
     * Última Firma
     * Badge de "Top Contributor"
   - Ordenable
   - Paginación si se quiere ver más

7. **Crear timeline de actividad (components/firma/analytics/ActivityTimeline.tsx):**
   
   - Timeline vertical de eventos recientes:
     * Firmas realizadas
     * Flujos completados
     * Reversiones
   - Cada evento con:
     * Icono
     * Descripción
     * Tiempo relativo
     * Usuario involucrado
     * Link al documento
   - Scroll infinito o paginación

8. **Crear filtros de fecha y período (components/firma/analytics/AnalyticsFilters.tsx):**
   
   - Selector de rango de fechas (DateRangePicker)
   - Botones rápidos:
     * Hoy
     * Esta Semana
     * Este Mes
     * Últimos 30 días
     * Últimos 3 meses
     * Año actual
     * Personalizado
   - Selector de agrupación (día, semana, mes)
   - Botón "Aplicar Filtros"
   - Botón "Exportar Reporte"

9. **Crear página de dashboard analítico (app/(dashboard)/firma/analytics/page.tsx):**
   
   Layout:
   
   ```
   +----------------------------------+
   |    Filtros de Fecha              |
   +----------------------------------+
   |  Card  |  Card  |  Card  |  Card |
   +----------------------------------+
   |  Gráfico de Tendencia            |
   |  (Líneas)                        |
   +----------------------------------+
   | Distribución  |  Top Firmantes   |
   | (Donut)       |  (Tabla)         |
   +----------------------------------+
   | Timeline de Actividad            |
   +----------------------------------+
   ```
   
   - Header con título "Analítica de Firma Digital"
   - Botón "Exportar Reporte Completo"
   - Componentes responsivos (stack en móvil)
   - Loading states para cada sección
   - Auto-refresh cada 5 minutos

10. **Crear modal de exportación de reporte (components/firma/analytics/ExportReportModal.tsx):**
    
    - Título: "Exportar Reporte Analítico"
    - Opciones:
      * Formato: PDF, Excel, CSV
      * Incluir gráficos (checkbox)
      * Rango de fechas (pre-llenado con filtros actuales)
      * Secciones a incluir (checkboxes):
        - Métricas generales
        - Tendencia de firmas
        - Distribución por tipo
        - Top firmantes
        - Estadísticas de flujos
        - Análisis de reversiones
    - Vista previa del reporte (opcional)
    - Botón "Generar Reporte"
    - Download automático al completarse

11. **Agregar ruta al sidebar:**
    
    - Sección "Firma Digital"
    - Agregar "Analítica" con icono BarChart
    - Visible para admin y operadores

**Criterios de Éxito:**
- ✅ El dashboard muestra métricas actualizadas correctamente
- ✅ Los gráficos se renderizan con datos reales
- ✅ Los filtros de fecha funcionan y actualizan los datos
- ✅ El ranking de usuarios es preciso
- ✅ La timeline muestra eventos recientes
- ✅ La exportación de reportes funciona en todos los formatos
- ✅ El diseño es profesional y fácil de interpretar
- ✅ El dashboard es responsive
- ✅ Las métricas se actualizan automáticamente
- ✅ La experiencia es fluida y sin lag

**Testing Manual:**
1. Acceder a /firma/analytics
2. Verificar que todas las métricas carguen
3. Cambiar filtro de fecha → ver actualización
4. Verificar gráfico de tendencia con datos correctos
5. Ver distribución por tipo → verificar porcentajes
6. Revisar top firmantes → verificar ranking
7. Scroll en timeline → ver más eventos
8. Exportar reporte PDF → descargar y verificar
9. Exportar Excel → verificar datos
10. Probar en móvil → verificar responsive

**Siguiente Paso:**
PROMPT 029 (renumerado de 026) para implementar el sistema de reportes general.

---

### PROMPT 025: Interfaz de Firma Digital (Frontend)

**Contexto:**
Todo el backend del módulo de firma digital está implementado. Ahora crearemos la interfaz de usuario completa para la firma de documentos, verificación y gestión de flujos de firma.

**Objetivo:**
Implementar páginas de firma individual, verificación de firma, y gestión de flujos de firma, con componentes interactivos y feedback visual.

**Instrucciones:**

1. **Crear tipos TypeScript (types/signature.types.ts):**
   
   ```typescript
   interface SignatureData {
     signer: string;
     status: string;
     date: string;
     format: string;
     // ... otros campos relevantes de la respuesta de Firma Perú
   }
   
   interface SignatureFlowSigner {
     userId: string;
     fullName: string;
     order: number;
     signedAt?: string;
     status: 'PENDING' | 'SIGNED' | 'REJECTED';
   }
   
   interface SignatureFlow {
     id: string;
     name: string;
     document: { id: string; fileName: string; documentNumber: string; };
     signers: SignatureFlowSigner[];
     currentStep: number;
     status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
     createdBy: { id: string; fullName: string; };
     createdAt: string;
   }
   ```

2. **Crear servicio de API (lib/api/firma.ts):**
   
   ```typescript
   export const firmaApi = {
     signDocument: (documentId: string, file: File, documentExtension: string) => {
       const formData = new FormData();
       formData.append('file', file);
       formData.append('documentExtension', documentExtension);
       return api.post(`/firma/sign-document/${documentId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
     },
     signBatchDocuments: (documentIds: string[], files: File[], documentExtension: string) => { /* ... */ },
     verifyDocument: (documentId: string) => api.get(`/firma/verify/${documentId}`),
     uploadAndVerify: (file: File, documentExtension: string) => { /* ... */ },
     revertSignature: (documentId: string) => api.post(`/firma/revert/${documentId}`),
     
     createFlow: (documentId: string, name: string, signers: Array<{ userId: string, order: number }>) => api.post('/firma/flows', { documentId, name, signers }),
     getFlows: (params) => api.get('/firma/flows', { params }),
     getFlowById: (id: string) => api.get(`/firma/flows/${id}`),
     getPendingFlows: () => api.get('/firma/flows/pending'),
     advanceFlow: (flowId: string, file: File, documentExtension: string) => { /* ... */ },
     cancelFlow: (flowId: string) => api.post(`/firma/flows/${flowId}/cancel`),
   };
   ```

3. **Crear hook personalizado (hooks/useFirma.ts):**
   
   - `signDocument(documentId, file, extension)`
   - `verifyDocument(documentId)`
   - `revertSignature(documentId)`
   - `createSignatureFlow(documentId, name, signers)`
   - `advanceSignatureFlow(flowId, file, extension)`
   - `cancelSignatureFlow(flowId)`
   - `fetchSignatureFlows(filters, pagination)`
   - `fetchPendingSignatureFlows()`
   - Manejo de estados de carga, errores y toasts.

4. **Crear componente de firma individual (components/firma/IndividualSigner.tsx):**
   
   - Input para cargar el documento (si no es uno existente).
   - `PDFViewer` para previsualizar el documento.
   - Botón "Firmar Documento".
   - Selector de certificado digital (simulado por ahora, o un input para el archivo .p12 si se maneja en frontend).
   - Feedback de progreso y resultado de la firma.

5. **Crear componente de verificación de firma (components/firma/SignatureVerifier.tsx):**
   
   - Input para cargar un documento PDF (para verificación ad-hoc).
   - `PDFViewer` del documento.
   - Botón "Verificar Firma".
   - Mostrar el reporte de validación de Firma Perú:
     * Estado general (VÁLIDO, NO VÁLIDO, INDETERMINADO).
     * Lista de firmas encontradas, con detalles de cada una (firmante, fecha, estado, certificado, cadena de confianza).
     * Resaltar errores o advertencias.
   - Botón para descargar el reporte de verificación.

6. **Crear interfaz de flujos de firma (components/firma/SignatureFlowManager.tsx):**
   
   - Tabla de flujos de firma (con filtros por estado, documento).
   - Botón "Crear Flujo de Firma" (abre modal).
   - Modal de creación de flujo:
     * Selector de documento.
     * Input para nombre del flujo.
     * Componente para agregar firmantes (select de usuarios, orden).
   - Vista de detalles de flujo:
     * Mostrar estado actual, documento, firmantes y su estado.
     * Botón "Firmar" (solo si es el turno del usuario actual).
     * Botón "Cancelar Flujo" (solo para creador o admin).
     * Notificaciones visuales para flujos pendientes.

7. **Crear página de firma (app/(dashboard)/firma/firmar/page.tsx):**
   
   - Pestañas o secciones para:
     * Firma Individual (`IndividualSigner`)
     * Firma Múltiple (componente similar a `IndividualSigner` pero para varios archivos)
     * Flujos de Firma Pendientes (lista de flujos donde el usuario es el siguiente firmante).

8. **Crear página de verificación (app/(dashboard)/firma/verificar/page.tsx):**
   
   - Integrar `SignatureVerifier`.
   - Opción para verificar un documento existente del sistema o subir uno nuevo.

9. **Crear página de flujos de firma (app/(dashboard)/firma/flujos/page.tsx):**
   
   - Integrar `SignatureFlowManager`.

10. **Actualizar `Sidebar.tsx`:**
    
    Agregar enlaces bajo la sección "Firma Digital":
    - Firmar Documento
    - Verificar Firma
    - Flujos de Firma
    - Visible para roles `Administrador` y `Operador`.

**Criterios de Éxito:**
- ✅ La interfaz de firma individual permite al usuario firmar un documento y ver el resultado.
- ✅ La interfaz de verificación muestra un reporte detallado de la validez de las firmas.
- ✅ La gestión de flujos de firma permite crear, seguir y avanzar flujos.
- ✅ Los usuarios son notificados de los flujos pendientes.
- ✅ La reversión de firma está disponible para administradores.
- ✅ La interfaz es intuitiva y proporciona feedback claro.

**Testing Manual:**
1. Firmar un documento individualmente.
2. Verificar la firma del documento recién firmado.
3. Crear un flujo de firma y seguirlo con diferentes usuarios.
4. Verificar la firma de un documento dentro de un flujo.
5. Como administrador, revertir la firma de un documento y verificar el estado.

**Siguiente Paso:**
PROMPT 026 para implementar el sistema de reportes (backend).

---

### PROMPT 028-1: Refinamiento Visual y Sistema de Diseño (Frontend)

**Contexto:** El módulo de firma digital es funcional, pero mantiene fondos grises y densidad visual distinta al módulo de Archivo Digital. Debemos unificar la estética con superficies blancas, tipografía consistente y contrastes AA.

**Objetivo:** Actualizar todos los componentes y páginas del módulo de firma para alinearlos con el sistema de diseño limpio y profesional del resto del frontend.

**Instrucciones:**
1. Ajustar `frontend/app/globals.css` y `tailwind.config.js` con utilidades para tarjetas (`bg-white`, `border-slate-200`, `shadow-sm`), tipografías (`text-slate-900`, `text-slate-600`) y contenedores (`px-6 lg:px-10`, `min-h-[calc(100vh-6rem)]`).
2. Refactorizar `IndividualSigner.tsx`, `CreateSignatureFlowForm.tsx`, `SignatureFlowDetail.tsx`, `SignatureFlowsTable.tsx`, `SignerSelector.tsx` y las páginas `/dashboard/firma/firmar`, `/dashboard/firma/flujos`, `/dashboard/firma/validar` para eliminar fondos `bg-gray-50/bg-blue-50`, usar `space-y-6`, divisores `border-t border-slate-200`, títulos `text-2xl font-semibold` y subtítulos `text-base text-slate-600`.
3. En `SignatureDashboard` y `components/firma/analytics/*`, emplear tarjetas blancas, iconos en badges `bg-slate-100`, paleta consistente (`#2563EB`, `#0EA5E9`, `#22C55E`, `#F97316`, `#EF4444`) y gráficas con estilos suaves.
4. Aplicar zebra `odd:bg-slate-50/40` y `hover:bg-slate-50` en tablas, botones `size="sm" variant="outline"`, badges tonales y espaciados coherentes.
5. Revisar vistas del módulo de Archivo Digital (ej. `/dashboard/archivo/documentos`) y replicar patrones de `PageHeader`, cards y spacing para asegurar continuidad visual.

**Criterios de Éxito:**
- ✅ Todas las vistas de firma muestran superficies blancas y tipografía homogénea.
- ✅ Los contrastes cumplen AA y se elimina ruido visual.
- ✅ Dashboard, tablas y formularios conservan jerarquía limpia y profesional.

**Testing Manual:**
1. Revisar `/dashboard/firma/firmar`, `/dashboard/firma/flujos`, `/dashboard/firma/validar`, `/dashboard/firma/analytics` en desktop y mobile.
2. Validar contraste con Lighthouse/axe.
3. Comparar visualmente con el módulo de Archivo Digital.

**Siguiente Paso:** PROMPT 028-2 para crear una experiencia de firma guiada.

---

### PROMPT 028-2: Experiencia Guiada de Firma Paso a Paso (Frontend + Backend)

**Contexto:** El flujo de firma funciona pero no orienta a usuarios sin experiencia. Necesitamos un asistente que explique cada etapa usando la lógica existente de `useFirma`.

**Objetivo:** Implementar un wizard de tres pasos que guíe al usuario desde la selección del documento hasta la firma final, mostrando estados y mensajes claros.

**Instrucciones:**
1. Crear `components/firma/SignatureWizard.tsx` con stepper horizontal (Seleccionar Documento → Revisar Detalles → Firmar), paneles blancos, checklist dinámico y CTA principal. En desktop, añadir resumen lateral con documento, estado, razón y logo.
2. Reemplazar `/dashboard/firma/firmar` con el wizard. Paso 1 reutiliza `DocumentList` con búsqueda y filtros. Paso 2 incluye visor PDF y metadatos en grid. Paso 3 embebe `IndividualSigner` adaptado al wizard, mostrando checklist (token, drivers, logo) y sincronizando estados.
3. Actualizar `useFirma` para exponer estado de progreso (`idle`, `preparing`, `initiated`, `completed`, `error`) y mensajes descriptivos para toasts y UI.
4. Añadir endpoint `GET /firma/precheck/:documentId` en backend para validar permisos, estado del flujo y devolver checklist para el paso 2.
5. Crear modal post-firma con card blanca, icono y estado (`VALID`, `PENDING`, `INDETERMINATE`), más acciones (descargar, validar, ver historial).

**Criterios de Éxito:**
- ✅ El usuario entiende cada paso y recibe retroalimentación clara.
- ✅ El wizard refleja el estado real del proceso de firma.
- ✅ El diseño mantiene la estética minimalista.

**Testing Manual:**
1. Completar la firma de un documento recorriendo los tres pasos.
2. Validar bloqueos cuando faltan requisitos (documento, razón, checklist).
3. Revisar mensajes finales para distintos resultados.

**Siguiente Paso:** PROMPT 028-3 para optimizar la gestión de flujos.

---

### PROMPT 028-3: Productividad en Gestión de Flujos (Frontend + Backend)

**Contexto:** La tabla de flujos existe, pero carece de filtros avanzados, indicadores de progreso y detalle profesional.

**Objetivo:** Mejorar la gestión de flujos con filtros completos, visualización de avance y timeline ordenado.

**Instrucciones:**
1. Extender `signature-flow.service.ts` y controladores para aceptar filtros (`status`, `documentTypeId`, `createdById`, `dateFrom`, `dateTo`) y devolver metadatos (totales por estado, porcentaje completado, fechas clave).
2. Crear `components/firma/SignatureFlowsFilters.tsx` con formularios blancos, selects, date range picker, chips de filtros activos y botón “Limpiar”.
3. Actualizar `SignatureFlowsTable` con columna de progreso (barra `bg-slate-100`), avatar del creador, fecha formateada y acciones destacadas (Ver detalle, Cancelar) con tooltips.
4. Refinar `SignatureFlowDetail` en secciones (Información general, Firmantes con timestamps, Historial en timeline vertical) y resaltar botón para firmante actual.
5. Ajustar `/dashboard/firma/flujos` a layout responsive con filtros + lista + panel de detalle; agregar cards resumen de flujos activos/completados/pendientes.

**Criterios de Éxito:**
- ✅ Filtros permiten localizar flujos rápidamente.
- ✅ El progreso y timeline se leen claramente.
- ✅ Acciones principales están visibles y accesibles.

**Testing Manual:**
1. Aplicar filtros combinados y revisar resultados.
2. Verificar timeline y porcentajes en distintos estados.
3. Cancelar flujos y confirmar actualización sin recarga completa.

**Siguiente Paso:** PROMPT 028-4 para el centro de verificación post-firma.

---

### PROMPT 028-4: Centro de Verificación y Reporte Post-Firma (Frontend + Backend)

**Contexto:** Actualmente se enfoca en la validación externa. Se necesita un centro integral con resultados internos, observaciones y acceso a Firma Perú.

**Objetivo:** Construir una vista profesional que resuma estado de firmas, observaciones, historial y ofrezca reportes descargables.

**Instrucciones:**
1. Implementar `GET /firma/validation-report/:documentId` que combine el resultado de `parseFirmaPeruValidationResponse`, historial de validaciones, reversión reciente y datos del firmante, incluyendo recomendaciones textuales.
2. Estructurar `/dashboard/firma/validar` con tabs (“Resumen Interno”, “Validación Externa”, “Historial”), card principal blanca con badge, integridad, fecha y CTA, y accordion por firma con detalles de certificado. Añadir botón “Descargar reporte PDF”.
3. Crear `ValidationSummaryCard.tsx` e `InfoBanner.tsx` (fondo blanco, borde azul suave) para mensajes clave.
4. Configurar `generateMetadata` con título “Validación de Firma Digital | SAD” y texto introductorio optimizado.
5. Mantener tipografía y espaciados definidos en PROMPT 028-1, evitando alertas saturadas.

**Criterios de Éxito:**
- ✅ Los usuarios comprenden el estado de validación desde un único panel limpio.
- ✅ Pueden descargar reportes internos y acceder al validador externo.
- ✅ La vista respeta el diseño minimalista.

**Testing Manual:**
1. Validar documentos en distintos estados y revisar presentación.
2. Descargar reporte y comprobar contenido.
3. Evaluar comprensión con usuarios sin experiencia técnica.

**Siguiente Paso:** PROMPT 028-5 para accesibilidad y normas ISO.

---

### PROMPT 028-5: Accesibilidad ISO, UX y Optimización SEO (Frontend + QA)

**Contexto:** Debemos cumplir ISO 9241-210/25010, accesibilidad AA y buenas prácticas SEO internas.

**Objetivo:** Auditar accesibilidad, gestionar focos, mejorar textos guía y optimizar rendimiento/SEO del módulo de firma.

**Instrucciones:**
1. Ejecutar Lighthouse/axe en `/dashboard/firma/firmar`, `/dashboard/firma/flujos`, `/dashboard/firma/validar`; corregir labels, roles ARIA, jerarquía semántica y textos alternativos.
2. Implementar `FocusTrap` en modales (`Dialog`) y mover foco al encabezado del paso activo en el wizard.
3. Añadir microcopys (“Paso 2 de 3”), tooltips con `HelpCircle`, y feedback textual además de color.
4. Configurar `generateMetadata`, lazy-load de gráficos (`dynamic()` sin SSR), dividir bundles de iconos y optimizar imágenes (Next Image, WebP/AVIF).
5. Documentar internamente (ticket) el cumplimiento de heurísticas Nielsen/ISO y probar navegación con teclado y lectores de pantalla (NVDA/VoiceOver).

**Criterios de Éxito:**
- ✅ Accesibilidad ≥90 en Lighthouse.
- ✅ Todos los flujos operables solo con teclado.
- ✅ Mensajes guían sin saturación visual.

**Testing Manual:**
1. Navegar con Tab/Shift+Tab por todas las vistas de firma.
2. Ejecutar Lighthouse y registrar resultados.
3. Usar lector de pantalla para confirmar lectura de pasos y botones.

**Siguiente Paso:** PROMPT 028-6 para tours interactivos.

---

### PROMPT 028-6: Tours Interactivos del Módulo de Firma (Frontend)

**Contexto:** Otros módulos ya tienen tours. Debemos incorporar recorridos guiados en firma digital respetando estética limpia y accesible.

**Objetivo:** Crear tours para firmar, gestionar flujos, validar y consultar analytics, integrados con la infraestructura de tours existente.

**Instrucciones:**
1. Crear `frontend/config/tours/firma.ts` con tours para `firmar`, `flujos`, `validar`, `analytics`, máximo 6 pasos, copy profesional y botones “Siguiente/Anterior/Finalizar”.
2. Integrar el hook de tours existente (referencia módulo Archivo Digital). Añadir botón “Recorrido guiado” en headers y tooltips blancos con sombra suave, texto oscuro y flecha discreta.
3. Garantizar accesibilidad: foco automático en tooltip activo, tecla Esc para cerrar, soporte de screen readers.
4. Persistir estado en store (Zustand) y registrar evento en backend (`audit.service.log`) al finalizar cada tour.
5. Realizar QA visual en desktop y mobile ajustando posiciones para no cubrir elementos clave.

**Criterios de Éxito:**
- ✅ Tours disponibles en todas las vistas clave con copy claro.
- ✅ Diseño de tooltips mantiene estética minimalista.
- ✅ Completitud se persiste y se audita correctamente.

**Testing Manual:**
1. Ejecutar cada tour en desktop y mobile.
2. Confirmar persistencia del estado completado y registro en auditoría.
3. Verificar cierre con Esc y estabilidad del UI.

**Siguiente Paso:** PROMPT 026 (reportes backend) para continuar con roadmap general.

---

### PROMPT 026: Sistema de Reportes (Backend)

**Contexto:**
El módulo de firma digital está completo. Ahora implementaremos el backend para generar diversos reportes sobre la gestión documental, actividad de usuarios y firmas, con opciones de exportación a PDF, Excel y CSV.

**Objetivo:**
Crear APIs para generar reportes dinámicos con filtros, agregación de datos y exportación en múltiples formatos.

**Instrucciones:**

1. **Crear servicio de reportes (src/services/reports.service.ts):**
   
   - `generateDocumentReport(filters: { periodId?: string, officeId?: string, documentTypeId?: string, dateFrom?: string, dateTo?: string })`:
     * Reporte de documentos por periodo, oficina, tipo.
     * Contar total de documentos, folios, documentos firmados, documentos con OCR.
     * Agrupar datos según los filtros.
     * Retornar datos estructurados para gráficos y tablas.
   
   - `generateUserActivityReport(filters: { userId?: string, action?: string, dateFrom?: string, dateTo?: string })`:
     * Utilizar `audit.service.getAuditLogs` para obtener datos.
     * Agrupar por usuario, acción, módulo, día.
     * Retornar datos de actividad de usuarios.
   
   - `generateSignatureReport(filters: { signerId?: string, status?: string, dateFrom?: string, dateTo?: string })`:
     * Reporte de firmas realizadas, por usuario, por estado.
     * Incluir flujos de firma activos/completados.
     * Retornar datos de firmas.
   
   - `exportReport(reportData: any, format: 'pdf' | 'xlsx' | 'csv', reportName: string)`:
     * Utilizar librerías como `pdf-lib` (para PDF), `exceljs` (para XLSX), `csv-stringify` (para CSV).
     * Formatear `reportData` según el formato de salida.
     * Retornar el buffer del archivo generado.
     * Registrar exportación en auditoría.

2. **Crear controladores de reportes (src/controllers/reports.controller.ts):**
   
   - `getDocumentReport`: GET /api/reports/documents
     * Recibir filtros como query params.
     * Llamar a `reports.service.generateDocumentReport`.
     * Retornar los datos del reporte.
   
   - `getUserActivityReport`: GET /api/reports/activity
     * Recibir filtros.
     * Llamar a `reports.service.generateUserActivityReport`.
     * Retornar los datos.
   
   - `getSignatureReport`: GET /api/reports/signatures
     * Recibir filtros.
     * Llamar a `reports.service.generateSignatureReport`.
     * Retornar los datos.
   
   - `exportDocumentReport`: GET /api/reports/documents/export
     * Recibir filtros y `format`.
     * Llamar a `reports.service.generateDocumentReport` y luego `reports.service.exportReport`.
     * Enviar el archivo como respuesta.
   
   - `exportUserActivityReport`: GET /api/reports/activity/export
   - `exportSignatureReport`: GET /api/reports/signatures/export

3. **Crear rutas de reportes (src/routes/reports.routes.ts):**
   
   ```
   GET /api/reports/documents          - Obtener datos de reporte documental (autenticado, admin, operador)
   GET /api/reports/activity           - Obtener datos de reporte de actividad (autenticado, admin)
   GET /api/reports/signatures         - Obtener datos de reporte de firmas (autenticado, admin, operador)
   GET /api/reports/documents/export   - Exportar reporte documental (autenticado, admin, operador)
   GET /api/reports/activity/export    - Exportar reporte de actividad (autenticado, admin)
   GET /api/reports/signatures/export  - Exportar reporte de firmas (autenticado, admin, operador)
   ```
   
   Aplicar middlewares de autenticación y autorización.

4. **Integrar auditoría en `reports.service`:**
   
   - Registrar la generación y exportación de cada reporte.

5. **Integrar rutas en `app.ts`**

**Criterios de Éxito:**
- ✅ Las APIs de reportes retornan datos estructurados según los filtros.
- ✅ La exportación a PDF, Excel y CSV funciona correctamente.
- ✅ Los reportes de actividad de usuarios y firmas se generan con datos relevantes.
- ✅ La auditoría registra la generación y exportación de reportes.
- ✅ Las rutas están protegidas por autenticación y autorización.

**Testing Manual:**
1. Generar datos de prueba (documentos, firmas, actividad).
2. Realizar GET a las APIs de reportes con diferentes filtros.
3. Verificar que los datos retornados son correctos.
4. Realizar GET a las APIs de exportación y descargar los archivos generados.
5. Abrir los archivos (PDF, XLSX, CSV) y verificar su contenido.

**Siguiente Paso:**
PROMPT 027 para crear la interfaz de reportes y exportación en el frontend.

---

### PROMPT 027: Interfaz de Reportes y Exportación (Frontend)

**Contexto:**
El backend de reportes está implementado. Ahora crearemos la interfaz de usuario para visualizar y exportar los reportes, incluyendo gráficos y filtros interactivos.

**Objetivo:**
Implementar una página de reportes con diferentes tipos de informes, filtros dinámicos, visualizaciones de datos (gráficos) y opciones de exportación a PDF, Excel y CSV.

**Instrucciones:**

1. **Crear tipos TypeScript (types/report.types.ts):**
   
   ```typescript
   interface DocumentReportData {
     totalDocuments: number;
     totalFolios: number;
     signedDocuments: number;
     ocrProcessedDocuments: number;
     documentsByPeriod: Array<{ period: string; count: number; }>;
     documentsByOffice: Array<{ office: string; count: number; }>;
     documentsByType: Array<{ type: string; count: number; }>;
   }
   
   interface UserActivityReportData {
     mostActiveUsers: Array<{ user: string; actions: number; }>;
     actionsByModule: Array<{ module: string; count: number; }>;
     actionsByDay: Array<{ date: string; count: number; }>;
   }
   
   interface SignatureReportData {
     totalSignedDocuments: number;
     signaturesByUser: Array<{ user: string; count: number; }>;
     signaturesByPeriod: Array<{ period: string; count: number; }>;
     activeFlows: number;
     completedFlows: number;
     avgSigningTime: string;
   }
   ```

2. **Crear servicio de API (lib/api/reports.ts):**
   
   ```typescript
   export const reportsApi = {
     getDocumentReport: (filters) => api.get<DocumentReportData>('/reports/documents', { params: filters }),
     getUserActivityReport: (filters) => api.get<UserActivityReportData>('/reports/activity', { params: filters }),
     getSignatureReport: (filters) => api.get<SignatureReportData>('/reports/signatures', { params: filters }),
     
     exportDocumentReport: (filters, format: 'pdf' | 'xlsx' | 'csv') => api.get(`/reports/documents/export`, { params: { ...filters, format }, responseType: 'blob' }),
     exportUserActivityReport: (filters, format: 'pdf' | 'xlsx' | 'csv') => api.get(`/reports/activity/export`, { params: { ...filters, format }, responseType: 'blob' }),
     exportSignatureReport: (filters, format: 'pdf' | 'xlsx' | 'csv') => api.get(`/reports/signatures/export`, { params: { ...filters, format }, responseType: 'blob' }),
   };
   ```

3. **Crear hook personalizado (hooks/useReports.ts):**
   
   - `fetchDocumentReport(filters)`
   - `fetchUserActivityReport(filters)`
   - `fetchSignatureReport(filters)`
   - `exportReport(type, filters, format)`
   - Manejo de estados de carga y errores.

4. **Crear componentes de gráficos (components/reports/ReportCharts.tsx):**
   
   - Utilizar una librería de gráficos (ej. `recharts` o `chart.js`).
   - Componentes para:
     * Gráfico de barras (ej. documentos por tipo, acciones por módulo).
     * Gráfico de líneas (ej. documentos/acciones por día/mes).
     * Gráfico circular (ej. distribución por oficina).
   - Props: `data`, `type` (bar, line, pie), `title`.

5. **Crear componente de filtros de reportes (components/reports/ReportFilters.tsx):**
   
   - Selector de tipo de reporte (Documental, Actividad de Usuarios, Firmas).
   - Campos de filtro dinámicos según el tipo de reporte seleccionado:
     * `DatePicker` para rangos de fecha.
     * `Select` para `periodId`, `officeId`, `documentTypeId`, `userId`, `action`, `signerId`, `status`.
   - Botón "Generar Reporte".
   - Botón "Limpiar Filtros".
   - Botones de exportación (PDF, Excel, CSV).

6. **Crear página de reportes (app/(dashboard)/reportes/page.tsx):**
   
   Integrar:
   - `ReportFilters` en la parte superior.
   - Área de visualización de reportes:
     * Mostrar un resumen de datos clave en cards.
     * Renderizar los `ReportCharts` según el tipo de reporte y los datos obtenidos.
     * Mostrar tablas de datos detallados si es necesario.
   - Manejar el estado de carga y los mensajes de error.

7. **Actualizar `Sidebar.tsx`:**
   
   Agregar enlace a `/reportes` bajo la sección "Reportes".
   - Visible para roles `Administrador` y `Operador`.

**Criterios de Éxito:**
- ✅ La página de reportes permite seleccionar diferentes tipos de informes.
- ✅ Los filtros se adaptan dinámicamente al tipo de reporte.
- ✅ Los gráficos se renderizan correctamente con los datos del backend.
- ✅ La exportación a PDF, Excel y CSV funciona desde la interfaz.
- ✅ La interfaz es intuitiva y proporciona una visión clara de los datos.

**Testing Manual:**
1. Ir a la página de reportes.
2. Seleccionar diferentes tipos de reportes y aplicar filtros.
3. Verificar que los gráficos y los datos se actualizan.
4. Probar las opciones de exportación y verificar que los archivos se descargan correctamente.

**Siguiente Paso:**
PROMPT 027-1 para perfeccionar el diseño y la experiencia visual del módulo de reportes.

---

### PROMPT 027-1: Rediseño Visual del Módulo de Reportes (Frontend)

**Contexto:**
La página `frontend/app/dashboard/reportes/page.tsx` ya muestra filtros, resúmenes y gráficos, pero el diseño debe alinearse con el estilo minimalista y luminoso de Archivo Digital, cuidando jerarquía visual y limpieza.

**Objetivo:**
Reestructurar la interfaz de reportes con un layout profesional, fondo claro, tipografía legible y componentes equilibrados que mantengan consistencia con el resto del sistema.

**Instrucciones:**
1. Implementar un contenedor maestro en `ReportesPage` con fondo `bg-slate-50` y padding amplio; encapsular el contenido en tarjetas `bg-white shadow-sm rounded-2xl border border-slate-200` para cada bloque (filtros, resumen, gráficos, tablas).
2. Crear `frontend/components/reports/ReportLayout.tsx` que provea secciones reutilizables (`ReportSection`, `ReportSectionHeader`, `ReportGrid`) manejando márgenes y títulos; migrar `ReportFilters`, `ReportSummary` y los gráficos para usar estas wrappers.
3. Ajustar `ReportSummary` para mostrar cards simétricas con íconos en badges circulares (`bg-blue-100 text-blue-600`) y valores en `text-4xl font-semibold text-slate-900`; asegurar contraste AA.
4. Actualizar `ReportCharts` para incorporar títulos con tipografía `text-base font-semibold`, leyenda alineada, tooltips con fondo blanco y sombra suave (`shadow-lg`) y paleta corporativa (`#1d4ed8`, `#0f766e`, `#f59e0b`).
5. Definir variables de espaciado y colores en un archivo `frontend/styles/report-theme.css` o utilidades Tailwind personalizadas para mantener coherencia visual y facilitar mantenimiento.

**Criterios de Éxito:**
- ✅ La vista de reportes refleja un layout limpio, fondo claro y tarjetas equilibradas.
- ✅ Los componentes reutilizan `ReportLayout` asegurando spacing uniforme.
- ✅ Los textos cumplen contraste mínimo AA en todos los estados.

**Testing Manual:**
1. Revisar la página en desktop y mobile verificando alineación, espaciado y fondos claros.
2. Validar contraste con herramientas Chrome DevTools > Lighthouse (accesibilidad ≥ 90).
3. Comparar la vista con el módulo de Archivo Digital para confirmar consistencia visual.

**Siguiente Paso:**
PROMPT 027-2 para optimizar la usabilidad secuencial y los flujos guiados del módulo de reportes.

---

### PROMPT 027-2: Flujos Secuenciales y Usabilidad en Reportes (Frontend)

**Contexto:**
Los filtros actuales se aplican manualmente y el usuario debe entender qué pasos seguir. Necesitamos una experiencia guiada, con validaciones claras, estados vacíos informativos y ejecución en un solo clic.

**Objetivo:**
Diseñar flujos de generación de reportes orientados a tareas, con onboarding contextual, validaciones ISO 9241-110 y mensajes accesibles para usuarios sin experiencia técnica.

**Instrucciones:**
1. Refactorizar `ReportFilters` para usar `react-hook-form` con esquema Zod; inicializar valores por defecto y validar rangos de fechas (dateFrom ≤ dateTo) mostrando mensajes inline discretos.
2. Añadir un encabezado tipo “Guía rápida” con pasos numerados (1. Selecciona tipo, 2. Ajusta filtros, 3. Genera reportes, 4. Exporta) que cambie de estado según avance.
3. Implementar presets de filtros guardados (última semana, último mes, personalizado) persistiendo selección en Zustand (`useUserPreferencesStore`).
4. Agregar skeleton loaders y placeholders descriptivos para estados vacíos; cuando no haya datos, mostrar tarjetas con ícono neutral y CTA “Ajustar filtros”.
5. Incorporar toasts con copy profesional y accesible (`aria-live=polite`) para confirmaciones y errores, basados en `toast.success/error` actual.

**Criterios de Éxito:**
- ✅ El flujo muestra pasos claros y estados amigables sin saturación visual.
- ✅ Los filtros cuentan con validaciones y presets reutilizables.
- ✅ Las personas sin experiencia generan un reporte en menos de tres clics guiados.

**Testing Manual:**
1. Completar el flujo con teclado (Tab/Shift+Tab) asegurando foco visible.
2. Probar presets y validar que los filtros se actualizan correctamente y se recuerdan tras reload.
3. Ejecutar el flujo con datos vacíos para revisar mensajes y accesibilidad.

**Siguiente Paso:**
PROMPT 027-3 para optimizar tablas, exportaciones y cumplir requisitos ISO/SEO.

---

### PROMPT 027-3: Tablas, Exportaciones y Accesibilidad ISO (Frontend)

**Contexto:**
Las tablas y acciones de exportación funcionan, pero requieren mejoras en legibilidad, accesibilidad, SEO interno y consistencia con normas ISO 9241 y WCAG 2.1.

**Objetivo:**
Refinar tablas, cabeceras y mecanismos de exportación para garantizar lectura clara, navegación intuitiva y cumplimiento de estándares internacionales y SEO on-page.

**Instrucciones:**
1. Crear `frontend/components/reports/ReportTable.tsx` con cabecera sticky, zebra stripes suaves (`bg-slate-50`), botones de paginación accesibles y soporte de ordenamiento por columna usando iconos outline.
2. Integrar caption descriptivo y atributos `scope="col"` / `scope="row"`; añadir `sr-only` para información contextual (ej. unidad de medida) asegurando conformidad WCAG.
3. Centralizar acciones de exportación en un `ExportMenu` con botones segmentados (`ButtonGroup`) y tooltips; incluir spinner en estado `exporting` y reporte de éxito accesible.
4. Añadir metadatos semánticos en la página (`metadata` de Next.js) con título “Reportes y Analítica – SAD” y descripción optimizada para SEO; incluir `Breadcrumb` consistente con el resto del dashboard.
5. Documentar en comentarios mínimos (solo cuando sea imprescindible) referencias a normas ISO 9241-110 en validaciones clave.

**Criterios de Éxito:**
- ✅ Las tablas mantienen lectura clara, cabeceras pegajosas y navegación por teclado.
- ✅ Exportar muestra feedback inmediato sin bloquear la UI.
- ✅ La página reportes expone metadatos coherentes y breadcrumbs semánticos.

**Testing Manual:**
1. Revisar tablas con lector de pantalla (NVDA o VoiceOver) comprobando lectura de cabeceras.
2. Ordenar columnas y paginar asegurando que el foco permanece visible.
3. Ejecutar exportaciones en los tres formatos verificando feedback y registros en auditoría.

**Siguiente Paso:**
PROMPT 027-4 para incorporar tours interactivos y onboarding contextual del módulo de reportes.

---

### PROMPT 027-4: Tours Interactivos del Módulo de Reportes (Frontend)

**Contexto:**
El proyecto ya cuenta con infraestructura de tours (ver `frontend/config/tours` y hooks asociados). Falta extenderlo al módulo de reportes manteniendo estilo minimalista.

**Objetivo:**
Diseñar recorridos guiados que expliquen filtros, gráficos, tablas y exportaciones, facilitando adopción por usuarios no técnicos.

**Instrucciones:**
1. Crear `frontend/config/tours/reportes.ts` con tours `intro`, `documentos`, `actividad`, `firmas`; máximo 5 pasos cada uno, copy breve, botones “Siguiente/Anterior/Finalizar”.
2. Integrar los tours en `ReportesPage` usando el hook existente (`useTours`) y añadir botón “Recorrido guiado” en el header con ícono `Sparkles` y estilo ghost.
3. Ajustar estilos de tooltip: fondo blanco, sombra leve, bordes redondeados, título `text-slate-900`, descripción `text-slate-600`, flecha discreta.
4. Sincronizar el estado de tours en la store Zustand (`useToursStore`), registrar completitud en backend vía `audit.service.log` (acción `REPORT_TOUR_COMPLETED`).
5. Asegurar accesibilidad: foco automático en pasos, cierre con `Esc`, soporte para lector de pantalla mediante `role="dialog"` y `aria-describedby`.

**Criterios de Éxito:**
- ✅ Tours disponibles y alineados con el estilo visual del módulo.
- ✅ El backend registra finalización de cada tour con el usuario activo.
- ✅ Usuarios comprenden el flujo completo tras el recorrido sin saturación visual.

**Testing Manual:**
1. Ejecutar cada tour en desktop y mobile revisando posicionamiento de tooltips.
2. Comprobar foco accesible y cierre con tecla `Esc`.
3. Verificar auditoría en backend para cada tour completado.

**Siguiente Paso:**
PROMPT 027-5 para reforzar desempeño, SEO técnico y cumplimiento normativo en reportes.

---

### PROMPT 027-5: Performance, SEO Técnico y Cumplimiento ISO en Reportes (Fullstack)

**Contexto:**
Con el rediseño y tours listos, debemos garantizar rapidez de carga, semántica adecuada y observancia de normas ISO/IEC 25010 en usabilidad y eficiencia.

**Objetivo:**
Optimizar tiempos de respuesta, accesibilidad técnica y telemetría del módulo de reportes, manteniendo experiencia profesional.

**Instrucciones:**
1. Implementar lazy loading de gráficos utilizando `dynamic(() => import(...), { ssr: false, loading: Skeleton })` para reducir TTI.
2. Cachear respuestas de reportes recientes en frontend vía SWR o Zustand (TTL configurable) y en backend con capa temporal (`reports.service` + Redis opcional).
3. Añadir structured data `BreadcrumbList` y `WebApplication` en `<head>` mediante `next/script` para mejorar SEO y descubribilidad interna.
4. Configurar métricas de rendimiento (CLS, LCP, FID) usando `next/script` con `web-vitals` y registrar en endpoint `/api/analytics/web-vitals`.
5. Documentar checklist ISO/IEC 25010 y WCAG 2.1 AA en `docs/calidad/reportes-checklist.md` (solo listado técnico, sin rediseñar documentación existente) para auditorías internas.

**Criterios de Éxito:**
- ✅ El tiempo de carga inicial del módulo baja al menos 20% medido con Lighthouse.
- ✅ Las respuestas de reportes se sirven desde caché cuando aplica, con invalidación controlada.
- ✅ Se generan metadatos estructurados y métricas de experiencia de usuario.

**Testing Manual:**
1. Ejecutar Lighthouse (Performance + Accessibility + Best Practices) verificando >90 en cada métrica.
2. Revisar inspección de elementos confirmando presence de structured data y metadatos.
3. Forzar recarga y confirmar que los datos cacheados se invalidan al modificar filtros críticos.

**Siguiente Paso:**
PROMPT 028 para implementar la optimización y seguridad (backend).

---

### PROMPT 027-6: Configuración Global - Modelo y Almacenamiento (Backend)

**Contexto:**
Actualmente no existe un repositorio central de configuraciones que permita personalizar la identidad corporativa ni los parámetros operativos del sistema. Esto dificulta mantener un branding consistente y preparar la integración con Firma Perú desde un único punto de control.

**Objetivo:**
Definir el modelo persistente y la infraestructura de archivos para gestionar logos, datos de empresa y banderas funcionales de forma segura, auditable y con soporte a actualizaciones futuras.

**Instrucciones:**
1. **Agregar modelo `SystemConfig` en `prisma/schema.prisma`:**
   - Campos sugeridos: `id`, `companyName`, `companyTagline`, `companyEmail`, `contactPhone`, `supportEmail`, `websiteUrl`, `primaryColor`, `accentColor`, `logoFileName`, `logoFilePath`, `logoMimeType`, `logoFileSize`, `stampFileName`, `stampFilePath`, `stampMimeType`, `stampFileSize`, `signatureStampEnabled` (default `true`), `maintenanceMode` (default `false`), `updatedBy` (FK a `User`), `createdAt`, `updatedAt`.
   - Declarar relación opcional `updatedByUser`→`User`, índices sobre `updatedAt` y `updatedBy`, y mapear la tabla como `system_config`.

2. **Generar migración y fila inicial única:**
   - Ejecutar `npx prisma migrate dev --name create-system-config`.
   - Crear script `scripts/ensure-system-config.ts` que ejecute `prisma.systemConfig.upsert` para garantizar un registro con valores por defecto (`companyName: 'Sistema Integrado de Archivos Digitales'`, etc.).

3. **Preparar almacenamiento de activos:**
   - Crear carpeta `backend/uploads/system-config` con subdirectorios `logo` y `stamp` (asegurar su creación automática si no existen).
   - Ampliar `.gitignore` solo si es necesario para mantener la carpeta vacía en control de versiones.
   - Extender `services/storage.service.ts` o crear `services/configuration-storage.service.ts` con helpers para guardar, reemplazar y eliminar archivos PNG/SVG/WebP ≤ 5 MB, registrando metadatos para sincronizarlos con Prisma.

4. **Servir assets públicos:**
   - Exponer `app.use('/api/configuration/assets', express.static('uploads/system-config'))` en `app.ts`, aplicando cabeceras `Cache-Control` de 1 min para facilitar invalidación tras cambios.

5. **Auditoría base:**
   - Registrar en `audit.service.log` cualquier `create`/`update` del modelo con `module: 'CONFIGURACION'` y `action: 'SYSTEM_CONFIG_UPDATED'`, almacenando `oldValue`/`newValue`.

**Criterios de Éxito:**
- ✅ Existe la tabla `system_config` con un registro único y relación opcional a usuarios.
- ✅ Los directorios de assets se crean automáticamente y permiten subir logos/stamps válidos.
- ✅ Los archivos se sirven desde `/api/configuration/assets` respetando las políticas de seguridad existentes.
- ✅ La auditoría registra modificaciones al modelo de configuración.

**Testing Manual:**
1. Abrir `npx prisma studio` y verificar el registro inicial.
2. Subir manualmente un logo usando la utilidad creada y comprobar que se guarda en `uploads/system-config/logo`.
3. Consumir `GET http://localhost:5000/api/configuration/assets/logo/<archivo>` y validar respuesta 200.
4. Revisar tabla `audit_logs` confirmando entradas `SYSTEM_CONFIG_UPDATED`.

**Siguiente Paso:**
PROMPT 027-7 para implementar servicios y endpoints protegidos del módulo de configuraciones.

---

### PROMPT 027-7: Configuración Global - Servicios, API y Seguridad (Backend)

**Contexto:**
Con el modelo y almacenamiento listos, se requiere exponer endpoints seguros para que administradores gestionen los datos y activos de la configuración del sistema.

**Objetivo:**
Construir servicios, controladores y rutas autenticadas que permitan consultar y actualizar la configuración, incluyendo carga/eliminación de logos y sincronización con Firma Perú.

**Instrucciones:**
1. **Servicio (`src/services/configuration.service.ts`):**
   - Implementar métodos `getSystemConfig()`, `updateGeneralConfig(payload, userId)`, `updateBrandAssets(files, userId)` y `removeBrandAsset(type, userId)`.
   - Reutilizar la utilidad de almacenamiento para guardar archivos, eliminando activos anteriores al reemplazar.
   - Centralizar formato de respuesta (DTO con URLs absolutas) y emplear `prisma.systemConfig.upsert` para mantener el registro único.

2. **Validaciones Joi:**
   - Agregar en `utils/validators.ts` esquemas `updateSystemConfigSchema` (limitar longitud, validar emails/URLs/telefonos) y `brandAssetTypeSchema` (`logo` | `stamp`).
   - Reutilizar mensajes en español alineados con el resto de validadores.

3. **Controlador (`src/controllers/configuration.controller.ts`):**
   - Endpoints:
     * `GET /api/configuration` → lectura general.
     * `PUT /api/configuration` → actualización de datos generales.
     * `POST /api/configuration/logo` y `POST /api/configuration/stamp` → carga de archivos `multipart/form-data`.
     * `DELETE /api/configuration/logo` y `DELETE /api/configuration/stamp` → eliminación de activos.
   - Manejar respuestas uniformes (`status`, `message`, `data`) y registrar auditoría con `audit.service`.

4. **Multer especializado:**
   - Crear `config/branding-multer.config.ts` con almacenamiento dinámico según campo (`logo`/`stamp`), filtrando mimetipos (`image/png`, `image/svg+xml`, `image/webp`) y limitando peso a 5 MB.

5. **Rutas y middlewares:**
   - Crear `src/routes/configuration.routes.ts` aplicando `authenticate` y `authorize(['Administrador'])`.
   - Montar en `app.ts` con `app.use('/api/configuration', configurationRoutes);` y añadir rate limiting si existe middleware global.

6. **Caché en memoria:**
   - Utilizar `utils/cache.service` (o crearlo) para cachear el resultado de `getSystemConfig` por 5 minutos, invalidando tras cada actualización.

7. **Integración Firma Perú:**
   - Exponer un helper `getStampAssetUrl()` reutilizable por `firma.controller.ts` y `firma-peru.service.ts` para inyectar el stamp en flujos existentes.

**Criterios de Éxito:**
- ✅ `GET /api/configuration` devuelve datos general y branding con URLs absolutas cuando hay assets.
- ✅ Solo roles Administrador pueden modificar la configuración y los inputs se validan adecuadamente.
- ✅ Reemplazar un logo/stamp elimina el archivo anterior, actualiza metadatos y registra auditoría.
- ✅ Otros servicios (Firma Perú) pueden recuperar el stamp configurado mediante helper.

**Testing Manual:**
1. Consumir `GET /api/configuration` autenticado y verificar estructura esperada.
2. Ejecutar `PUT` con datos válidos/ inválidos para comprobar validaciones y respuestas.
3. Subir un logo permitido y luego intentar un `.jpg` o archivo >5 MB confirmando error.
4. Verificar invalidación de caché realizando `GET` inmediatamente tras una actualización.

**Siguiente Paso:**
PROMPT 027-8 para construir la interfaz administrativa en el frontend.

---

### PROMPT 027-8: Panel de Configuración Corporativa (Frontend)

**Contexto:**
Los administradores necesitan una vista minimalista y consistente con el dashboard para administrar branding, datos de contacto y la configuración del stamp de Firma Perú.

**Objetivo:**
Implementar la página `/dashboard/configuracion` con formularios estilizados, carga de logos y feedback inmediato, reutilizando el diseño luminoso y limpio establecido en el sistema.

**Instrucciones:**
1. **Tipos y API:**
   - Crear `types/configuration.types.ts` con interfaces `SystemConfig`, `GeneralConfig`, `BrandingConfig` y `BrandAsset`.
   - Implementar `lib/api/configuration.ts` con métodos `getConfig`, `updateConfig`, `uploadLogo`, `uploadStamp`, `deleteLogo`, `deleteStamp` usando `FormData` para archivos.

2. **Zustand store:**
   - Añadir `store/configurationStore.ts` que maneje estado, carga, errores y acciones (`fetchConfig`, `saveGeneral`, `uploadAsset`, `removeAsset`).
   - Integrar persistencia ligera (ej. sessionStorage) para evitar flashes innecesarios.

3. **Página principal:**
   - Crear `app/dashboard/configuracion/page.tsx` con layout `min-h-screen bg-slate-50` y contenedor `max-w-5xl mx-auto space-y-6`.
   - Header con `Breadcrumb`, ícono `Settings` en `bg-blue-100 text-blue-600`, título `text-3xl font-bold text-slate-900` y descripción `text-slate-600`.

4. **Formulario de datos generales:**
   - Usar `react-hook-form` + `zod` (esquema reflejando validaciones backend) para campos de empresa, tagline, emails, teléfonos, URL y colores (inputs tipo `color` con preview).
   - Agrupar inputs en grid `md:grid-cols-2 gap-4`, mantener labels `text-sm font-medium text-slate-700` y helpers `text-xs text-slate-500`.
   - Botón `Guardar cambios` (variant `default`) con estados `loading` y mensajes de éxito mediante `sonner`.

5. **Sección de branding minimalista:**
   - Dos tarjetas `Card` (`bg-white border border-slate-200 rounded-2xl p-6`) para Logo principal y Stamp Firma Perú.
   - Incluir placeholder con icono `Image` sobre fondo `bg-slate-100`, preview (`next/image`) y metadatos (peso, fecha).
   - Botones `Subir` (variant `outline`) y `Eliminar` (variant `ghost`, tono `destructive`) alineados a la derecha; mostrar nota de formatos permitidos en texto pequeño.

6. **Controles adicionales:**
   - Añadir `Switch` para `signatureStampEnabled` y `maintenanceMode`, mostrando badges de estado (`bg-emerald-100 text-emerald-700`, `bg-amber-100 text-amber-700`).
   - Mostrar `Última actualización` y `Actualizado por` en un `div` con tipografía secundaria.
   - Integrar recorrido guiado `configuracion-intro-tour` vía `useOnboarding` destacando bloques clave.

7. **Accesibilidad y feedback:**
   - Añadir `aria-describedby` en inputs, foco visible en botones, y manejar arrastrar-soltar opcional con `onDragEnter/Leave` sin romper accesibilidad.
   - Manejar errores desde API mostrando mensajes en línea bajo cada campo afectado.

**Criterios de Éxito:**
- ✅ La página se ajusta al estilo minimalista (fondos claros, cards con borde sutil, tipografía gris oscuro) con contraste AA.
- ✅ Editar y guardar datos generales refleja cambios y muestra toasts descriptivos.
- ✅ Subir y eliminar logos/stamps actualiza la vista y limpia caché local.
- ✅ Los toggles controlan `signatureStampEnabled` y `maintenanceMode` correctamente.

**Testing Manual:**
1. Navegar a `/dashboard/configuracion` como Administrador y verificar carga sin parpadeos.
2. Editar datos de empresa, guardar y confirmar actualización inmediata tras refrescar.
3. Subir logo PNG y stamp SVG observando preview, peso y validaciones; luego eliminarlos verificando estado vacío.
4. Alternar `signatureStampEnabled` y comprobar (en siguiente prompt) su efecto en firmas.

**Siguiente Paso:**
PROMPT 027-9 para integrar la configuración con el resto del sistema y cerrar la experiencia.

---

### PROMPT 027-9: Integración de Configuraciones y Experiencia Final (Fullstack)

**Contexto:**
El panel de configuraciones ya permite gestionar datos, pero es necesario propagar la información a componentes clave (Navbar, firmas, reportes) y asegurar coherencia visual en toda la plataforma.

**Objetivo:**
Sincronizar la configuración global con módulos existentes, garantizar que los flujos de Firma Perú utilicen el stamp configurado y reforzar la experiencia de usuario con feedback y telemetría.

**Instrucciones:**
1. **Navbar y layout:**
   - Actualizar `components/layout/Navbar.tsx` para usar el logo corporativo si existe (`next/image` con fallback monograma) y reemplazar títulos por `config.companyName` / `config.companyTagline`.
   - Ajustar estilos para mantener contraste (`text-slate-900`, `text-slate-500`) y asegurar que el logo respete un área de 40×40 px.

2. **Sidebar y branding general:**
   - Mostrar el nombre corto de la empresa en el panel inferior del `Sidebar` (actualmente “Sistema de Archivos Digitales”).
   - Si hay `primaryColor`, aplicarlo de forma controlada (ej. borde activo) manteniendo accesibilidad.

3. **Flujos de Firma Perú:**
   - Modificar `useFirma` y `SignatureWizard` para consultar la configuración (vía store o fetch) y, si `signatureStampEnabled` es `true`, inyectar la URL del stamp en las peticiones de Firma Perú.
   - Manejar fallback cuando no haya stamp (usar valor actual) y mostrar advertencia en UI si el stamp está desactivado.

4. **Reportes y documentos PDF:**
   - Actualizar `reports.service` (backend) y componentes `ReportSummary`/`ReportTable` para mostrar el logo y datos de contacto en encabezados/footers relevantes sin comprometer el layout.
   - Reutilizar información en exportaciones PDF/XLSX añadiendo metadata (nombre de empresa, correo de contacto).

5. **Telemetría y auditoría complementaria:**
   - Registrar en `analytics.service` un evento `system_config_updated` con payload básico.
   - Añadir paso al onboarding (`OnboardingProvider`) explicando la personalización.

6. **Pruebas de regresión:**
   - Ejecutar scripts críticos (`test-analytics.ts`, `test-firma-flow.ts`) asegurando que logos/stamps no rompen flujos.
   - Revisar Lighthouse accesibilidad y contraste tras aplicar los estilos dinámicos.

**Criterios de Éxito:**
- ✅ El logo y datos de empresa aparecen en Navbar, Sidebar y reportes respetando el diseño minimalista.
- ✅ Los flujos de Firma Perú utilizan el stamp configurado cuando está habilitado y muestran aviso cuando no.
- ✅ Eventos de analytics/auditoría registran cambios de configuración.
- ✅ No se introducen regresiones en firmas, reportes ni navegación general.

**Testing Manual:**
1. Cambiar logo desde el panel y verificar reflejo en Navbar/Sidebar tras refresco.
2. Ejecutar una firma con `signatureStampEnabled` activo y confirmar que el PDF incluye el nuevo stamp.
3. Generar reporte PDF/XLSX comprobando encabezado con datos corporativos.
4. Revisar `audit_logs` y la consola de telemetría para confirmar eventos registrados.

**Siguiente Paso:**
PROMPT 028 para continuar con la optimización y seguridad del backend.

---

## 🎯 FASE 6: MÓDULO DE REPORTES Y FINALIZACIÓN (Continuación)

---

### PROMPT 028: Optimización y Seguridad (Backend)

**Contexto:**
Todos los módulos funcionales están implementados. Ahora nos enfocaremos en la optimización del rendimiento y la implementación de medidas de seguridad robustas, siguiendo las recomendaciones de OWASP Top 10 y los requerimientos no funcionales.

**Objetivo:**
Mejorar el rendimiento del backend y asegurar el sistema contra vulnerabilidades comunes, configurando TLS, rate limiting, CORS, CSP y optimizando la base de datos.

**Instrucciones:**

1. **Configuración de HTTPS/TLS (src/server.ts o configuración de Nginx/proxy):**
   
   - **Nota:** Para un entorno de desarrollo local, se puede usar `https` con certificados auto-firmados. En producción, esto se manejaría típicamente con un proxy inverso como Nginx o un balanceador de carga que gestione los certificados SSL/TLS.
   - Si se configura directamente en Node.js (solo para desarrollo/pruebas):
     * Instalar `https` y `selfsigned`.
     * Generar certificados auto-firmados.
     * Configurar el servidor Express para usar `https.createServer`.
   - **Para producción, la instrucción es más bien configurar el proxy inverso (Nginx) para manejar TLS 1.2+ y redirigir HTTP a HTTPS.** Este prompt se centrará en las configuraciones de Express que complementan esto.

2. **Implementar Rate Limiting (src/middlewares/rate-limit.middleware.ts):**
   
   - Instalar `express-rate-limit`.
   - Crear un middleware para limitar peticiones por IP:
     * `windowMs`: 15 minutos.
     * `max`: 100 peticiones por IP.
     * Mensaje de error personalizado.
   - Aplicar a rutas sensibles (ej. login, registro, APIs de firma).

3. **Configurar CORS correctamente (src/app.ts):**
   
   - Asegurarse de que `cors` esté configurado para permitir solo orígenes específicos en producción.
   - En desarrollo, puede ser `*`.
   - Permitir métodos `GET, POST, PUT, DELETE, OPTIONS`.
   - Permitir headers `Authorization`, `Content-Type`.

4. **Implementar CSP (Content Security Policy) (src/middlewares/csp.middleware.ts):**
   
   - Instalar `helmet` (ya instalado, pero asegurar configuración de CSP).
   - Configurar `helmet.contentSecurityPolicy` con directivas restrictivas:
     * `defaultSrc`: `['self']`.
     * `scriptSrc`: `['self', 'trusted-cdn.com']`.
     * `imgSrc`: `['self', 'data:', 'trusted-image-cdn.com']`.
     * `styleSrc`: `['self', 'unsafe-inline']` (si Tailwind genera estilos inline).
     * `connectSrc`: `['self', 'api.firmaperu.gob.pe']` (URL del validador de Firma Perú).
   - Aplicar este middleware globalmente o a rutas específicas.

5. **Optimizar consultas a base de datos (revisión de servicios):**
   
   - Revisar todos los servicios (`users.service`, `documents.service`, `search.service`, etc.).
   - Asegurarse de usar `select` para obtener solo los campos necesarios.
   - Usar `include` con cuidado para evitar N+1 queries, o usar `_count` cuando solo se necesita el conteo.
   - Verificar que los índices en `schema.prisma` sean adecuados para las consultas más frecuentes.
   - Implementar `connection pooling` (Prisma lo maneja por defecto, pero verificar configuración).

6. **Implementar caché (src/utils/cache.service.ts - opcional, si es necesario):**
   
   - Para datos que no cambian frecuentemente (ej. lista de roles, tipos de documentos).
   - Usar un caché en memoria simple o integrar Redis si la escala lo requiere.
   - `get(key)`, `set(key, value, ttl)`, `del(key)`.
   - Integrar en los servicios que se beneficien del caché.

7. **Optimizar carga de archivos grandes (revisión de `multer` y `storage.service`):**
   
   - Asegurarse de que `multer` maneje los límites de tamaño correctamente.
   - Considerar el streaming de archivos si son extremadamente grandes para evitar cargar todo en memoria.
   - Implementar un proceso de carga en segundo plano para archivos muy grandes si la UX lo requiere.

8. **Auditoría de seguridad OWASP Top 10 (revisión general):**
   
   - **Inyección SQL:** Asegurado por Prisma ORM (no usar raw queries sin sanitización).
   - **Autenticación rota:** Revisar `auth.service` (JWT, bcrypt, expiración, bloqueo de cuentas).
   - **Exposición de datos sensibles:** No retornar contraseñas, tokens sensibles. Cifrado en tránsito (TLS).
   - **XXE:** No aplica directamente si no se procesa XML de fuentes no confiables.
   - **Control de acceso roto:** Revisar `auth.middleware.ts` (`authorize`) en todas las rutas.
   - **Configuración incorrecta de seguridad:** `helmet`, `.env` con variables de producción.
   - **XSS:** Sanitización de inputs en frontend, `helmet` en backend.
   - **Deserialización insegura:** No deserializar datos de fuentes no confiables.
   - **Componentes vulnerables:** Mantener dependencias actualizadas (`npm audit`).
   - **Logging insuficiente:** `audit.service` y `error.middleware` deben registrar eventos clave.

**Criterios de Éxito:**
- ✅ El servidor Express está configurado para usar HTTPS (o preparado para proxy inverso).
- ✅ El rate limiting está activo en rutas críticas.
- ✅ CORS está configurado para producción.
- ✅ CSP está implementado para mitigar XSS y otras inyecciones.
- ✅ Las consultas a la base de datos están optimizadas (uso de `select`, índices).
- ✅ Se han revisado y mitigado las vulnerabilidades del OWASP Top 10.
- ✅ El sistema es más robusto y seguro.

**Testing Manual:**
1. Intentar realizar múltiples peticiones a una ruta protegida por rate limiting y verificar que se bloquea.
2. Probar acceder al backend desde un origen no permitido (si CORS está configurado para producción).
3. Verificar los headers de seguridad en las respuestas HTTP (CSP, X-Content-Type-Options, etc.).
4. Realizar pruebas de carga para verificar el rendimiento.

**Siguiente Paso:**
PROMPT 029 para realizar el testing integral y corrección de bugs.

---

### PROMPT 029: Testing Integral y Corrección de Bugs

**Contexto:**
Todos los módulos funcionales están implementados y se han aplicado medidas de optimización y seguridad. Ahora es crucial realizar un testing exhaustivo de todo el sistema para identificar y corregir cualquier bug o problema de rendimiento/seguridad antes del despliegue.

**Objetivo:**
Realizar pruebas completas de todos los módulos y flujos de usuario, identificar y corregir bugs, optimizar la experiencia de usuario y verificar el cumplimiento de los requerimientos no funcionales.

**Instrucciones:**

1. **Planificación de Pruebas:**
   
   - **Pruebas Unitarias:** Asegurarse de que las funciones individuales de los servicios y utilidades estén cubiertas por pruebas unitarias (si se implementaron).
   - **Pruebas de Integración:** Verificar la comunicación entre el frontend y el backend, y entre los diferentes servicios del backend.
   - **Pruebas de Sistema (End-to-End):** Simular flujos completos de usuario (ej. registro -> login -> cargar documento -> firmar -> buscar -> generar reporte).
   - **Pruebas de Aceptación de Usuario (UAT):** Basadas en los `Criterios de Aceptación` de cada `RF` en `requerimientos.md`.
   - **Pruebas de Rendimiento:** Carga de documentos, búsquedas, generación de reportes (usar herramientas como Apache JMeter o k6).
   - **Pruebas de Seguridad:** Escaneo de vulnerabilidades (OWASP ZAP, Nessus), pruebas de penetración básicas.
   - **Pruebas de Usabilidad:** Evaluar la interfaz de usuario, navegación, feedback.
   - **Pruebas de Compatibilidad:** En diferentes navegadores y dispositivos (responsive).

2. **Ejecución de Pruebas y Registro de Bugs:**
   
   - Utilizar un sistema de seguimiento de bugs (ej. Jira, Trello, o un simple archivo Markdown `BUGS.md`).
   - Registrar cada bug con:
     * Título descriptivo.
     * Pasos para reproducir.
     * Comportamiento esperado vs. comportamiento actual.
     * Severidad (crítico, mayor, menor, estético).
     * Prioridad.
     * Capturas de pantalla/videos (si aplica).

3. **Corrección de Bugs:**
   
   - Priorizar bugs críticos y mayores.
   - Realizar correcciones en el código.
   - Volver a ejecutar las pruebas para verificar que el bug se ha solucionado y que no se han introducido nuevas regresiones.

4. **Optimización de UX:**
   
   - Recopilar feedback de las pruebas de usabilidad.
   - Realizar ajustes menores en la interfaz de usuario, mensajes de error, flujos de navegación para mejorar la experiencia.

5. **Verificación de Requerimientos No Funcionales:**
   
   - **Rendimiento:** Asegurarse de que los tiempos de respuesta (`RNF-001`) y la capacidad de usuarios concurrentes (`RNF-002`) cumplan con los criterios.
   - **Seguridad:** Confirmar que las medidas de seguridad (`RNF-005` a `RNF-008`) están implementadas y son efectivas.
   - **Disponibilidad:** Revisar la configuración de manejo de errores y logging (`RNF-011`).
   - **Compatibilidad:** Probar en los navegadores y resoluciones especificadas (`RNF-020`, `RNF-021`).

6. **Actualización de Documentación:**
   
   - Documentar cualquier cambio significativo en la arquitectura o implementación debido a la corrección de bugs.
   - Actualizar el `README.md` con instrucciones de ejecución y despliegue.

**Criterios de Éxito:**
- ✅ Todos los bugs críticos y mayores han sido identificados y corregidos.
- ✅ El sistema cumple con los requerimientos funcionales y no funcionales.
- ✅ La experiencia de usuario ha sido optimizada.
- ✅ No se han introducido nuevas regresiones.
- ✅ La documentación está actualizada.

**Testing Manual:**
- Seguir los planes de prueba definidos para cada módulo.
- Realizar pruebas de estrés en las funcionalidades clave.
- Verificar la consistencia de los datos después de operaciones complejas (ej. firma, reversión).

**Siguiente Paso:**
PROMPT 030 para la preparación para producción y despliegue.

---

### PROMPT CORRECCION-1: Estabilización de Tours y Coach Marks

**Contexto:**
Los tours guiados actuales pierden alineación cuando el usuario hace scroll o cambia el tamaño de la ventana. El cálculo de posiciones en `CoachMarks.tsx` mezcla coordenadas absolutas del documento con capas posicionadas como `fixed`, provocando que la tarjeta y el resaltado se desplacen respecto al elemento objetivo.

**Objetivo:**
Recalibrar el sistema de tours para que las tarjetas y resaltados permanezcan anclados al elemento objetivo sin importar el scroll, el zoom o los cambios de viewport.

**Instrucciones:**

1. Revisar `frontend/components/shared/CoachMarks.tsx` y actualizar `calculatePositions` para usar únicamente las coordenadas de `getBoundingClientRect()` cuando se renderiza con `position: fixed`; elimina los ajustes con `window.scrollY`/`window.scrollX` y, si se requiere desplazamiento, usar `position: absolute` dentro de un contenedor sincronizado con `document.body`.
2. Ajustar el cálculo de `highlightPosition` para que aplique `top/left` basados en viewport o, alternativamente, migrar a transformaciones `translate3d` sobre un wrapper `fixed` evitando sumar desplazamientos manuales.
3. Añadir un `ResizeObserver` y listener de `scroll` que disparen `calculatePositions` a través de `requestAnimationFrame` para suavizar los recálculos y prevenir jitter.
4. Antes de mostrar cada paso, invocar `targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' })` cuando el elemento esté fuera del viewport para garantizar que sea visible y el resaltado no quede fuera de pantalla.
5. Validar que los estilos Tailwind aplicados al highlight mantengan `pointer-events: none`, borde redondeado configurable y una transición suave (`transition-transform duration-200`) acorde al nuevo sistema de posicionamiento.

**Criterios de Éxito:**
- ✅ El resaltado y la tarjeta del tour permanecen alineados mientras se hace scroll vertical u horizontal.
- ✅ No se observan saltos bruscos ni re-cálculos excesivos en consola al redimensionar la ventana.
- ✅ Los pasos avanzan únicamente cuando el elemento objetivo está visible y correctamente resaltado.

**Testing Manual:**
1. Ejecutar tours en los módulos de Archivadores, Documentos y Flujos de Firma; durante cada paso realizar scroll y verificar que el highlight siga al elemento objetivo.
2. Reducir y maximizar el viewport (desktop/laptop y pantalla dividida) confirmando que la tarjeta se reposiciona sin salir del viewport.
3. Probar con contenido dinámico (tablas con paginación y filtros) para asegurar que el recalculo mantiene la alineación tras cambios en el DOM.

**Siguiente Paso:**
PROMPT CORRECCION-2 para reforzar la consistencia de selectores y layouts en los tours.

---

### PROMPT CORRECCION-2: Consistencia de Selectores y Layouts para Tours

**Contexto:**
Tras estabilizar el posicionamiento, es necesario asegurar que cada paso de los tours apunte a elementos presentes y estáticos, especialmente en pantallas con datos cargados de forma diferida o componentes con render condicional.

**Objetivo:**
Garantizar que todos los `data-tour` definidos en `frontend/lib/tours.ts` tengan anclajes confiables, con contenedores visibles y dimensiones estables antes de iniciar cada paso.

**Instrucciones:**

1. Inventariar todos los selectores `data-tour` en `frontend` (componentes, layouts y tablas) y documentar dónde se renderizan; identificar los que aparecen tras llamados a APIs o condicionales.
2. En componentes con contenido asincrónico (`skeletons`, listas paginadas, modales), envolver los targets del tour en contenedores con `position: relative` y altura mínima para evitar que el highlight quede fuera de lugar mientras llegan los datos.
3. Centralizar la generación de atributos `data-tour` críticos en componentes base (por ejemplo, botones de creación, cards de métricas) para evitar duplicados o inconsistencias al refactorizar vistas.
4. Extender `OnboardingProvider` para que verifique la presencia del selector antes de avanzar de paso; si el target no está disponible tras varios intentos, mostrar un mensaje contextual y ofrecer repetir el paso.
5. Actualizar `frontend/lib/tours.ts` cuando sea necesario para incluir `placement` y `highlightPadding` coherentes con la nueva estructura, manteniendo los nombres de pasos y descripciones existentes.

**Criterios de Éxito:**
- ✅ Todos los pasos de los tours encuentran su selector objetivo sin errores en consola.
- ✅ Los elementos resaltados mantienen dimensiones estables aunque aún no se carguen los datos completos.
- ✅ Repetir el tour en diferentes módulos produce los mismos resultados y no depende del orden de interacción del usuario.

**Testing Manual:**
1. Desplegar cada tour desde el centro de ayuda simulando escenarios con datos vacíos, carga lenta y paginación; comprobar que los targets siempre existen.
2. Cambiar entre rutas rápidamente durante un tour activo y asegurar que el proveedor cancela o reintenta el paso según la disponibilidad del selector.
3. Revisar la consola del navegador para confirmar que no se registran advertencias de “target not found”.

**Siguiente Paso:**
PROMPT 030 para la preparación para producción y despliegue.

---

### PROMPT CORRECCION-3: Orquestación de Métricas y Resumen Operativo del Dashboard

**Contexto:**
El dashboard actual solo muestra accesos rápidos estáticos. Necesitamos proveer datos operativos actualizados que resuman el estado del archivo digital, firmas y actividad reciente, aprovechando la infraestructura de `analytics.service.ts`, `documents.service.ts` y los contadores expuestos en `/api/health`.

**Objetivo:**
Diseñar un backend cohesivo que entregue, en una única respuesta optimizada, los indicadores esenciales para el dashboard, incluyendo estadísticas de documentos, flujos de firma, carga operativa por oficinas y actividad reciente, manteniendo tiempos de respuesta bajos y siguiendo las políticas de auditoría.

**Instrucciones:**

1. **Consolidar servicio de métricas (backend/src/services/analytics.service.ts):**
   - Añadir función `getDashboardSnapshot(userId, role)` que agrupe:
     * KPIs generales (totales de documentos, archivadores, expedientes, firmas completas/parciales) filtrados por rol si corresponde.
     * Tendencias de los últimos 90 días (documentos creados por semana, firmas completadas), retornando series listas para gráficos.
     * Distribución por oficinas y tipos documentales (top 5 + “otros” agrupado).
     * Alertas operativas: documentos con OCR pendiente, firmas vencidas, archivadores con ocupación > 85%.
   - Implementar caching en memoria (por ejemplo `dashboardCache`) con TTL 60s por combinación de rol y filtros; invalidar cuando se registren cambios relevantes en `documents.service`, `signature-flow.service` y `archivadores.service` utilizando eventos o hooks existentes.

2. **Extender controladores y rutas:**
   - Crear endpoint `GET /api/analytics/dashboard` en `analytics.controller.ts` y `analytics.routes.ts` que invoque la nueva función.
   - Aceptar query optional `range` (`7d`, `30d`, `90d`) y `officeId`; validar parámetros y pasar filtros al servicio.
   - Asegurar middleware `authenticate` y `authorize` (Administradores y Operadores acceden a todo; Consultores reciben datos filtrados a permisos de lectura).

3. **Integrar seguridad y auditoría:**
   - Registrar llamadas al snapshot en `audit.service.log` con acción `DASHBOARD_VIEW` diferenciando origen (web) y filtros aplicados.
   - Añadir rate limiting suave (30 solicitudes por minuto por usuario) en `analytics.routes.ts` para evitar abuso.

4. **Optimizar consultas Prisma:**
   - Reusar proyecciones mediante `select` específicos; evitar `include` pesados.
   - Crear índices faltantes en `schema.prisma` si se detectan scans repetitivos (ej. `signatureStatus`, `ocrStatus`, `officeId` en Document).
   - Incorporar cálculos agregados mediante `groupBy` y `count` en lugar de postprocesar arreglos grandes en memoria.

5. **Preparar fixtures de validación:**
   - Generar script temporal en `backend/scripts/seed-dashboard-demo.ts` que cargue datos de ejemplo (documentos con diferentes estados, firmas, archivadores llenos) para validar los resultados de la nueva API.
   - Documentar en comentarios del script cómo revertir los datos demo.

**Criterios de Éxito:**
- ✅ `GET /api/analytics/dashboard` responde < 300 ms con datos cacheados y < 800 ms en primer cálculo.
- ✅ El payload incluye `cards`, `trends`, `distributions`, `alerts` y `recentActivity` con estructuras claras y campos tipados.
- ✅ Usuarios con rol Consultor reciben solo indicadores permitidos (sin acciones de firma ni totales fuera de su alcance).
- ✅ Las llamadas se registran en auditoría y respetan el rate limit establecido.
- ✅ Las consultas Prisma se ejecutan sin generar advertencias de rendimiento en logs.

**Testing Manual:**
1. Consumir el endpoint con Postman/Thunder Client usando filtros distintos (`range=7d`, `officeId=<uuid>`), verificando datos consistentes con la base.
2. Revisar la tabla `audit_log` para confirmar el registro de vistas.
3. Ejecutar el script demo, llamar al endpoint y validar la presencia de alertas (OCR pendiente, ocupación alta).
4. Simular más de 30 solicitudes/minuto para confirmar el rate limit (respuesta 429 con mensaje claro).

**Siguiente Paso:**
PROMPT CORRECCION-4 para implementar la experiencia visual y funcional del dashboard en el frontend.

---

### PROMPT CORRECCION-4: Rediseño Minimalista y Funcional del Dashboard (Frontend)

**Contexto:**
Con la nueva API de métricas disponible, el dashboard debe evolucionar de enlaces estáticos a una vista ejecutiva, clara y moderna que comunique el estado del sistema. Debe alinearse con la identidad visual vigente (fondos claros, acentos en azul DISA) y ser accesible en diferentes dispositivos.

**Objetivo:**
Construir una interfaz de dashboard modular en `frontend/app/dashboard/page.tsx` que consuma el snapshot del backend, presente indicadores clave, gráficos simples y listados accionables, manteniendo un diseño minimalista, sin fondos negros, y con contrastes AA.

**Instrucciones:**

1. **Arquitectura de datos y estado:**
   - Crear hook `useDashboardMetrics` en `frontend/hooks/useDashboardMetrics.ts` que gestione carga, errores, filtros (`range`, `office`) y caches locales (React Query o Zustand slice ligera).
   - Integrar skeletons (`components/shared/SkeletonCard.tsx`) para cards, gráficos y listados mientras la data llega.
   - Conectar con el store de configuración (`useConfigurationStore`) para aplicar colores dinámicos (primario/secundario) en gráficos y badges.

2. **Rediseño de layout principal:**
   - Actualizar `page.tsx` para estructurar el contenido en tres secciones:
     * **Encabezado Contextual:** saludo personalizado, fecha actual, selector de rango (7, 30, 90 días) y filtro de oficina (combobox minimalista) alineados horizontalmente en pantallas grandes y apilados en móviles.
     * **Indicadores Clave:** cuadrícula responsiva de 4 cards (`cards` del snapshot) con métricas primarias, iconos sutiles y tendencia (+/-%) utilizando clases claras (`bg-white`, `border`, `shadow-sm`).
     * **Zona Analítica:** dos columnas (`md:grid-cols-2`) con gráficos simples: línea/área para tendencia de documentos (`trends.documents`), donut para estados de firma (`distributions.signatures`), tabla compacta para “Actividades Recientes” y listado de alertas con badges coloreados.

3. **Componentes reutilizables:**
   - Crear carpeta `frontend/components/dashboard/` con componentes: `KpiCard`, `TrendChart`, `SignatureDonut`, `AlertsPanel`, `RecentActivityList`.
   - Utilizar componentes de shadcn/ui (Card, Badge, Tabs) y librería de gráficos ligera ya presente (verificar `@/components/reports` para reutilizar wrappers con `recharts` o `nivo`). No introducir dependencias nuevas sin confirmarlo.
   - Garantizar que cada componente acepte props tipadas derivadas de la respuesta del backend.

4. **Accesibilidad y estilo:**
   - Mantener fondo general `bg-slate-50` y cards `bg-white`; evitar negros puros. Asegurar contraste mínimo 4.5:1 en texto principal.
   - Añadir soporte para teclado (tabindex coherente en filtros, botones).
   - Usar tipografía consistente (`text-slate-900` para títulos, `text-slate-600` para descripciones) y espaciado `space-y-6` para secciones.

5. **Interacción y resiliencia:**
   - Implementar manejo de errores con un estado `EmptyState` que muestre botón “Reintentar” y contacto de soporte si la API falla.
   - Añadir refresco manual (botón “Actualizar”) que invalide el cache y muestre toast de confirmación.
   - Registrar evento de vista en `frontend/lib/analytics.ts` (si existe) o crear función que envíe `POST /api/audit/dashboard-view` cuando se renderice la página por primera vez.

6. **Pruebas de visualización:**
   - Verificar que el diseño responda en breakpoints 360px, 768px, 1280px sin overflow ni scroll horizontal.
   - Chequear que los filtros persistan al navegar (guardar preferencia de rango en `localStorage` bajo `dashboard_range`).

**Criterios de Éxito:**
- ✅ Dashboard muestra KPIs, gráficos y listados alimentados por la nueva API.
- ✅ El diseño mantiene fondos claros, contraste adecuado y se siente coherente con el resto del sistema.
- ✅ Skeletons y estados vacíos cubren latencia y falta de datos sin romper la experiencia.
- ✅ Filtros funcionan y se reflejan en la data mostrada.
- ✅ Eventos de auditoría/reportes se disparan al cargar la vista.

**Testing Manual:**
1. Cargar `/dashboard` y verificar transiciones de estados (loading → datos) y toasts de actualización.
2. Cambiar rangos y oficinas comprobando que los gráficos y cards se actualizan según la respuesta API.
3. Revisar que las alertas sean claras y accionables (enlaces a módulos relevantes) y que desaparezcan cuando el backend las elimina.
4. Ejecutar Lighthouse/axe para asegurar contraste y accesibilidad AA.

**Siguiente Paso:**
Tras completar el rediseño, continuar con los planes de despliegue descritos en PROMPT 030.

---

### PROMPT CORRECCION-5: Evolución Visual y Jerárquica del Navbar Principal

**Contexto:**
El componente `frontend/components/layout/Navbar.tsx` se encarga de la navegación superior, pero necesita un tratamiento visual más profesional que mantenga la identidad del sistema y brinde claridad en la jerarquía de acciones (branding, navegación secundaria, usuario). El rediseño del dashboard exige alinear los patrones visuales con un enfoque minimalista, contrastes controlados y adaptabilidad responsive.

**Objetivo:**
Actualizar el Navbar para que comunique la marca, ofrezca accesos rápidos ordenados y entregue controles de usuario de forma clara, siguiendo principios minimalistas y asegurando accesibilidad AA.

**Instrucciones:**

1. **Arquitectura y contenido:**
   - Revisar `Navbar.tsx` para segmentar tres zonas: branding (logo + nombre del sistema), navegación secundaria (botones contextuales, buscador opcional) y área de usuario (notificaciones, perfil, logout).
   - Incorporar componente `CommandMenu` ya existente si aplica; en caso contrario, preparar espacio para un buscador contextual con icono de lupa y atajo de teclado (`Ctrl+K`).

2. **Estilo visual:**
   - Reemplazar fondos sólidos oscuros con `bg-white/95` y borde inferior (`border-b border-slate-200`) usando `backdrop-blur` para efecto glass ligero.
   - Usar layout flex con `max-w-7xl mx-auto px-4` para alinear contenido y mantener respiración visual.
   - Ajustar tipografía (`text-slate-900` para títulos, `text-slate-500` para descripciones) y aplicar acentos con el color primario configurable (`config.primaryColor`).

3. **Componentización y accesibilidad:**
   - Extraer `UserDropdown` y `NotificationsDropdown` como componentes internos reutilizables con soporte para teclado (tabindex, `aria-expanded`, `aria-haspopup`).
   - Asegurar que el botón hamburguesa en móviles tenga `aria-label` y se integre con el estado de Sidebar (`onMenuClick`).
   - Añadir indicador de sesión (`pill` con rol) y estado (`Activo/Inactivo`) en el menú de usuario, respetando privacidad (no mostrar correo completo en pantallas pequeñas).

4. **Responsividad:**
   - Implementar grid/flex adaptativo: en `md` y superiores mostrar todo en una línea; en móviles apilar branding y acciones con `space-y-3`.
   - Ocultar navegación secundaria en móviles tras un botón “Más” o integrarla en el drawer lateral.

5. **Interacciones y feedback:**
   - Agregar animaciones sutiles (`transition-all duration-200`) en hover/foco.
   - Integrar `toast` o indicador visual al cambiar de tema/configuración (si existe).

**Criterios de Éxito:**
- ✅ Navbar mantiene estructura clara (marca, acciones, usuario) con estilo minimalista.
- ✅ Cumple contraste AA y es completamente navegable con teclado.
- ✅ Responde correctamente en breakpoints móviles/desktop sin solapamientos.
- ✅ Se integra con configuraciones dinámicas de color y branding.

**Testing Manual:**
1. Visualizar el Navbar en dispositivos 360px, 768px, 1280px comprobando que los elementos se reacomodan correctamente.
2. Navegar con teclado y lector de pantalla para verificar etiquetas ARIA.
3. Cambiar la configuración de branding (colores/logo) desde `configurationStore` y asegurar que el Navbar se actualiza sin recargar.

**Siguiente Paso:**
PROMPT CORRECCION-6 para modernizar el Sidebar con modo compacto deslizable.

---

### PROMPT CORRECCION-6: Sidebar Compacto con Animación Deslizante y Estado Persistente

**Contexto:**
El `Sidebar.tsx` actual muestra un menú vertical completo que puede volverse pesado en pantallas reducidas. Se requiere una experiencia moderna que permita contraer el menú, mostrar únicamente iconos, ofrecer animaciones fluidas y mantener la consistencia visual con el nuevo Navbar.

**Objetivo:**
Rediseñar el Sidebar para que sea compacto, animado y responsivo, con un comportamiento que alterne entre modo expandido y colapsado, evitando fondos oscuros y garantizando usabilidad en escritorio y móvil.

**Instrucciones:**

1. **Estados y almacenamiento:**
   - Implementar estado `isCollapsed` en el Sidebar, con persistencia en `localStorage` bajo la clave `sidebar_collapsed` para mantener la preferencia del usuario.
   - Asegurar sincronización con `DashboardLayout` para que el botón del Navbar pueda alternar entre los modos.

2. **Diseño visual y estructura:**
   - Uso de `bg-white` con `border-r border-slate-200`, sombras sutiles y padding consistente (`px-3 py-6`).
   - En modo expandido mostrar icono + etiqueta + badge; en modo colapsado, centrar iconos dentro de un contenedor de 56px y mostrar tooltip (`components/shared/Tooltip.tsx`) al pasar el cursor.
   - Mantener agrupaciones por secciones (`Principal`, `Archivo Digital`, etc.) con encabezados en mayúsculas `text-slate-400` y separadores (`divider` ligero).

3. **Animaciones y transiciones:**
   - Aplicar `transition-[width] duration-200 ease-in-out` al contenedor del sidebar.
   - Para los ítems, usar `transition-all` y `overflow-hidden` para que las etiquetas se plieguen sin saltos.
   - En móviles, conservar el drawer existente pero mejorar la animación de entrada/salida con `translate-x` y `opacity` combinados via Tailwind (`data-[state=open]` clases).

4. **Interacción y accesibilidad:**
   - Añadir botón fijo en la parte inferior del Sidebar para alternar modo (`Collapse/Expand`) con icono (`ChevronLeft`/`ChevronRight`),  `aria-pressed` y tooltip.
   - Asegurar que en modo colapsado los tooltips sean accesibles y que los elementos con rol `button` mantengan foco visible (`focus:ring` acorde a color primario).
   - Integrar indicador de ruta activa con borde lateral en color primario y fondo `bg-primary/10`.

5. **Integración con datos dinámicos:**
   - Conectar con `useConfigurationStore` para aplicar colores personalizados en highlights.
   - Mantener la lógica de filtrado por rol (`user.roleName`) y mostrar badges con contadores cuando se disponga de datos (ej. pendientes) usando `Badge` minimalista.

6. **Testing y resiliencia:**
   - Verificar que el ancho del contenido principal (`main`) se ajuste según el estado del Sidebar para evitar saltos.
   - Garantizar que la colapsación no rompa los tours (`data-tour`), actualizando selectores si es necesario.

**Criterios de Éxito:**
- ✅ Sidebar alterna entre modo completo y compacto con animaciones fluidas.
- ✅ Preferencia del usuario persiste entre sesiones y dispositivos.
- ✅ Ítems conservan accesibilidad, tooltips e indicadores de selección coherentes.
- ✅ Diseño mantiene paleta clara y armoniza con el Navbar.

**Testing Manual:**
1. Alternar varias veces el modo colapsado/expandido verificando persistencia tras recargar la página.
2. Evaluar la experiencia en pantallas pequeñas activando el drawer móvil y comprobando la nueva animación.
3. Usar el teclado para navegar por los ítems en ambos modos y observar la visibilidad de los tooltips e indicadores.

**Siguiente Paso:**
Revisar los tours y el dashboard tras los cambios para asegurar coherencia con PROMPT CORRECCION-4 y CORRECCION-2.

---

## 🎯 FASE 7: DESPLIEGUE Y CAPACITACIÓN

---

### PROMPT 030: Preparación para Producción y Despliegue

**Contexto:**
El sistema ha sido completamente testeado y optimizado. Ahora nos enfocaremos en preparar el entorno de producción y desplegar la aplicación, asegurando un funcionamiento estable y seguro.

**Objetivo:**
Configurar el servidor de producción, realizar el build final de la aplicación, desplegar el backend y el frontend, y configurar los servicios necesarios para un entorno productivo.

**Instrucciones:**

1. **Configuración del Servidor de Producción (Instrucciones para SysAdmin/DevOps):**
   
   - **Sistema Operativo:** Ubuntu Server 22.04 LTS (recomendado).
   - **Instalar Node.js:** Usar `nvm` o el gestor de paquetes para instalar la versión de Node.js utilizada en desarrollo.
   - **Instalar MySQL Server:** Configurar MySQL 8.0 y crear la base de datos `archivo_digital_disa_prod`.
   - **Instalar Nginx:** Configurar Nginx como proxy inverso para el backend y para servir los archivos estáticos del frontend.
     * Redirigir HTTP a HTTPS.
     * Configurar certificados SSL/TLS (Let's Encrypt o similar).
   - **Instalar PM2:** Para gestionar los procesos de Node.js (mantener el backend corriendo, reinicios automáticos).
   - **Configurar Firewall:** Abrir solo los puertos necesarios (80, 443, 3306 - solo para acceso interno).

2. **Preparación del Backend para Producción:**
   
   - **Variables de Entorno:** Crear un archivo `.env` en el servidor de producción con las variables de entorno para producción:
     * `NODE_ENV=production`
     * `PORT=5000` (o el puerto que escuchará Express directamente, Nginx lo expondrá en 80/443)
     * `DATABASE_URL=mysql://user:password@localhost:3306/archivo_digital_disa_prod`
     * `JWT_SECRET=your-strong-production-secret-key` (generar una nueva y fuerte)
     * `FIRMA_PERU_API_URL=http://[IP_SERVIDOR_VALIDADOR_PROD]:8080/validador/api`
     * `FIRMA_PERU_CREDENTIAL=your-production-credential`
     * Configurar credenciales de email para notificaciones.
   - **Build de Producción:** Ejecutar `npm run build` en el directorio `backend` para compilar el código TypeScript a JavaScript.
   - **Migraciones:** Ejecutar `npx prisma migrate deploy` en el servidor de producción para aplicar las migraciones a la base de datos de producción.
   - **Seeders:** Ejecutar los seeders para cargar datos iniciales (roles, admin user) en producción si es necesario.

3. **Preparación del Frontend para Producción:**
   
   - **Variables de Entorno:** Crear un archivo `.env.production` o similar con las variables de entorno para producción:
     * `NEXT_PUBLIC_API_URL=https://your-domain.com/api` (la URL pública del backend a través de Nginx)
   - **Build de Producción:** Ejecutar `npm run build` en el directorio `frontend` para generar los archivos estáticos optimizados.

4. **Despliegue del Backend:**
   
   - Copiar la carpeta `dist` y `node_modules` (o instalar dependencias de producción) al servidor.
   - Usar PM2 para iniciar el servidor Node.js:
     ```bash
     pm2 start dist/server.js --name 
     ```

### PROMPT 031: Auditoría Frontend por Módulos para Manual de Usuario

**Contexto:** Antes de redactar el manual de usuario se requiere comprender a profundidad el funcionamiento del frontend, desglosando cada módulo, flujo y dependencia para asegurar que la documentación represente fielmente al sistema.

**Objetivo:** Analizar el código fuente del frontend módulo por módulo, mapear rutas, componentes, estados y servicios asociados, y generar una visión integral que sirva de base para la redacción del manual.

**Instrucciones:**

1. Clonar o actualizar el repositorio local del frontend y asegurarte de tener las dependencias instaladas (`npm install`).
2. Recorrer la estructura del App Router (`app/`), identificando páginas, layouts, providers y middlewares, documentando cómo se enlazan.
3. Para cada módulo funcional (ej. autenticación, dashboard, gestión de documentos, flujos de firma, auditoría), inspeccionar componentes, hooks, stores de Zustand, formularios y validaciones Zod, registrando su propósito y las interacciones clave.
4. Analizar las llamadas a servicios (`@/lib/api`, `@/services`) y anotar qué endpoints del backend consumen, qué parámetros requieren y qué respuestas esperan.
5. Elaborar una matriz que incluya: nombre del módulo, ruta o componente principal, dependencias internas/externas, estados globales/locales, flujos de usuario vinculados y consideraciones de accesibilidad.
6. Detectar puntos críticos (ej. permisos, cargas de archivos, renderizados condicionales) que deban destacarse posteriormente en el manual.
7. Resumir hallazgos en un informe conciso, listo para usarse en el diseño del manual.

**Entregables:**

- Informe de análisis por módulo en formato Markdown (`analisis-frontend.md`).
- Tabla de dependencia de rutas y componentes (puede ser Markdown o CSV).
- Lista de flujos de usuario identificados con referencia a los módulos involucrados.

**Criterios de Éxito:**

- Todos los módulos y submódulos del frontend quedan documentados con su propósito y relaciones.
- Se identifican claramente los flujos críticos que deberán ser explicados a los usuarios finales.
- El informe sirve como referencia directa para estructurar el manual, sin ambigüedades ni lagunas.

---

### PROMPT 032: Arquitectura del Manual de Usuario y Plan de Capturas

**Contexto:** Con el análisis técnico completo, es necesario transformar la información en una estructura pedagógica, estableciendo el índice, los recorridos de usuario y la planificación de recursos visuales.

**Objetivo:** Diseñar la arquitectura del manual de usuario, definir secciones, subsecciones, flujos paso a paso y planificar las capturas de pantalla que acompañarán la documentación.

**Instrucciones:**

1. Revisar el informe de análisis (PROMPT 031) y agrupar los módulos en secciones lógicas orientadas al usuario (configuración inicial, navegación, gestión documental, firmas, reportes, soporte).
2. Definir el perfil de usuario final (roles, nivel técnico, necesidades) y ajustar el tono y profundidad de la guía en consecuencia.
3. Elaborar un índice jerárquico del manual que incluya introducción, requisitos previos, flujo de inicio de sesión, recorrido del dashboard, procedimientos principales (crear documento, firmar, versionar, auditar) y anexos.
4. Para cada flujo, enumerar los pasos cronológicos, destacando prerequisitos, interacciones con el backend y alertas importantes.
5. Construir un plan de capturas de pantalla detallado indicando: pantalla/módulo, estado a capturar, elementos que deben resaltarse, leyenda sugerida y formato recomendado. Incluir también capturas de casos de error o mensajes de confirmación relevantes.
6. Identificar elementos multimedia complementarios (diagramas simples, tablas de permisos) que faciliten la comprensión de conceptos complejos.
7. Validar que la estructura cubre todas las funcionalidades y que sigue un orden natural para un usuario sin conocimientos técnicos.

**Entregables:**

- Documento `estructura-manual-usuario.md` con índice detallado, descripción de secciones y flujos.
- Plan de capturas en formato tabla (Markdown, CSV o Excel) con instrucciones claras para cada captura.
- Lista de materiales complementarios a producir (diagramas, tablas, glosario, FAQ).

**Criterios de Éxito:**

- El índice permite redactar el manual de forma secuencial y coherente.
- Las capturas planificadas cubren cada interacción relevante, incluyendo estados vacíos, confirmaciones y errores.
- El plan es comprensible para cualquier colaborador que deba generar las capturas o aportar contenido adicional.

---

### PROMPT 033: Redacción y Maquetación del Manual de Usuario

**Contexto:** Con la estructura definida, se procede a redactar el manual, asegurando un lenguaje claro, inclusivo y profesional, acompañado de recursos visuales y formatos listos para distribución.

**Objetivo:** Redactar el manual de usuario completo en formatos Markdown y DOCX con diseño profesional, incorporando instrucciones paso a paso, glosarios y referencias a capturas de pantalla guiadas.

**Instrucciones:**

1. Seguir el índice aprobado (PROMPT 032) y redactar cada sección en español neutral, evitando tecnicismos innecesarios y explicando el contexto de cada acción.
2. Incluir procedimientos detallados con pasos numerados, notas de precaución, consejos y soluciones a problemas frecuentes.
3. Insertar marcadores para capturas de pantalla pendientes (`![Pendiente: Nombre de la captura](ruta_por_definir)`) acompañados de instrucciones específicas sobre qué debe verse y qué resaltar.
4. Elaborar versiones paralelas en Markdown (`manual-usuario.md`) y DOCX (`manual-usuario.docx`). En la versión DOCX aplicar estilos consistentes (portada, encabezados, pies de página con logotipo, tabla de contenido automática, tipografía legible, esquema de colores corporativo).
5. Añadir un glosario de términos, sección de preguntas frecuentes, tabla de atajos si aplica y un apartado de soporte con canales de contacto.
6. Garantizar que todas las referencias a funcionalidades están alineadas con el comportamiento real del sistema y enlazar, cuando sea pertinente, a recursos externos (ej. normativa de firma digital).
7. Realizar una auto-revisión ortográfica y de consistencia antes de preparar los entregables.

**Entregables:**

- `manual-usuario.md` listo para versionar en el repositorio.
- `manual-usuario.docx` con diseño profesional y tabla de contenido automática.
- Carpeta `recursos-manual/` con marcadores y descripciones de las capturas pendientes.

**Criterios de Éxito:**

- El manual guía a un usuario sin conocimientos técnicos desde el acceso hasta las operaciones avanzadas.
- Los dos formatos mantienen consistencia en contenido y estilo.
- Las instrucciones para capturas permiten a cualquier persona completarlas sin ambigüedades.

---

### PROMPT 034: Validación, Control de Calidad y Preparación de Entrega del Manual

**Contexto:** Tras la redacción, se debe asegurar la exactitud técnica, la claridad comunicacional y la correcta preparación de los archivos finales para distribución.

**Objetivo:** Validar el manual de usuario, aplicar mejoras derivadas de pruebas con usuarios internos y preparar el paquete final de entrega.

**Instrucciones:**

1. Revisar el manual ejecutando cada procedimiento directamente en el sistema productivo o staging, confirmando que los pasos y capturas coinciden con la interfaz actual.
2. Solicitar revisión cruzada a un miembro del equipo funcional y a un usuario final representativo, recopilando observaciones y dudas.
3. Ajustar el contenido según el feedback recibido, manteniendo registro de cambios y asegurando que las actualizaciones se reflejen en ambos formatos (MD y DOCX).
4. Verificar accesibilidad del contenido: contraste adecuado en DOCX, texto alternativo para capturas, lenguaje inclusivo y lectura fluida.
5. Generar una checklist de verificación (ortografía, enlaces, consistencia de términos, numeración de pasos) y marcar cada ítem.
6. Preparar el paquete final de entrega que incluya: manual en ambos formatos, carpeta de capturas definitivas, checklist cumplimentada y registro de versiones.
7. Publicar el manual en el repositorio o portal de documentación correspondiente y comunicar su disponibilidad a los stakeholders.

**Entregables:**

- Informe de control de calidad con hallazgos y acciones realizadas.
- Manual final (`manual-usuario.md` y `manual-usuario.docx`) actualizado y aprobado.
- Checklist de verificación completada y carpeta de capturas finales etiquetadas.

**Criterios de Éxito:**

- El manual es validado por equipo técnico y usuarios finales sin observaciones críticas.
- Todos los archivos se entregan ordenados, versionados y listos para distribución.
- La guía queda accesible y comunicada a los responsables de capacitación y soporte.

---

### PROMPT 035: Diseño Estratégico del Módulo de Copias de Seguridad Inteligente

**Contexto:** Con la plataforma operativa (Express + Prisma en backend, Next.js + Zustand en frontend) y los documentos almacenados en `uploads/documents`, se necesita un módulo de seguridad que permita copias de seguridad incrementales, evite duplicidad de PDFs y sincronice metadatos con la base MySQL.

**Objetivo:** Definir la arquitectura integral del módulo de copias de seguridad inteligente, estableciendo modelos de datos, flujos, responsabilidades de servicios y políticas de operación que garanticen resiliencia y eficiencia.

**Instrucciones:**

1. Auditar los dominios existentes (documentos, versiones, firmas, auditoría, configuraciones) identificando tablas y carpetas que deben incluirse en cada respaldo, así como dependencias entre registros.
2. Diseñar nuevas entidades Prisma para `BackupJob`, `BackupItem`, `BackupManifest` y `BackupSettings`, contemplando campos para hash SHA-256 de archivos, huellas de registros (timestamps, IDs) y el sello `lastBackupAt` global.
3. Definir la estrategia incremental: comparar hashes y fechas de actualización para incluir solo documentos y registros nuevos o modificados desde el último respaldo exitoso.
4. Establecer una ruta recomendada en entorno Windows (`C:\SAD\backups`) y parámetros configurables (retención, compresión, encriptación opcional) guardados en `BackupSettings`.
5. Planificar el contenido del manifiesto: listado de tablas exportadas, mapeo documento→archivo, logs de exclusiones y métricas de tamaños.
6. Elaborar diagramas de secuencia para los flujos “Generar copia” y “Restaurar”, incluyendo validaciones de permisos, colas (`queueService`), auditoría (`audit.service`) y notificaciones.
7. Redactar un plan de riesgos y mitigaciones (fallos de E/S, espacio insuficiente, interrupciones) con estrategias de reintento y checkpoints.

**Criterios de Éxito:**

- Documento de arquitectura aprobado que especifica modelos Prisma, estructura de manifiestos, procesos incrementales y planes de contingencia.
- Ruta local y parámetros configurables definidos con valores por defecto y justificación.
- Flujos de backup/restauración descritos con responsabilidades claras para servicios, colas y auditoría.

**Siguiente Paso:** Ejecutar PROMPT 036 para implementar el backend del motor de copias de seguridad.

---

### PROMPT 036: Implementación Backend del Motor de Copias de Seguridad Incremental

**Contexto:** Con la arquitectura aprobada, corresponde desarrollar en Express + Prisma el servicio que genera copias incrementales, gestiona manifiestos y evita duplicados gracias a hashes y control de versiones.

**Objetivo:** Implementar servicios, controladores y rutas REST para crear respaldos incrementales firmes, registrar cada elemento respaldado y entregar los paquetes comprimidos al cliente de forma segura.

**Instrucciones:**

1. Crear en `src/services/security-backup.service.ts` funciones para:
   - Preparar lotes de registros nuevos/modificados desde el último `BackupJob` exitoso.
   - Calcular hash SHA-256 de cada PDF/versión antes de exportarla y descartarla si ya existe en el manifiesto previo.
   - Generar un paquete comprimido (ZIP) con subcarpetas `database/` (dump SQL o JSONL) y `documents/` (PDFs nuevos) junto al `manifest.json`.
2. Persistir cada ejecución en Prisma: `BackupJob` con estado (PENDING, RUNNING, COMPLETED, FAILED), tamaño total, contador de registros y campo `createdBy` para trazabilidad.
3. Registrar en `BackupItem` cada tabla o archivo respaldado indicando hash, `sourceId`, tipo (DB_RECORD, PDF_FILE) y referencia al paquete.
4. Incorporar endpoints en `src/routes/security.routes.ts`: `POST /api/security/backups` (dispara respaldo), `GET /api/security/backups` (lista historial), `GET /api/security/backups/:id/download` (descarga paquete) y `GET /api/security/backups/summary` (última fecha y conteo de cambios pendientes).
5. Integrar con `audit.service.log` y `notifications.service` para enviar alertas cuando un respaldo termina o falla, incluyendo resumen de nuevos elementos.
6. Validar permisos mediante middleware RBAC (rol Administrador o permiso `security.backup.manage`). Registrar IP y user-agent en cada ejecución.
7. Implementar políticas de limpieza: conservar N paquetes recientes, eliminar temporales y cerrar manejadores de archivos tras la compresión.

**Criterios de Éxito:**

- Endpoints responden con 200/202 y devuelven información de progreso, últimos respaldos y descargas protegidas.
- Manifiestos incluyen hashes y metadatos sin duplicados, confirmando que solo se exportan elementos nuevos desde la última ejecución.
- Auditoría y notificaciones registran cada evento con usuario, hora y ruta local recomendada.

**Siguiente Paso:** Ejecutar PROMPT 037 para implementar restauración y validaciones de integridad en el backend.

---

### PROMPT 037: Implementación Backend de Restauración y Verificación de Integridad

**Contexto:** Los respaldos incrementales existen, pero se necesita un proceso de restauración que sincronice base de datos y PDF garantizando integridad, consistencia referencial y ausencia de duplicados.

**Objetivo:** Desarrollar servicios y endpoints para restaurar desde un paquete previamente descargado, verificando hashes, resolviendo conflictos y reanudando la operación del sistema en caso de desastre.

**Instrucciones:**

1. Crear en `security-backup.service.ts` funciones `validateBackupPackage`, `restoreDatabase`, `restoreDocuments` y `rebuildIndices`, cada una con manejo transaccional (Prisma) y logs detallados.
2. Al ingresar un paquete ZIP, validar firma del manifiesto, versión del esquema Prisma y hashes de cada archivo antes de iniciar la restauración.
3. Restaurar primero la base de datos (aplicar dump SQL o importar JSONL) en una transacción; reconciliar registros existentes comparando IDs y timestamps para evitar duplicados.
4. Restaurar PDF nuevos en `uploads/documents`, verificando si el hash ya existe; si existe, crear enlace simbólico o reusar archivo sin sobrescribir.
5. Registrar en `BackupRestoreLog` (nuevo modelo) cada operación con campos de origen, destino, duración, usuario y resultado.
6. Exponer endpoints `POST /api/security/backups/:id/restore` y `GET /api/security/restores` con historial, asegurando autorización estricta y confirmación de doble factor si está disponible.
7. Actualizar `BackupSettings.lastBackupAt` y el contador de elementos pendientes tras una restauración completa exitosa, dejando el sistema listo para la siguiente copia incremental.

**Criterios de Éxito:**

- Restauraciones reproducen la base y archivos sin inconsistencias ni duplicados (hashes coinciden, conteos iguales a manifiesto).
- Logs detallan cada paso y permiten auditorías forenses en caso de incidentes.
- Al finalizar, el sistema refleja la fecha de última copia y el conteo de cambios vuelve a cero.

**Siguiente Paso:** Ejecutar PROMPT 038 para habilitar la interfaz frontend del módulo de copias de seguridad.

---

### PROMPT 038: Panel Frontend de Copias de Seguridad y Restauración

**Contexto:** El backend provee endpoints para respaldos y restauraciones. Es necesario exponer una experiencia en Next.js 15 que permita a administradores gestionar el módulo desde el dashboard.

**Objetivo:** Crear un panel en el frontend que informe la última copia, el número de elementos pendientes, sugiera la ruta local recomendada y permita disparar descargas/restauraciones con feedback en tiempo real.

**Instrucciones:**

1. Crear un nuevo submódulo en `app/dashboard/seguridad/copias` con layout protegido por permisos (`security.backup.manage`).
2. Construir hooks (`useBackups`, `useRestore`) en `hooks/` que consuman los endpoints del backend usando la librería API existente (`lib/api`).
3. Diseñar tarjetas informativas mostrando: fecha/hora de última copia, usuario responsable, ruta recomendada (`C:\\SAD\\backups`), tamaño total y conteo de nuevos datos detectados.
4. Implementar acciones: botón “Generar copia incremental” (con confirmación y barra de progreso), lista de paquetes descargables, filtro por estado y botón “Restaurar” que requiera confirmación adicional y muestre checklist de pasos.
5. Integrar toasts (sonner) y modales de shadcn/ui para feedback inmediato, manejando estados de `loading`, `success`, `error` y mensajes de advertencia ante duplicados detectados.
6. Añadir registro visual del historial (tabla con paginación) indicando duración, tamaño, cantidad de registros y resultado, con iconografía clara.
7. Documentar en la UI las recomendaciones operativas: verificar espacio en disco, mantener conexión estable y revisar logs antes de cerrar sesión.

**Criterios de Éxito:**

- Los administradores ven información en tiempo real de la última copia y de los datos pendientes sin consultar la base manualmente.
- Acciones de copia/restauración reflejan progreso y resultados, manteniendo la sesión estable y gestionando errores.
- La ruta local recomendada se muestra claramente y puede modificarse mediante la configuración cuando se requiera.

**Siguiente Paso:** Ejecutar PROMPT 039 para validar el módulo completo mediante pruebas y automatizaciones operativas.

---

### PROMPT 039: Validación Operativa y Automatización del Módulo de Copias de Seguridad

**Contexto:** Con backend y frontend implementados, es imprescindible validar la robustez del módulo, automatizar tareas recurrentes y preparar procedimientos operativos estándar.

**Objetivo:** Ejecutar pruebas integrales, configurar automatizaciones y formalizar guías de operación para asegurar que las copias y restauraciones funcionen de manera profesional y repetible.

**Instrucciones:**

1. Diseñar un set de pruebas extremo a extremo: generar documentos, ejecutar copia incremental, simular pérdida parcial y restaurar verificando datos y PDFs.
2. Configurar tareas programadas (cron, Windows Task Scheduler) que invoquen el endpoint de respaldo en horarios definidos, registrando resultados y alertando ante fallos.
3. Implementar monitoreo y alertas: integrar métricas en dashboard de administración (tiempo promedio, tamaño, fallos) y configurar notificaciones por email/Teams.
4. Elaborar procedimientos operativos estándar (runbooks) para: ejecución manual, verificación de espacio en `C:\\SAD\\backups`, restauración completa y respuesta ante errores.
5. Validar que los manifiestos permiten identificar exactamente desde qué fecha existen datos pendientes y que el frontend refleja esta información.
6. Realizar pruebas de estrés (volumen alto de PDFs) para garantizar que la deduplicación y la compresión mantienen tiempos aceptables.
7. Registrar hallazgos y ajustes necesarios en auditoría, planificando iteraciones futuras (encriptación, replicación externa, almacenamiento en la nube).

**Criterios de Éxito:**

- Pruebas reproducibles demuestran restauraciones exitosas sin datos faltantes o duplicados.
- Automatizaciones ejecutan respaldos según cronograma y alertan oportunamente ante incidentes.
- El equipo operativo dispone de guías claras para ejecutar, validar y recuperar el sistema ante contingencias.

**Siguiente Paso:** Iterar mejoras según hallazgos operativos o evolucionar hacia replicación externa y cifrado avanzado.

---