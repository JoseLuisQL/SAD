# Sistema Integrado de Archivos Digitales - Backend

API REST para el Sistema Integrado de Archivos Digitales de DISA CHINCHEROS.

## Stack Tecnológico

- **Runtime**: Node.js 18+ LTS
- **Lenguaje**: TypeScript 5+
- **Framework**: Express.js 4.18+
- **ORM**: Prisma
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT (JSON Web Tokens)

## Requisitos Previos

- Node.js 18+ LTS instalado
- MySQL 8.0 instalado y corriendo
- npm o yarn

## Instalación

1. Clonar el repositorio e ir a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus credenciales de base de datos y configuraciones.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila el proyecto TypeScript a JavaScript
- `npm start` - Inicia el servidor en modo producción
- `npm run prisma:generate` - Genera el cliente de Prisma
- `npm run prisma:migrate` - Ejecuta las migraciones de base de datos
- `npm run prisma:studio` - Abre Prisma Studio (GUI para la base de datos)

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuraciones (DB, JWT, etc.)
│   ├── controllers/    # Controladores de rutas
│   ├── middlewares/    # Middlewares personalizados
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades y helpers
│   ├── types/          # Tipos TypeScript personalizados
│   ├── prisma/         # Esquema y migraciones de Prisma
│   ├── app.ts          # Configuración de Express
│   └── server.ts       # Punto de entrada del servidor
├── uploads/            # Archivos subidos
│   └── documents/      # Documentos digitalizados
├── dist/               # Código compilado (generado)
└── node_modules/       # Dependencias (generado)
```

## Endpoints Disponibles

### Health Check
- `GET /api/health` - Verifica el estado del servidor

## Variables de Entorno

Ver archivo `.env.example` para la lista completa de variables requeridas.

## Desarrollo

Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

## Próximos Pasos

1. Configurar Prisma y migraciones de base de datos
2. Implementar módulos de autenticación
3. Implementar módulos de gestión de documentos
4. Configurar almacenamiento de archivos
