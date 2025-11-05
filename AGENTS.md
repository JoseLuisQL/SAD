# AGENTS.md - Sistema Integrado de Archivos Digitales (SAD)

## Build/Lint/Test Commands

### Backend (Express + TypeScript + Prisma)
- **Dev**: `cd backend && npm run dev` (runs on port 4000 with nodemon)
- **Build**: `cd backend && npm run build` (compiles TypeScript to dist/)
- **Typecheck**: `cd backend && npx tsc --noEmit`
- **Prisma**: `npm run prisma:generate` (after schema changes), `npm run prisma:migrate` (migrations), `npm run prisma:studio` (DB GUI)
- **Tests**: No formal test suite configured. Run ad-hoc test scripts with `ts-node test-*.ts` in backend root

### Frontend (Next.js 15 + TypeScript + React 19)
- **Dev**: `cd frontend && npm run dev` (runs on port 3000, uses Turbopack with dev:turbo)
- **Build**: `cd frontend && npm run build`
- **Lint**: `cd frontend && npm run lint` (ESLint)
- **Typecheck**: Implicitly checked during build; no standalone typecheck script configured

## Architecture

- **Backend**: Express REST API, Prisma ORM, MySQL database. Server: backend/src/server.ts, App config: backend/src/app.ts
- **Frontend**: Next.js App Router, Zustand for state management, shadcn/ui (Radix UI + Tailwind CSS), React Hook Form with Zod validation
- **Database**: MySQL 8.0, schema defined in backend/prisma/schema.prisma with versioning, audit logging, signature tracking
- **Key Features**: Document digitalization system with OCR (Tesseract.js), digital signatures (Firma Perú integration), version control, signature flows
- **File Storage**: Local filesystem in backend/uploads/documents/

## Code Style & Conventions

### Imports (Backend)
- Node/Express types: `import { Request, Response } from 'express';`
- Prisma: `import prisma from '../config/database';`
- Services: `import * as serviceNameService from '../services/serviceName.service';`
- Utils: Named imports from utils folder
- Always use relative imports with explicit extensions for TypeScript

### Imports (Frontend)
- Components: `import { Component } from '@/components/ui/component';` (uses @ alias for root)
- Hooks: `import { useHook } from '@/hooks/useHook';`
- API: `import { api } from '@/lib/api/module';`
- Types: `import { Type } from '@/types/module.types';`

### Naming Conventions
- Files: kebab-case for all files (document-types.service.ts, useDocuments.ts)
- Components: PascalCase (DocumentsTable.tsx)
- Services: camelCase exports with service suffix (documentsService.createDocument)
- Types: PascalCase interfaces/types, kebab-case file names with .types.ts suffix

### Error Handling
- Backend: Try-catch blocks, return status codes with descriptive messages, use Prisma error middleware
- Frontend: Toast notifications (sonner library), error states in components, display user-friendly messages
- Audit all important actions with audit.service.log()

### TypeScript
- Strict mode enabled on both projects
- Backend: Define interfaces for request/response shapes in services
- Frontend: Zod schemas for form validation, type exports in separate .types.ts files
- No implicit any, prefer explicit types

## Notes
- Windows environment (use PowerShell commands, backslash paths)
- Firma Perú: Digital signature service for Peru government documents, requires external credentials
- OCR processing uses Tesseract.js with Spanish/English training data (spa.traineddata, eng.traineddata in backend root)
- Version control system tracks document changes and signature reversions
