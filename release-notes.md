# 🏛️ Sistema Integrado de Archivos Digitales (SAD) - Versión de Escritorio v1.0.0
### Dirección de Salud Chincheros — Estación Central de Custodia y Archivo Digital

Esta versión oficial para Windows contiene la solución **Todo en Uno (All-in-One)** del Sistema SAD, diseñada para ejecutarse de forma 100% autónoma en el equipo del usuario sin depender de internet ni servidores externos.

---

## 📦 Archivos Disponibles para Descarga

1. **`SAD - Archivo Digital Setup 1.0.0.exe` (Recomendado):**
   - Asistente de instalación estándar para Windows (NSIS).
   - Crea automáticamente los accesos directos en el **Escritorio** y en el **Menú Inicio**.
   - Incluye desinstalador institucional.

2. **`SAD-Escritorio-Portable-v1.0.0.exe` (Versión Portable):**
   - Ejecutable único independiente. No requiere permisos de administrador ni instalación previa.
   - Ideal para abrir directamente o transportar en una memoria USB cifrada.

---

## 🚀 Características Principales

- **Ejecución Local Autónoma:** Frontend (Next.js 15 Standalone) y Backend (Express + Prisma) integrados en el contenedor de escritorio (Electron 33).
- **Inicio Transparente:** Pantalla de carga (*Splash Screen*) institucional que orquesta la activación de servicios y base de datos local en `localhost:3306`.
- **Integración con Firma Perú:** Comunicación inmediata con el Agente local de Firma Digital de la PCM en el puerto `48596` (soporta DNI Electrónico DNIe y Tokens USB).
- **Trazabilidad Archivística:** Foliación automática, cálculo de hash SHA-256 por cada versión documental y auditoría inmutable (`AuditLog`).
- **Módulo de Respaldo de 1-Clic:** Generación de copias de seguridad en archivos ZIP cifrados para almacenamiento en medios externos.

---

## ⚖️ Conformidad con Normativas del Estado Peruano

- **Directiva N° 001-2023-AGN/DDPA:** Cumplimiento de la administración de archivos en entidades públicas (Cuadro de Clasificación y Series Documentales).
- **Resolución Jefatural N° 021-2019-AGN/J:** Digitalización con valor legal y verificación de integridad criptográfica (SHA-256).
- **Ley N° 27269 y D.S. N° 052-2008-PCM:** Ley de Firmas y Certificados Digitales (PAdES / IOFE).

---
*Área de Informática y Archivo Central — DISA Chincheros (2026)*
