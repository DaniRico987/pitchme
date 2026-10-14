# PitchMe - CV Analyzer for ATS Optimization

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> **PitchMe** helps job seekers optimize their CVs against specific job descriptions to pass ATS (Applicant Tracking System) filters and land more interviews.

---

## 🇬🇧 English Version

## 🎯 Features

### Core Analysis

- **ATS Simulation** - Simulates how Applicant Tracking Systems read and score your CV
- **Keyword Gap Analysis** - Compares your CV against job descriptions to identify missing, matching, and extra keywords
- **Section-by-Section Scoring** - Detailed breakdown by CV sections (Experience, Skills, Education, etc.)
- **Actionable Suggestions** - Specific, rewrite-ready recommendations for each section

### User Experience

- **3-Step Flow** - Upload CV → Paste Job Description → Get Analysis
- **Progress Tracker** - Visual stepper showing completion status
- **Sticky Input Panel** - Input form stays visible while scrolling results (desktop)
- **Expandable History** - Click any past analysis to view full details
- **Mobile-First Responsive** - Works seamlessly on all device sizes

### Data & Export

- **Local Persistence** - Last analysis saved in localStorage (24h)
- **Cloud Sync** - Authenticated users get full history synced to Supabase
- **PDF Export** - Professional branded reports with score, keywords, and suggestions
- **Delete History** - Remove individual analyses from cloud

### Authentication

- **Magic Link Auth** - Passwordless email authentication via Supabase
- **Session Persistence** - Auto-refresh tokens, secure storage
- **Protected Routes** - Auth-gated pages (Analyze, History)

## 🛠 Tech Stack

| Category          | Technology                                |
| ----------------- | ----------------------------------------- |
| **Frontend**      | React 18, TypeScript 5, Vite 5            |
| **Styling**       | TailwindCSS 3, CSS Variables              |
| **Routing**       | React Router v7 (createBrowserRouter)     |
| **State**         | React Context + Hooks                     |
| **Backend**       | Supabase (Auth, Database, Edge Functions) |
| **PDF**           | @react-pdf/renderer, pdf.js (Web Worker)  |
| **Observability** | Sentry (error tracking), Custom Logger    |
| **Testing**       | Vitest, React Testing Library             |
| **PWA**           | Workbox (offline, caching, installable)   |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (for auth & database)
- Groq API key (for AI analysis)

### Installation

```bash
# Clone and install
git clone https://github.com/DaniRico987/pitchme.git
cd pitchme
npm install

# Environment variables
cp .env.example .env
# Edit .env with your keys:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_GROQ_API_KEY=your_groq_key
# VITE_SENTRY_DSN=your_sentry_dsn (optional)

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint & Format
npm run lint
npm run format
```

### Supabase Setup

Run these migrations in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  cv_text TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);
```

## 📁 Project Structure

```
src/
├── components/
│   ├── analyzer/
│   │   ├── AnalysisResult.tsx    # Results display (score, keywords, sections)
│   │   ├── JobDescInput.tsx      # Job title + description input
│   │   ├── PDFReport.tsx         # Professional PDF export
│   │   └── UploadZone.tsx        # Drag-drop PDF upload with progress
│   ├── layout/
│   │   └── Header.tsx            # Navigation with auth state
│   └── ui/
│       ├── Badge.tsx             # Status badges (Critical/Improve/Good)
│       ├── Button.tsx            # Primary/Secondary/Ghost/Outline + sizes
│       └── ErrorBoundary.tsx     # Class-based error boundary with retry
├── context/
│   ├── AuthContext.tsx           # Supabase auth + session management
│   ├── LangContext.tsx           # i18n (ES/EN) with localStorage + browser detection
│   └── ToastContext.tsx          # Toast notifications (success/error)
├── hooks/
│   ├── useAnalyzer.ts            # Main analysis logic + Supabase save
│   ├── useAnalyzer.test.tsx      # Unit tests
│   ├── usePdfExtractor.ts        # Web Worker PDF text extraction
│   └── usePdfExtractor.test.ts   # Tests for PDF extraction
├── lib/
│   ├── claude.ts                 # Groq API integration for CV analysis
│   ├── i18n.ts                   # Translations (ES/EN)
│   ├── logger.ts                 # Structured logging
│   ├── sentry.ts                 # Sentry error tracking
│   └── supabase.ts               # Supabase client + helpers
├── pages/
│   ├── Analyze.tsx               # Main analysis page (3-step flow)
│   ├── AuthCallback.tsx          # Supabase magic link callback
│   ├── History.tsx               # Past analyses with expandable cards
│   └── Home.tsx                  # Landing page with hero, features, stats
├── types/
│   └── index.ts                  # TypeScript types (AnalysisRecord, KeywordGap, etc.)
├── workers/
│   └── pdfExtractor.worker.ts    # pdf.js Web Worker for text extraction
└── main.tsx                      # App entry + Sentry + PWA registration
```

## 🔐 Environment Variables

| Variable                 | Required | Description                   |
| ------------------------ | -------- | ----------------------------- |
| `VITE_SUPABASE_URL`      | Yes      | Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anon public key      |
| `VITE_GROQ_API_KEY`      | Yes      | Groq API key for AI analysis  |
| `VITE_SENTRY_DSN`        | No       | Sentry DSN for error tracking |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Preview locally
npm run preview

# Deploy to Vercel (auto on push to main)
# 1. Connect repo to Vercel
# 2. Add environment variables
# 3. Deploy
```

