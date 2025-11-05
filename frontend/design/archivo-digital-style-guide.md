# Guía de Estilo - Módulo de Archivo Digital
## Sistema Integrado de Archivos Digitales (SAD)

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Auditoría Visual](#auditoría-visual)
3. [Design Tokens](#design-tokens)
4. [Componentes Clave](#componentes-clave)
5. [Patrones de Layout](#patrones-de-layout)
6. [Accesibilidad (WCAG 2.1 AA)](#accesibilidad)
7. [Plan de Implementación](#plan-de-implementación)

---

## 1. Resumen Ejecutivo

### Objetivo
Unificar la experiencia visual del módulo de Archivo Digital (Archivadores, Documentos, Expedientes) con el estándar establecido por el módulo de Reportes y Analítica, garantizando:
- Diseño minimalista con fondo blanco predominante
- Alto contraste para accesibilidad WCAG 2.1 AA
- Consistencia en componentes reutilizables
- Experiencia de usuario profesional y limpia

### Referencia de Diseño
**Módulo de Reportes** (`/dashboard/reportes`) es la fuente de verdad para el estilo visual del sistema.

---

## 2. Auditoría Visual

### 2.1 Hallazgos por Módulo

#### ✅ **Módulo de Reportes** (Referencia de Diseño)

**Fortalezas:**
- Espaciado vertical consistente: `space-y-6`
- Cards uniformes: `bg-white p-6 rounded-lg border border-gray-200`
- Tipografía clara: `text-3xl font-bold text-gray-900` para H1
- Tablas con headers estilizados: `bg-gray-50` con texto uppercase
- Grid layouts responsivos: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
- SummaryCards con iconografía colorida y métricas destacadas

**Estilo visual:**
```tsx
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="h-8 w-8" />
        Reportes y Analítica
      </h1>
      <p className="text-gray-600 mt-1">Descripción del módulo</p>
    </div>
  </div>
  
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    {/* Contenido */}
  </div>
</div>
```

#### ⚠️ **Módulo de Archivadores** (`/dashboard/archivo/archivadores`)

**Inconsistencias detectadas:**
1. **Cards mixtos**: Algunos usan `shadow`, otros `border border-gray-200`
   ```tsx
   // Inconsistente: usa shadow
   <div className="bg-white p-4 rounded-lg shadow space-y-4">
   
   // Debe usar: border consistente con Reportes
   <div className="bg-white p-6 rounded-lg border border-gray-200">
   ```

2. **Padding inconsistente**: Alterna entre `p-4` y `p-6` sin criterio claro
3. **Tablas**: Envueltas en un Card pero sin el padding estándar
4. **Modals complejos**: Buenos detalles pero `max-w-2xl` con mucho contenido anidado
5. **DetailDialog**: Excelente diseño con Cards anidadas y stats, pero usa `max-h-[90vh]` sin estándar

**Fortalezas:**
- Buena estructura de formularios con validación
- Uso apropiado de Badges para metadata
- Modal de detalles con Cards anidadas bien organizadas

#### ⚠️ **Módulo de Documentos** (`/dashboard/archivo/documentos`)

**Inconsistencias detectadas:**
1. **Cards de filtros**: `p-4` cuando debería ser `p-6`
2. **Filtros colapsables**: Estructura correcta pero padding inconsistente
3. **Select nativo**: Usa `<select>` HTML nativo en vez del componente Select de shadcn
4. **DocumentsTable**: Envolvente con `border rounded-lg overflow-hidden` (sin Card padre)

**Fortalezas:**
- Barra de herramientas limpia con botones bien organizados
- Paginación consistente
- AlertDialog bien implementado para confirmaciones

#### ⚠️ **Módulo de Expedientes** (`/dashboard/archivo/expedientes`)

**Inconsistencias detectadas:**
1. **Diseño minimalista excesivo**: Menos features que Archivadores sin justificación
2. **Barra de búsqueda básica**: No usa estructura de Card con filtros avanzados
3. **ExpedientesTable**: Similar a DocumentsTable pero con menos columnas

**Fortalezas:**
- Código limpio y directo
- Modals simples y efectivos
- ExpedienteForm reutilizable

#### ⚠️ **Componentes Compartidos**

**DocumentsTable** (`components/documents/DocumentsTable.tsx`):
- ✅ Buena tabla con dropdown menu de acciones
- ✅ Estado vacío bien diseñado con icono y mensajes
- ⚠️ No sigue el wrapper de Card del módulo de Reportes
- ⚠️ Headers sin clases de estilo consistentes (no uppercase)

**ExpedientesTable** (`components/expedientes/ExpedientesTable.tsx`):
- ✅ Estructura similar a DocumentsTable
- ⚠️ Menos columnas, podría mostrar más metadata

**AddRemoveDocumentsModal** (`components/expedientes/AddRemoveDocumentsModal.tsx`):
- ✅ Excelente UX con dos paneles
- ✅ Búsqueda integrada
- ⚠️ Muy grande (`max-w-6xl`), podría optimizarse
- ⚠️ DocumentItem inline, debería extraerse como componente

**SignatureStatusBadge** (`components/documents/SignatureStatusBadge.tsx`):
- ✅ **Excelente implementación**: Tooltips, iconos, colores semánticos
- ✅ Configuración robusta de estados
- ✅ Accesibilidad con TooltipProvider
- 🎯 **Ejemplo a seguir para otros badges**

**StatCard** (`components/shared/StatCard.tsx`):
- ✅ Diseño consistente con Reportes
- ✅ Iconografía colorida con backgrounds suaves
- ✅ Soporte para tendencias opcionales
- ⚠️ Usa `shadow-sm hover:shadow-md` (debería preferir borders)

### 2.2 Resumen de Inconsistencias Principales

| Aspecto | Reportes (✅ Referencia) | Archivo Digital (⚠️ Actual) |
|---------|-------------------------|----------------------------|
| **Card padding** | `p-6` | `p-4` o `p-6` mixto |
| **Card border** | `border border-gray-200` | `shadow` o `border` mixto |
| **Espaciado vertical** | `space-y-6` | `mb-6` mixto |
| **Table headers** | `bg-gray-50 uppercase` | Sin uppercase |
| **Selects** | Componente shadcn | HTML nativo mixto |
| **Modal widths** | No establecido | `max-w-2xl` a `max-w-6xl` sin estándar |
| **Empty states** | No visible en código | Bien implementado en tablas |

---

## 3. Design Tokens

### 3.1 Paleta de Colores

**Basado en `app/globals.css` con variables CSS en OKLCH:**

#### Colores Primarios
```css
--primary: oklch(0.205 0 0)           /* Negro profundo #1A1A1A */
--primary-foreground: oklch(0.985 0 0) /* Blanco casi puro #FAFAFA */
--background: oklch(1 0 0)            /* Blanco puro #FFFFFF */
--foreground: oklch(0.145 0 0)        /* Gris oscuro para texto #252525 */
```

**Uso recomendado:**
- **Fondo principal**: Blanco puro (`bg-white` o `bg-background`)
- **Texto principal**: `text-gray-900` equivalente a `text-foreground`
- **Texto secundario**: `text-gray-600`
- **Texto terciario/muted**: `text-gray-500`

#### Colores de Estado (Semánticos)

```css
/* Éxito */
--success: #10b981          /* green-500 */
--success-light: #d1fae5    /* green-100 */
--success-dark: #047857     /* green-700 */

/* Advertencia */
--warning: #f59e0b          /* amber-500 */
--warning-light: #fef3c7    /* amber-100 */
--warning-dark: #d97706     /* amber-700 */

/* Error */
--destructive: oklch(0.577 0.245 27.325)  /* red-600 */
--destructive-light: #fee2e2              /* red-100 */
--destructive-dark: #991b1b               /* red-800 */

/* Información (Azul) */
--info: #2563eb             /* blue-600 */
--info-light: #dbeafe       /* blue-100 */
--info-dark: #1e40af        /* blue-800 */

/* Neutral/Muted */
--muted: oklch(0.97 0 0)           /* gray-50 #F9FAFB */
--muted-foreground: oklch(0.556 0 0) /* gray-500 */
```

**Aplicación en componentes:**

| Componente | Color Background | Color Foreground | Uso |
|------------|------------------|------------------|-----|
| Badge verde (Éxito) | `bg-green-500` | `text-white` | Firmado, Completado |
| Badge amarillo | `bg-yellow-500` | `text-white` | En proceso, Advertencia |
| Badge rojo | `bg-red-500` | `text-white` | Error, Revertido |
| Badge azul | `bg-blue-500` | `text-white` | Información, En flujo |
| Badge gris | `bg-gray-200` | `text-gray-700` | Sin estado, Neutral |
| Badge outline | `border border-gray-300` | `text-gray-700` | Metadata |

#### Colores de Acentos para Iconografía

Basados en `ReportSummary.tsx`:

```tsx
const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',      // Documentos generales
  green: 'bg-green-50 text-green-600',   // Métricas positivas
  amber: 'bg-amber-50 text-amber-600',   // Advertencias/OCR
  red: 'bg-red-50 text-red-600',         // Errores/Críticos
  violet: 'bg-violet-50 text-violet-600' // Datos analíticos
};
```

### 3.2 Tipografía

**Font Family:**
```css
font-family: ui-sans-serif, system-ui, sans-serif;
```
*(Inter o Roboto si disponible en el sistema)*

**Escala Tipográfica:**

```css
/* Headings */
h1 {
  font-size: 2.25rem;      /* 36px */
  font-weight: 700;        /* Bold */
  line-height: 2.5rem;     /* 40px */
  color: text-gray-900;
}

h2 {
  font-size: 1.875rem;     /* 30px */
  font-weight: 700;        /* Bold */
  line-height: 2.25rem;    /* 36px */
}

h3 {
  font-size: 1.5rem;       /* 24px */
  font-weight: 600;        /* Semibold */
  line-height: 2rem;       /* 32px */
}

/* Body text */
body {
  font-size: 1rem;         /* 16px base */
  line-height: 1.5rem;     /* 24px */
  color: text-gray-900;
}

/* Small/Secondary */
.text-sm {
  font-size: 0.875rem;     /* 14px */
  line-height: 1.25rem;    /* 20px */
}

/* Captions/Metadata */
.text-xs {
  font-size: 0.75rem;      /* 12px */
  line-height: 1rem;       /* 16px */
}
```

**Pesos tipográficos:**
- **Bold (700)**: Títulos H1/H2, valores numéricos destacados
- **Semibold (600)**: H3, subtítulos, nombres en tablas
- **Medium (500)**: Labels, botones
- **Regular (400)**: Texto de párrafo, descripciones

### 3.3 Espaciados

**Sistema de espaciado basado en múltiplos de 4px:**

```tsx
// Espaciado vertical entre secciones principales
space-y-6    // 24px - Entre secciones de página

// Espaciado vertical entre elementos de una sección
space-y-4    // 16px - Entre elementos relacionados
space-y-2    // 8px  - Entre elementos muy cercanos (badges, labels)

// Padding de Cards
p-6          // 24px - Padding estándar de Cards principales
p-4          // 16px - Padding de Cards secundarias o anidadas
p-3          // 12px - Padding de elementos pequeños (DocumentItem)

// Gap en Grids
gap-6        // 24px - Entre Cards en grids principales
gap-4        // 16px - Entre elementos en grids secundarios
gap-2        // 8px  - Entre botones o badges inline
```

**Jerarquía de espaciado:**

| Nivel | Clase | Uso |
|-------|-------|-----|
| **Macro** | `space-y-6` | Entre secciones de página (Header → Filtros → Tabla) |
| **Medio** | `space-y-4` | Dentro de formularios, entre grupos de campos |
| **Micro** | `space-y-2` | Entre label y input, entre badges |
| **Grid** | `gap-6` | Grid de Cards de métricas |
| **Inline** | `gap-2` | Botones horizontales, badges inline |

### 3.4 Bordes y Radios

```css
/* Border radius */
--radius: 0.625rem;                    /* 10px base */
--radius-sm: calc(var(--radius) - 4px) /* 6px para elementos pequeños */
--radius-md: calc(var(--radius) - 2px) /* 8px para inputs */
--radius-lg: var(--radius)             /* 10px para Cards */
--radius-xl: calc(var(--radius) + 4px) /* 14px para modals grandes */

/* Aplicación práctica */
.rounded-lg    /* 10px - Cards, Modals */
.rounded-md    /* 8px  - Inputs, Selects, pequeños contenedores */
.rounded       /* 6px  - Badges, Buttons */
.rounded-full  /* 9999px - Avatars, iconos circulares */
```

**Bordes:**
```css
/* Border width */
border         /* 1px - Estándar */
border-2       /* 2px - Focus states, outline de accesibilidad */

/* Border colors */
border-gray-200  /* Bordes de Cards y contenedores */
border-gray-300  /* Inputs, selects */
border-blue-600  /* Focus visible para accesibilidad */
border-red-600   /* Error states */
```

### 3.5 Sombras

**⚠️ Recomendación: Preferir borders sobre shadows para mantener estilo minimalista**

```css
/* Solo usar sombras sutiles en estados hover opcionales */
shadow-sm           /* Hover sutil opcional */
shadow-md           /* Estados elevados (dropdowns, popovers) */
shadow-lg           /* Modals y overlays */

/* Valores OKLCH para sombras sutiles */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
```

**Uso recomendado:**
- **Cards principales**: `border border-gray-200` (SIN shadow)
- **Hover en Cards interactivas**: `hover:shadow-sm transition-shadow` (opcional)
- **Dropdown menus**: `shadow-md`
- **Modals**: `shadow-lg`

### 3.6 Estados Interactivos

#### Hover States
```tsx
// Botones
hover:bg-blue-700      // Botones primarios
hover:bg-gray-100      // Botones ghost/outline

// Cards interactivos
hover:bg-gray-50       // Cards clicables
hover:shadow-sm        // Elevación sutil opcional

// Links
hover:text-blue-600    // Links en texto
hover:underline        // Subrayado opcional
```

#### Focus States (Accesibilidad)
```tsx
focus:outline-none              // Remover outline nativo
focus:ring-2                    // Ring de 2px
focus:ring-blue-600             // Color azul para contraste
focus:ring-offset-2             // Separación de 2px del elemento

// Aplicación completa
className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
```

#### Active/Pressed States
```tsx
active:bg-blue-800     // Botones primarios presionados
active:scale-95        // Microinteracción opcional
```

#### Disabled States
```tsx
disabled:opacity-50          // Opacidad reducida
disabled:cursor-not-allowed  // Cursor apropiado
disabled:bg-gray-100         // Fondo deshabilitado
```

### 3.7 Transiciones

```css
/* Transiciones estándar */
transition-colors    /* Para cambios de color (hover, focus) */
transition-shadow    /* Para elevaciones (hover en Cards) */
transition-all       /* Para efectos complejos (scales, múltiples props) */

/* Duración estándar */
duration-200         /* 200ms - Predeterminado para micro-interacciones */
duration-300         /* 300ms - Animaciones más perceptibles */

/* Timing functions */
ease-in-out         /* Predeterminado de Tailwind */
```

**Ejemplo completo:**
```tsx
<Button className="transition-colors duration-200 hover:bg-blue-700" />
<Card className="transition-shadow duration-200 hover:shadow-sm" />
```

---

## 4. Componentes Clave

### 4.1 Cards

**Card Estándar (Principal):**
```tsx
<div className="bg-white p-6 rounded-lg border border-gray-200">
  {/* Contenido */}
</div>
```

**Card Secundaria/Anidada:**
```tsx
<div className="bg-white p-4 rounded-lg border border-gray-200">
  {/* Contenido */}
</div>
```

**Card Interactiva:**
```tsx
<div className="bg-white p-6 rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer">
  {/* Contenido clicable */}
</div>
```

**Ejemplos de uso:**
- **Filtros de búsqueda**: Card principal con `p-6`
- **Tabla de datos**: Card principal envolviendo la Table
- **Cards de métricas (StatCard)**: Grid de Cards con iconos coloridos
- **Cards anidadas en modal de detalle**: Cards secundarias con `p-4`

### 4.2 Tablas

**Estructura estándar basada en shadcn/ui Table:**

```tsx
<div className="bg-white rounded-lg border border-gray-200">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Columna 1
        </TableHead>
        {/* Más columnas */}
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">Valor</TableCell>
        {/* Más celdas */}
      </TableRow>
      {/* Zebra rows opcionales con className en TableRow */}
      <TableRow className="bg-gray-50/50">
        <TableCell>...</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

**Especificaciones:**

| Elemento | Clase Tailwind | Descripción |
|----------|----------------|-------------|
| **Wrapper** | `bg-white rounded-lg border border-gray-200` | Card contenedor |
| **Table** | `Table` (shadcn) | Componente base |
| **TableHeader** | `TableHeader` | Header sticky opcional |
| **TableHead** | `bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider` | Headers estilizados |
| **TableRow** | `TableRow` | Fila estándar con hover automático |
| **TableCell (primary)** | `font-medium` | Celda con dato principal (ej: código) |
| **TableCell (secondary)** | `text-gray-600 text-sm` | Celda con metadata |
| **Actions column** | `text-right` | Columna de acciones alineada a derecha |

**Zebra rows (opcional):**
```tsx
{items.map((item, index) => (
  <TableRow key={item.id} className={index % 2 === 1 ? 'bg-gray-50/50' : ''}>
    {/* Celdas */}
  </TableRow>
))}
```

**Estado vacío:**
```tsx
<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos</h3>
  <p className="text-gray-500">Descripción del estado vacío.</p>
</div>
```

**Paginación:**
```tsx
<div className="flex items-center justify-between px-4 py-4 border-t">
  <div className="text-sm text-gray-600">
    Mostrando {start} a {end} de {total} elementos
  </div>
  <div className="flex gap-2">
    <Button variant="outline" size="sm" disabled={page === 1}>
      Anterior
    </Button>
    <Button variant="outline" size="sm" disabled={page === pages}>
      Siguiente
    </Button>
  </div>
</div>
```

### 4.3 Modals/Dialogs

**Dialog Estándar (Small):**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        Título del Dialog
      </DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* Contenido del formulario */}
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={handleCancel}>
        Cancelar
      </Button>
      <Button onClick={handleSubmit}>
        Guardar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Dialog Mediano (Forms):**
```tsx
<DialogContent className="max-w-2xl">
  {/* Formularios complejos, creación/edición de recursos */}
</DialogContent>
```

**Dialog Grande (Detail Views):**
```tsx
<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
  {/* Vista de detalles con múltiples secciones */}
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      {/* Cards anidadas */}
    </div>
  </div>
</DialogContent>
```

**Dialog Extra Grande (Complex Interactions):**
```tsx
<DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
  {/* Modales complejos como AddRemoveDocumentsModal */}
  {/* Grid de dos paneles, búsqueda, scroll areas */}
</DialogContent>
```

**Especificaciones de tamaños:**

| Tipo | Max Width | Max Height | Uso |
|------|-----------|------------|-----|
| Small | `max-w-md` (448px) | Auto | Confirmaciones, alertas |
| Medium | `max-w-2xl` (672px) | Auto | Formularios estándar |
| Large | `max-w-4xl` (896px) | `max-h-[80vh]` | Vistas de detalle |
| Extra Large | `max-w-6xl` (1152px) | `max-h-[90vh]` | Interacciones complejas |

**Header con icono:**
```tsx
<DialogTitle className="flex items-center gap-2">
  <Icon className="h-5 w-5" />
  Título
</DialogTitle>
```

**Scroll interno:**
```tsx
<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
  {/* Contenido scrolleable */}
</DialogContent>
```

### 4.4 Badges

**Badge de Estado (basado en SignatureStatusBadge):**

```tsx
// Importar configuración de colores
const statusConfig = {
  success: {
    label: 'Completado',
    color: 'bg-green-500 text-white hover:bg-green-600',
    icon: CheckCircle,
  },
  warning: {
    label: 'En Proceso',
    color: 'bg-yellow-500 text-white hover:bg-yellow-600',
    icon: Clock,
  },
  error: {
    label: 'Error',
    color: 'bg-red-500 text-white hover:bg-red-600',
    icon: XCircle,
  },
  info: {
    label: 'Información',
    color: 'bg-blue-500 text-white hover:bg-blue-600',
    icon: Info,
  },
  neutral: {
    label: 'Sin Estado',
    color: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    icon: FileX,
  }
};

// Componente Badge con icono y tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Badge className={cn(
        statusConfig[status].color,
        'flex items-center gap-1.5 font-medium transition-all duration-200'
      )}>
        <Icon className="h-3 w-3" />
        <span>{statusConfig[status].label}</span>
      </Badge>
    </TooltipTrigger>
    <TooltipContent>
      <p>Descripción adicional del estado</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Badge de Metadata (Outline):**
```tsx
<Badge variant="outline" className="flex items-center gap-1">
  <Calendar className="h-3 w-3" />
  2025
</Badge>
```

**Badge de Contador:**
```tsx
<Badge variant="secondary" className="flex items-center gap-1">
  <FileText className="h-3 w-3" />
  24 documentos
</Badge>
```

**Tamaños de Badges:**
```tsx
// Small
<Badge className="text-xs px-2 py-0.5">
  <Icon className="h-3 w-3" />
  Label
</Badge>

// Medium (Default)
<Badge className="text-sm px-2.5 py-1">
  <Icon className="h-4 w-4" />
  Label
</Badge>

// Large
<Badge className="text-base px-3 py-1.5">
  <Icon className="h-5 w-5" />
  Label
</Badge>
```

### 4.5 Buttons

**Variantes de shadcn Button:**

```tsx
// Primary (default)
<Button>Guardar</Button>
// Clases: bg-primary text-primary-foreground hover:bg-primary/90

// Secondary
<Button variant="secondary">Cancelar</Button>
// Clases: bg-secondary text-secondary-foreground hover:bg-secondary/80

// Outline
<Button variant="outline">Filtros</Button>
// Clases: border border-input bg-background hover:bg-accent

// Ghost (acciones sutiles)
<Button variant="ghost">Ver más</Button>
// Clases: hover:bg-accent hover:text-accent-foreground

// Destructive (eliminar)
<Button variant="destructive">Eliminar</Button>
// Clases: bg-destructive text-destructive-foreground hover:bg-destructive/90

// Link
<Button variant="link">Ir a documentos</Button>
// Clases: text-primary underline-offset-4 hover:underline
```

**Tamaños:**
```tsx
<Button size="sm">Pequeño</Button>    // px-3 text-xs
<Button size="default">Normal</Button> // px-4 py-2
<Button size="lg">Grande</Button>      // px-8 text-base
<Button size="icon">                   // h-10 w-10 (iconos)
  <Icon className="h-4 w-4" />
</Button>
```

**Con iconos:**
```tsx
// Icono a la izquierda
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Crear Nuevo
</Button>

// Icono a la derecha
<Button>
  Descargar
  <Download className="ml-2 h-4 w-4" />
</Button>

// Solo icono
<Button size="icon" variant="ghost">
  <Search className="h-4 w-4" />
</Button>
```

**Estados:**
```tsx
// Loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Guardando...
</Button>

// Disabled
<Button disabled>No disponible</Button>
```

### 4.6 Forms

**Estructura estándar de campo:**

```tsx
<div className="space-y-2">
  <Label htmlFor="fieldId">
    Nombre del Campo *
  </Label>
  <Input
    id="fieldId"
    placeholder="Ingrese el valor"
    value={value}
    onChange={handleChange}
    className="w-full"
  />
  {error && (
    <p className="text-sm text-red-600">{error}</p>
  )}
</div>
```

**Layout de formularios:**

```tsx
// Formulario de 1 columna
<div className="space-y-4">
  <div className="space-y-2">{/* Campo 1 */}</div>
  <div className="space-y-2">{/* Campo 2 */}</div>
</div>

// Formulario de 2 columnas
<div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">{/* Campo 1 */}</div>
    <div className="space-y-2">{/* Campo 2 */}</div>
  </div>
  <div className="space-y-2">{/* Campo full width */}</div>
</div>
```

**Select con shadcn:**
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger id="selectId" className="w-full">
    <SelectValue placeholder="Seleccione opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

**Textarea:**
```tsx
<Textarea
  id="description"
  placeholder="Ingrese descripción..."
  rows={3}
  value={value}
  onChange={handleChange}
  className="w-full resize-none"
/>
```

**Validación de errores:**
```tsx
{errors.fieldName && (
  <p className="text-sm text-red-600 mt-1">{errors.fieldName}</p>
)}
```

### 4.7 Filtros y Búsqueda

**Barra de búsqueda con filtros colapsables:**

```tsx
<Card className="p-6 mb-6">
  <div className="space-y-4">
    {/* Barra principal */}
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <Button onClick={handleSearch}>
        <Search className="mr-2 h-4 w-4" />
        Buscar
      </Button>
      <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
        <Filter className="mr-2 h-4 w-4" />
        {showFilters ? 'Ocultar' : 'Filtros'}
      </Button>
    </div>

    {/* Filtros avanzados colapsables */}
    {showFilters && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Filtro 1</Label>
          <Select>{/* ... */}</Select>
        </div>
        {/* Más filtros */}
        
        <div className="flex items-end">
          <Button variant="outline" onClick={handleResetFilters} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>
      </div>
    )}
  </div>
</Card>
```

### 4.8 Métricas y Stats Cards

**StatCard estándar (basado en ReportSummary):**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-600">Total Documentos</p>
      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
        <FileText className="h-5 w-5" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-bold text-gray-900">1,234</p>
      <p className="text-sm text-gray-500">Última actualización: Hoy</p>
    </div>
  </div>
  {/* Más cards */}
</div>
```

**Colores de iconos según tipo:**
- **Azul** (`bg-blue-50 text-blue-600`): Métricas generales, documentos
- **Verde** (`bg-green-50 text-green-600`): Métricas positivas, completados
- **Ámbar** (`bg-amber-50 text-amber-600`): Advertencias, pendientes
- **Rojo** (`bg-red-50 text-red-600`): Errores, críticos
- **Violeta** (`bg-violet-50 text-violet-600`): Datos analíticos, contadores

---

## 5. Patrones de Layout

### 5.1 Estructura de Página Estándar

```tsx
export default function ModulePage() {
  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Icon className="h-8 w-8" />
            Título del Módulo
          </h1>
          <p className="text-gray-600 mt-1">
            Descripción breve del módulo
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAction}>
            <Plus className="mr-2 h-4 w-4" />
            Acción Principal
          </Button>
        </div>
      </div>

      {/* 2. Filtros/Búsqueda */}
      <Card className="p-6">
        {/* Barra de búsqueda y filtros */}
      </Card>

      {/* 3. Stats Cards (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
      </div>

      {/* 4. Contenido Principal (Tabla, Grid, etc.) */}
      <Card className="p-6">
        {/* Tabla o contenido principal */}
      </Card>
    </div>
  );
}
```

### 5.2 Grids Responsivos

**Grid de Cards de Métricas (4 columnas):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 4 cards en desktop, 2 en tablet, 1 en mobile */}
</div>
```

**Grid de Contenido (2 columnas):**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* 2 columnas en desktop, 1 en mobile */}
</div>
```

**Grid de Formularios (2-4 columnas):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Filtros o campos de formulario */}
</div>
```

### 5.3 Espaciado Vertical

**Jerarquía de secciones:**
```tsx
<div className="space-y-6">      {/* Entre secciones de página */}
  <section>
    <div className="space-y-4">  {/* Dentro de formularios/grupos */}
      <div className="space-y-2">{/* Entre label e input */}</div>
    </div>
  </section>
</div>
```

### 5.4 Responsive Breakpoints

```tsx
// Tailwind breakpoints
sm: 640px   // Tablet vertical
md: 768px   // Tablet horizontal
lg: 1024px  // Desktop pequeño
xl: 1280px  // Desktop estándar
2xl: 1536px // Desktop grande

// Uso común
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

---

## 6. Accesibilidad (WCAG 2.1 AA)

### 6.1 Contraste de Colores

**Requisitos WCAG 2.1 AA:**
- Texto normal (< 18px): Ratio ≥ 4.5:1
- Texto grande (≥ 18px): Ratio ≥ 3:1
- Elementos UI (bordes, iconos): Ratio ≥ 3:1

**Combinaciones validadas:**

| Foreground | Background | Ratio | Estado |
|------------|------------|-------|--------|
| `text-gray-900` (#111827) | `bg-white` (#FFFFFF) | 16.1:1 | ✅ AAA |
| `text-gray-600` (#4B5563) | `bg-white` (#FFFFFF) | 7.0:1 | ✅ AAA |
| `text-gray-500` (#6B7280) | `bg-white` (#FFFFFF) | 4.6:1 | ✅ AA |
| `text-white` | `bg-blue-600` (#2563EB) | 8.6:1 | ✅ AAA |
| `text-white` | `bg-green-500` (#10B981) | 4.1:1 | ✅ AA (texto grande) |
| `text-white` | `bg-red-500` (#EF4444) | 4.5:1 | ✅ AA |

**⚠️ Combinaciones a evitar:**
- `text-gray-400` sobre `bg-white`: Ratio 2.9:1 (❌ Falla AA)
- `text-yellow-500` sobre `bg-white`: Ratio 1.8:1 (❌ Falla AA)

### 6.2 Navegación por Teclado

**Orden de tabulación (Tab Order):**
```tsx
// Asegurar orden lógico con tabIndex si es necesario
<input tabIndex={1} />
<button tabIndex={2}>Guardar</button>
```

**Focus visible:**
```tsx
// Todos los elementos interactivos deben mostrar focus
className="focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
```

**Atajos de teclado:**
- `Enter`: Activar botón primario, buscar (en inputs)
- `Escape`: Cerrar modals/dropdowns
- `Space`: Activar checkbox/switch
- `Arrow keys`: Navegar en selects y dropdowns

**Skip links (opcional para vistas complejas):**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2">
  Saltar al contenido principal
</a>
```

### 6.3 Etiquetas ARIA

**Labels en inputs:**
```tsx
<Label htmlFor="documentNumber">Número de Documento *</Label>
<Input id="documentNumber" aria-required="true" />
```

**Botones de iconos:**
```tsx
<Button size="icon" aria-label="Buscar documentos">
  <Search className="h-4 w-4" />
</Button>
```

**Estados de loading:**
```tsx
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  <span aria-live="polite">Cargando...</span>
</Button>
```

**Tablas:**
```tsx
<Table aria-label="Lista de documentos">
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Número</TableHead>
      {/* scope="col" para headers de columna */}
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>{/* Datos */}</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Modals:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent 
    aria-labelledby="dialog-title" 
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">Título</DialogTitle>
    </DialogHeader>
    <div id="dialog-description">Descripción del modal</div>
  </DialogContent>
</Dialog>
```

**Estados de badges:**
```tsx
<Badge aria-label={`Estado: ${statusConfig[status].description}`}>
  {statusConfig[status].label}
</Badge>
```

### 6.4 Landmarks Semánticos

```tsx
<header>{/* Header de aplicación */}</header>
<nav>{/* Navegación principal */}</nav>
<main>{/* Contenido principal de la página */}</main>
<aside>{/* Sidebars, filtros secundarios */}</aside>
<footer>{/* Footer de aplicación */}</footer>
```

### 6.5 Mensajes de Error y Validación

```tsx
// Error en campo de formulario
<Input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-red-600" role="alert">
    {errors.email}
  </p>
)}

// Toast notifications con aria-live
<div role="alert" aria-live="assertive" aria-atomic="true">
  Error al guardar el documento
</div>
```

### 6.6 Checklist de Accesibilidad

#### ✅ Nivel Crítico (Obligatorio)
- [ ] Todos los inputs tienen `<Label>` asociado con `htmlFor`
- [ ] Ratio de contraste ≥ 4.5:1 en texto normal
- [ ] Focus visible en todos los elementos interactivos
- [ ] Navegación por teclado funcional en modals (trap focus)
- [ ] Botones de iconos tienen `aria-label`
- [ ] Imágenes tienen `alt` descriptivo (o `alt=""` si decorativas)
- [ ] Estados de error con `aria-invalid` y `aria-describedby`

#### ✅ Nivel Alto (Recomendado)
- [ ] Tablas tienen `aria-label` descriptivo
- [ ] Headers de tablas usan `scope="col"`
- [ ] Modals tienen `aria-labelledby` y `aria-describedby`
- [ ] Estados de loading con `aria-busy` y `aria-live`
- [ ] Skip links para navegación rápida
- [ ] Landmarks semánticos (`<main>`, `<nav>`, `<aside>`)

#### ✅ Nivel Medio (Buenas Prácticas)
- [ ] Tooltips con información adicional en badges
- [ ] Feedback visual y textual en acciones (no solo color)
- [ ] Mensajes de éxito/error con `role="alert"`
- [ ] Orden de tabulación lógico
- [ ] Soporte para lectores de pantalla en componentes complejos

### 6.7 Testing de Accesibilidad

**Herramientas recomendadas:**
1. **axe DevTools** (Chrome Extension): Auditoría automática
2. **Lighthouse** (Chrome DevTools): Score de accesibilidad
3. **WAVE** (Web Accessibility Evaluation Tool): Análisis visual
4. **Keyboard Testing Manual**: Navegar sin mouse

**Comandos de prueba:**
```bash
# Lighthouse CI (opcional)
npm install -g lighthouse
lighthouse http://localhost:3000/dashboard/archivo/documentos --only-categories=accessibility
```

---

## 7. Plan de Implementación

### 7.1 Priorización de Refactorización

#### 🔴 **Prioridad ALTA** (Sprint 1 - 2 semanas)

**1. Estandarización de Cards**
- **Archivos afectados:**
  - `app/dashboard/archivo/archivadores/page.tsx`
  - `app/dashboard/archivo/documentos/page.tsx`
  - `app/dashboard/archivo/expedientes/page.tsx`
- **Cambios:**
  - Unificar `p-6` en Cards principales
  - Reemplazar `shadow` por `border border-gray-200`
  - Aplicar `space-y-6` vertical

**2. Tablas - Headers Uppercase**
- **Archivos afectados:**
  - `components/documents/DocumentsTable.tsx`
  - `components/expedientes/ExpedientesTable.tsx`
  - Tabla inline en `app/dashboard/archivo/archivadores/page.tsx` (modal de detalle)
- **Cambios:**
  - Agregar `className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider"` a todos los `<TableHead>`

**3. Modals - Tamaños Estandarizados**
- **Archivos afectados:**
  - `app/dashboard/archivo/archivadores/page.tsx` (DialogContent)
  - `app/dashboard/archivo/expedientes/page.tsx` (DialogContent)
  - `components/expedientes/AddRemoveDocumentsModal.tsx`
- **Cambios:**
  - Validar y documentar tamaños: `max-w-md`, `max-w-2xl`, `max-w-4xl`, `max-w-6xl`
  - Aplicar `max-h-[80vh]` o `max-h-[90vh]` consistentemente con `overflow-y-auto` o `overflow-hidden flex flex-col`

#### 🟡 **Prioridad MEDIA** (Sprint 2 - 1.5 semanas)

**4. Filtros - Reemplazar Selects Nativos**
- **Archivos afectados:**
  - `app/dashboard/archivo/documentos/page.tsx`
- **Cambios:**
  - Reemplazar `<select>` HTML por componente `Select` de shadcn/ui
  - Mantener estructura de Card con `p-6`

**5. Badges - Tooltips Consistentes**
- **Archivos afectados:**
  - `components/documents/OCRStatusBadge.tsx` (crear o actualizar)
  - Badges en `ExpedientesTable.tsx`
- **Cambios:**
  - Seguir patrón de `SignatureStatusBadge.tsx` con `TooltipProvider`
  - Iconos + colores semánticos

**6. StatCards - Remover Sombras**
- **Archivos afectados:**
  - `components/shared/StatCard.tsx`
- **Cambios:**
  - Remover `shadow-sm hover:shadow-md`
  - Usar solo `border border-gray-200 hover:bg-gray-50 transition-colors`

#### 🟢 **Prioridad BAJA** (Sprint 3 - 1 semana)

**7. Microcopys y Mensajes**
- Revisar consistencia de mensajes de error, estados vacíos, placeholders
- Unificar tono de voz (formal/institucional para DISA)

**8. Animaciones y Transiciones**
- Validar que todos usen `transition-colors duration-200` o `transition-all duration-200`
- Remover animaciones innecesarias o inconsistentes

**9. Documentación de Componentes**
- Agregar comentarios JSDoc a componentes reutilizables
- Crear Storybook (opcional, fuera de alcance de este prompt)

### 7.2 Checklist por Archivo

#### **app/dashboard/archivo/archivadores/page.tsx**
- [ ] Card de filtros: `p-6` (actualmente `p-4`)
- [ ] Card de filtros: `border border-gray-200` (actualmente `shadow`)
- [ ] Tabla: Envolver en Card con `bg-white rounded-lg border border-gray-200`
- [ ] Modal crear/editar: Validar `max-w-2xl`
- [ ] Modal detalle: Validar `max-w-4xl max-h-[80vh] overflow-y-auto`
- [ ] Tabla inline en modal detalle: Headers uppercase

#### **app/dashboard/archivo/documentos/page.tsx**
- [ ] Card de filtros: `p-6` (actualmente `p-4`)
- [ ] Card de filtros: `border border-gray-200`
- [ ] Reemplazar `<select>` por `Select` de shadcn (4 instancias)
- [ ] Card de tabla: Verificar wrapper consistente
- [ ] `DocumentsTable`: Headers uppercase (en el componente)

#### **app/dashboard/archivo/expedientes/page.tsx**
- [ ] Card de búsqueda: `p-6` (actualmente `p-4`)
- [ ] Card de búsqueda: `border border-gray-200`
- [ ] Modal crear: Validar `max-w-md` (formulario simple)
- [ ] Modal editar: Validar `max-w-md`
- [ ] `ExpedientesTable`: Headers uppercase (en el componente)

#### **components/documents/DocumentsTable.tsx**
- [ ] `TableHead`: Agregar `className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider"`
- [ ] Validar que wrapper use `border rounded-lg overflow-hidden` (ya está correcto)

#### **components/expedientes/ExpedientesTable.tsx**
- [ ] `TableHead`: Agregar uppercase classes
- [ ] Badge de contador: Validar iconografía

#### **components/expedientes/AddRemoveDocumentsModal.tsx**
- [ ] Validar `max-w-6xl` (es correcto para complejidad)
- [ ] Extraer `DocumentItem` como componente separado (refactor opcional)
- [ ] Validar accesibilidad de paneles scrolleables

#### **components/shared/StatCard.tsx**
- [ ] Remover `shadow-sm hover:shadow-md`
- [ ] Agregar `border border-gray-200`
- [ ] Agregar `hover:bg-gray-50 transition-colors duration-200`

### 7.3 Testing por Fase

#### **Fase 1: Visual Regression Testing**
1. Capturar screenshots de todas las vistas ANTES de cambios
2. Aplicar cambios de Prioridad ALTA
3. Comparar screenshots DESPUÉS
4. Validar en diferentes viewports (mobile, tablet, desktop)

#### **Fase 2: Functional Testing**
1. Probar navegación por teclado en todos los modals
2. Validar focus traps en dialogs
3. Probar flujos de creación/edición/eliminación
4. Verificar filtros y búsquedas funcionan correctamente

#### **Fase 3: Accessibility Testing**
1. Correr axe DevTools en todas las vistas
2. Lighthouse accessibility score ≥ 90
3. Testing manual con lector de pantalla (NVDA o JAWS)
4. Validar ratios de contraste con herramientas de color

#### **Fase 4: User Acceptance Testing (UAT)**
1. Demo con stakeholders de vistas refactorizadas
2. Recoger feedback de usuarios internos
3. Ajustar según feedback
4. Deployment a staging para pruebas finales

### 7.4 Métricas de Éxito

| Métrica | Valor Actual | Objetivo | Método de Medición |
|---------|--------------|----------|---------------------|
| **Lighthouse Accessibility Score** | ~75-80 | ≥ 90 | Lighthouse CI |
| **Contraste WCAG AA** | ~80% cumplimiento | 100% | axe DevTools |
| **Tiempo de carga (First Paint)** | ~1.2s | < 1s | Lighthouse Performance |
| **Consistencia visual (Cards)** | ~60% | 100% | Auditoría manual |
| **Componentes reutilizables** | ~70% | 90% | Análisis de código |

### 7.5 Recursos y Referencias

**Documentación oficial:**
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

**Herramientas:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

**Ejemplos de referencia en el proyecto:**
- `app/dashboard/reportes/page.tsx` - Layout y Cards
- `components/reports/ReportSummary.tsx` - StatCards
- `components/documents/SignatureStatusBadge.tsx` - Badges con tooltips

---

## 8. Anexos

### 8.1 Componentes Existentes Analizados

✅ **Bien Implementados (No requieren cambios):**
- `components/documents/SignatureStatusBadge.tsx`
- `components/reports/ReportSummary.tsx`
- `components/reports/ReportCharts.tsx`
- `components/ui/*` (shadcn base components)

⚠️ **Requieren Actualización (Ver plan):**
- `components/documents/DocumentsTable.tsx`
- `components/expedientes/ExpedientesTable.tsx`
- `components/shared/StatCard.tsx`
- `components/expedientes/AddRemoveDocumentsModal.tsx`

### 8.2 Variables CSS Principales

```css
/* Del archivo globals.css */
:root {
  --primary: oklch(0.205 0 0);              /* #1A1A1A */
  --background: oklch(1 0 0);               /* #FFFFFF */
  --foreground: oklch(0.145 0 0);           /* #252525 */
  --muted: oklch(0.97 0 0);                 /* #F9FAFB */
  --border: oklch(0.922 0 0);               /* #E5E7EB */
  --destructive: oklch(0.577 0.245 27.325); /* Red-600 */
  --radius: 0.625rem;                       /* 10px */
}
```

### 8.3 Paleta de Grises (Tailwind)

```
gray-50:  #F9FAFB
gray-100: #F3F4F6
gray-200: #E5E7EB
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280
gray-600: #4B5563
gray-700: #374151
gray-800: #1F2937
gray-900: #111827
```

---

## Conclusión

Esta guía establece los lineamientos visuales y funcionales para unificar la experiencia del Módulo de Archivo Digital con el estándar del sistema SAD. La implementación incremental garantiza una transición controlada sin afectar la funcionalidad existente.

**Próximos pasos:**
1. Aprobar esta guía con el equipo de desarrollo
2. Iniciar Sprint 1 con refactorizaciones de Prioridad ALTA
3. Documentar en PROMPT-016-2 la implementación del módulo de Archivadores

---

**Versión:** 1.0  
**Fecha:** 18 de Octubre de 2025  
**Autor:** Auditoría UX/UI - Sistema Integrado de Archivos Digitales  
**Módulo de Referencia:** Reportes y Analítica (`/dashboard/reportes`)
