# PDF.js Worker

Este directorio contiene el worker de PDF.js necesario para que react-pdf funcione correctamente.

## Versión Actual
- **Worker**: pdf.worker.min.js@3.11.174
- **pdfjs-dist**: 3.11.174 (incluido con react-pdf 7.7.3)

## IMPORTANTE
La versión del worker DEBE coincidir EXACTAMENTE con la versión de pdfjs-dist que usa react-pdf.

## Actualizar Worker

### 1. Verificar versión de pdfjs-dist:
```bash
npm list pdfjs-dist
```

### 2. Descargar worker correspondiente:
```bash
# Reemplaza 3.11.174 con la versión actual de pdfjs-dist
curl -o pdf.worker.min.js \
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
```

### 3. Reemplazar el archivo actual en este directorio

## Verificar
Si todo está correcto, NO deberías ver este warning en la consola:
```
Warning: The API version "X.X.X" does not match the Worker version "Y.Y.Y"
```

## Más Información
Ver: `BUGFIX-PDFJS.md` en la raíz del proyecto