## 📱 PWA Features

- **Offline Support** - Cached assets work offline
- **Installable** - Add to home screen on mobile/desktop
- **Auto-Update** - Service worker checks for updates
- **Caching Strategy** - Network-first for API, cache-first for static assets

## ♿ Accessibility

- Semantic HTML5 structure
- ARIA labels & live regions
- Focus-visible outlines for keyboard nav
- Color contrast ratios (WCAG AA)
- Screen reader support (progress, errors, dynamic content)
- Focus management in modals/accordions

## 🌐 Internationalization

- **Spanish (ES)** - Default
- **English (EN)** - Full translation
- Auto-detect browser language
- Persist selection in localStorage

## 📊 Performance

- **Code Splitting** - Lazy-loaded pages (Analyze, History, AuthCallback)
- **Web Workers** - PDF extraction off main thread
- **Lazy Images** - Native loading="lazy"
- **Bundle Analysis** - `npm run build -- --mode analyze`

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push branch (`git push origin feat/amazing-feature`)
5. Open Pull Request

### Pre-commit Hooks

- ESLint + Prettier auto-fix
- TypeScript type checking
- Test suite execution

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [Groq](https://groq.com/) - Fast AI inference
- [pdf.js](https://mozilla.github.io/pdf.js/) - PDF text extraction
- [Lucide](https://lucide.dev/) - Beautiful icons
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS

---

---

## 🇪🇸 Versión en Español

## 🎯 Características

### Análisis Principal

- **Simulación ATS** - Simula cómo los sistemas ATS leen y puntúan tu CV
- **Análisis de Brecha de Palabras Clave** - Compara tu CV contra ofertas para identificar keywords faltantes, coincidentes y extra
- **Puntuación por Secciones** - Desglose detallado por secciones (Experiencia, Habilidades, Educación, etc.)
- **Sugerencias Accionables** - Recomendaciones específicas y listas para reescribir por sección

### Experiencia de Usuario

- **Flujo de 3 Pasos** - Sube CV → Pega Oferta → Obtén Análisis
- **Seguimiento de Progreso** - Stepper visual con estado de completado
- **Panel Fijo** - Formulario visible al hacer scroll (desktop)
- **Historial Expandible** - Click para ver detalles completos
- **Mobile-First** - Funciona en todos los dispositivos

### Datos y Exportación

- **Persistencia Local** - Último análisis guardado 24h
- **Sincronización en la Nube** - Historial completo sincronizado
- **Exportación PDF** - Reportes profesionales con marca
- **Eliminar Historial** - Eliminar análisis individuales

### Autenticación

- **Magic Link** - Autenticación sin contraseña vía Supabase
- **Persistencia de Sesión** - Tokens auto-renovables, almacenamiento seguro
- **Rutas Protegidas** - Páginas con autenticación requerida

## 🛠 Pila Tecnológica

| Categoría          | Tecnología                                |
| ------------------ | ----------------------------------------- |
| **Frontend**       | React 18, TypeScript 5, Vite 5            |
| **Estilos**        | TailwindCSS 3, CSS Variables              |
| **Routing**        | React Router v7 (createBrowserRouter)     |
| **Estado**         | React Context + Hooks                     |
| **Backend**        | Supabase (Auth, Database, Edge Functions) |
| **PDF**            | @react-pdf/renderer, pdf.js (Web Worker)  |
| **Observabilidad** | Sentry (error tracking), Custom Logger    |
| **Testing**        | Vitest, React Testing Library             |
| **PWA**            | Workbox (offline, caching, installable)   |

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- Cuenta Supabase (auth y BD)
- Groq API key (análisis IA)

### Instalación

```bash
# Clonar e instalar
git clone https://github.com/DaniRico987/pitchme.git
cd pitchme
npm install

# Variables de entorno
cp .env.example .env
# Edita .env con tus claves:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_GROQ_API_KEY=your_groq_key
# VITE_SENTRY_DSN=your_sentry_dsn (optional)

# Desarrollo
npm run dev

# Construcción
npm run build

# Vista previa producción
npm run preview

# Ejecutar tests
npm run test

# Lint y Formato
npm run lint
npm run format
```

### Configuración Supabase

Ejecuta estas migraciones en el Editor SQL de Supabase:

```sql
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de análisis
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  cv_text TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- Habilitar RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── analyzer/
│   │   ├── AnalysisResult.tsx    # Resultados
│   │   ├── JobDescInput.tsx      # Título + descripción
│   │   ├── PDFReport.tsx         # Exportación PDF profesional
│   │   └── UploadZone.tsx        # Subida PDF drag-drop
│   ├── layout/
│   │   └── Header.tsx            # Navegación con auth
│   └── ui/
│       ├── Badge.tsx             # Badges estado
│       ├── Button.tsx            # Botones
│       └── ErrorBoundary.tsx     # Límite de error
├── context/
│   ├── AuthContext.tsx           # Auth + sesión
│   ├── LangContext.tsx           # i18n (ES/EN)
│   └── ToastContext.tsx          # Notificaciones
├── hooks/
│   ├── useAnalyzer.ts            # Lógica análisis
│   ├── useAnalyzer.test.tsx      # Tests unitarios
│   ├── usePdfExtractor.ts        # Extracción PDF
│   └── usePdfExtractor.test.ts   # Tests extracción
├── lib/
│   ├── claude.ts                 # Integración Groq
│   ├── i18n.ts                   # Traducciones
│   ├── logger.ts                 # Logging estructurado
│   ├── sentry.ts                 # Tracking errores
│   └── supabase.ts               # Cliente Supabase
├── pages/
│   ├── Analyze.tsx               # Página análisis
│   ├── AuthCallback.tsx          # Callback magic link
│   ├── History.tsx               # Historial
│   └── Home.tsx                  # Landing
├── types/
│   └── index.ts                  # Tipos TS
├── workers/
│   └── pdfExtractor.worker.ts    # Worker PDF
└── main.tsx                      # Entrada app
```

## 🔐 Variables de Entorno

| Variable                 | Requerida | Descripción             |
| ------------------------ | --------- | ----------------------- |
| `VITE_SUPABASE_URL`      | Sí        | URL proyecto Supabase   |
| `VITE_SUPABASE_ANON_KEY` | Sí        | Clave pública anon      |
| `VITE_GROQ_API_KEY`      | Sí        | Clave Groq para IA      |
| `VITE_SENTRY_DSN`        | No        | DSN Sentry para errores |

## 🧪 Pruebas

```bash
# Ejecutar todos los tests
npm run test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

## 📦 Construcción y Despliegue

```bash
# Construcción producción
npm run build

# Vista previa local
npm run preview

# Desplegar en Vercel (auto en push a main)
# 1. Conectar repo a Vercel
# 2. Añadir variables de entorno
# 3. Desplegar
```

## 📱 Características PWA

- **Soporte Offline** - Assets en caché funcionan offline
- **Instalable** - Añadir a pantalla inicio
- **Auto-Actualización** - SW verifica actualizaciones
- **Estrategia Caché** - Network-first API, cache-first estáticos

## ♿ Accesibilidad

- HTML5 semántico
- Labels ARIA y regiones live
- Contornos focus-visible navegación teclado
- Contraste colores (WCAG AA)
- Soporte lectores pantalla
- Gestión foco modales/acordeones

## 🌐 Internacionalización

- **Español (ES)** - Por defecto
- **English (EN)** - Traducción completa
- Auto-detectar idioma navegador
- Persistir selección en localStorage

## 📊 Rendimiento

- **Code Splitting** - Páginas lazy-loaded
- **Web Workers** - Extracción PDF fuera hilo principal
- **Imágenes Lazy** - Carga nativa lazy
- **Análisis Bundle** - `npm run build -- --mode analyze`

## 🤝 Contribuir

1. Fork del repo
2. Crear rama feature (`git checkout -b feat/amazing-feature`)
3. Commit cambios (`git commit -m 'feat: add amazing feature'`)
4. Push rama (`git push origin feat/amazing-feature`)
5. Abrir Pull Request

### Pre-commit Hooks

- ESLint + Prettier auto-fix
- Verificación tipos TypeScript
- Ejecución suite tests

## 📄 Licencia

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Agradecimientos

- [Supabase](https://supabase.com/) - Infraestructura backend
- [Groq](https://groq.com/) - Inferencia IA rápida
- [pdf.js](https://mozilla.github.io/pdf.js/) - Extracción texto PDF
- [Lucide](https://lucide.dev/) - Iconos bonitos
- [TailwindCSS](https://tailwindcss.com/) - CSS utility-first
