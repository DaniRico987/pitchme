# PitchMe - CV Analyzer for ATS Optimization / Analizador de CV para Optimización ATS

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> **PitchMe** helps job seekers optimize their CVs against specific job descriptions to pass ATS (Applicant Tracking System) filters and land more interviews.
>
> **PitchMe** ayuda a los candidatos a optimizar sus CVs contra ofertas de empleo específicas para pasar los filtros ATS (Sistemas de Seguimiento de Candidatos) y conseguir más entrevistas.

---

## 🎯 Features / Características

### Core Analysis / Análisis Principal

- **ATS Simulation** / **Simulación ATS** - Simulates how Applicant Tracking Systems read and score your CV / Simula cómo los sistemas ATS leen y puntúan tu CV
- **Keyword Gap Analysis** / **Análisis de Brecha de Palabras Clave** - Compares your CV against job descriptions to identify missing, matching, and extra keywords / Compara tu CV contra ofertas para identificar keywords faltantes, coincidentes y extra
- **Section-by-Section Scoring** / **Puntuación por Secciones** - Detailed breakdown by CV sections (Experience, Skills, Education, etc.) / Desglose detallado por secciones (Experiencia, Habilidades, Educación, etc.)
- **Actionable Suggestions** / **Sugerencias Accionables** - Specific, rewrite-ready recommendations for each section / Recomendaciones específicas y listas para reescribir por sección

### User Experience / Experiencia de Usuario

- **3-Step Flow** / **Flujo de 3 Pasos** - Upload CV → Paste Job Description → Get Analysis / Sube CV → Pega Oferta → Obtén Análisis
- **Progress Tracker** / **Seguimiento de Progreso** - Visual stepper showing completion status / Stepper visual con estado de completado
- **Sticky Input Panel** / **Panel Fijo** - Input form stays visible while scrolling results (desktop) / Formulario visible al hacer scroll (desktop)
- **Expandable History** / **Historial Expandible** - Click any past analysis to view full details / Click para ver detalles completos
- **Mobile-First Responsive** / **Mobile-First** - Works seamlessly on all device sizes / Funciona en todos los dispositivos

### Data & Export / Datos y Exportación

- **Local Persistence** / **Persistencia Local** - Last analysis saved in localStorage (24h) / Último análisis guardado 24h
- **Cloud Sync** / **Sincronización en la Nube** - Authenticated users get full history synced to Supabase / Historial completo sincronizado
- **PDF Export** / **Exportación PDF** - Professional branded reports / Reportes profesionales con marca
- **Delete History** / **Eliminar Historial** - Remove individual analyses from cloud / Eliminar análisis individuales

### Authentication / Autenticación

- **Magic Link Auth** / **Magic Link** - Passwordless email authentication via Supabase / Autenticación sin contraseña
- **Session Persistence** / **Persistencia de Sesión** - Auto-refresh tokens, secure storage / Tokens auto-renovables, almacenamiento seguro
- **Protected Routes** / **Rutas Protegidas** - Auth-gated pages (Analyze, History) / Páginas con autenticación requerida

---

## 🛠 Tech Stack / Pila Tecnológica

| Category / Categoría | Technology / Tecnología                   |
| -------------------- | ----------------------------------------- |
| **Frontend**         | React 18, TypeScript 5, Vite 5            |
| **Styling**          | TailwindCSS 3, CSS Variables              |
| **Routing**          | React Router v7 (createBrowserRouter)     |
| **State**            | React Context + Hooks                     |
| **Backend**          | Supabase (Auth, Database, Edge Functions) |
| **PDF**              | @react-pdf/renderer, pdf.js (Web Worker)  |
| **Observability**    | Sentry (error tracking), Custom Logger    |
| **Testing**          | Vitest, React Testing Library             |
| **PWA**              | Workbox (offline, caching, installable)   |

---

## 🚀 Quick Start / Inicio Rápido

### Prerequisites / Requisitos

- Node.js 18+
- Supabase account (for auth & database) / Cuenta Supabase (auth y BD)
- Groq API key (for AI analysis) / Clave Groq API (análisis IA)

### Installation / Instalación

```bash
# Clone and install / Clonar e instalar
git clone https://github.com/DaniRico987/pitchme.git
cd pitchme
npm install

# Environment variables / Variables de entorno
cp .env.example .env
# Edit .env with your keys / Edita .env con tus claves:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_GROQ_API_KEY=your_groq_key
# VITE_SENTRY_DSN=your_sentry_dsn (optional)

# Development / Desarrollo
npm run dev

# Build / Construcción
npm run build

# Preview production build / Vista previa producción
npm run preview

# Run tests / Ejecutar tests
npm run test

# Lint & Format / Lint y Formato
npm run lint
npm run format
```

### Supabase Setup / Configuración Supabase

Run these migrations in Supabase SQL Editor / Ejecuta estas migraciones en el Editor SQL de Supabase:

```sql
-- Enable UUID extension / Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analyses table / Tabla de análisis
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  cv_text TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance / Índices para rendimiento
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- Enable RLS / Habilitar RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policies / Políticas
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 📁 Project Structure / Estructura del Proyecto

```
src/
├── components/
│   ├── analyzer/
│   │   ├── AnalysisResult.tsx    # Results display (score, keywords, sections) / Resultados
│   │   ├── JobDescInput.tsx      # Job title + description input / Título + descripción
│   │   ├── PDFReport.tsx         # Professional PDF export / Exportación PDF profesional
│   │   └── UploadZone.tsx        # Drag-drop PDF upload with progress / Subida PDF drag-drop
│   ├── layout/
│   │   └── Header.tsx            # Navigation with auth state / Navegación con auth
│   └── ui/
│       ├── Badge.tsx             # Status badges (Critical/Improve/Good) / Badges estado
│       ├── Button.tsx            # Primary/Secondary/Ghost/Outline + sizes / Botones
│       └── ErrorBoundary.tsx     # Class-based error boundary with retry / Límite de error
├── context/
│   ├── AuthContext.tsx           # Supabase auth + session management / Auth + sesión
│   ├── LangContext.tsx           # i18n (ES/EN) with localStorage + browser detection / i18n
│   └── ToastContext.tsx          # Toast notifications (success/error) / Notificaciones
├── hooks/
│   ├── useAnalyzer.ts            # Main analysis logic + Supabase save / Lógica análisis
│   ├── useAnalyzer.test.tsx      # Unit tests / Tests unitarios
│   ├── usePdfExtractor.ts        # Web Worker PDF text extraction / Extracción PDF
│   └── usePdfExtractor.test.ts   # Tests for PDF extraction / Tests extracción
├── lib/
│   ├── claude.ts                 # Groq API integration for CV analysis / Integración Groq
│   ├── i18n.ts                   # Translations (ES/EN) / Traducciones
│   ├── logger.ts                 # Structured logging / Logging estructurado
│   ├── sentry.ts                 # Sentry error tracking / Tracking errores
│   └── supabase.ts               # Supabase client + helpers / Cliente Supabase
├── pages/
│   ├── Analyze.tsx               # Main analysis page (3-step flow) / Página análisis
│   ├── AuthCallback.tsx          # Supabase magic link callback / Callback magic link
│   ├── History.tsx               # Past analyses with expandable cards / Historial
│   └── Home.tsx                  # Landing page with hero, features, stats / Landing
├── types/
│   └── index.ts                  # TypeScript types (AnalysisRecord, KeywordGap, etc.) / Tipos TS
├── workers/
│   └── pdfExtractor.worker.ts    # pdf.js Web Worker for text extraction / Worker PDF
└── main.tsx                      # App entry + Sentry + PWA registration / Entrada app
```

---

## 🔐 Environment Variables / Variables de Entorno

| Variable                 | Required / Requerida | Description / Descripción                               |
| ------------------------ | -------------------- | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Yes / Sí             | Supabase project URL / URL proyecto Supabase            |
| `VITE_SUPABASE_ANON_KEY` | Yes / Sí             | Supabase anon public key / Clave pública anon           |
| `VITE_GROQ_API_KEY`      | Yes / Sí             | Groq API key for AI analysis / Clave Groq para IA       |
| `VITE_SENTRY_DSN`        | No                   | Sentry DSN for error tracking / DSN Sentry para errores |

---

## 🧪 Testing / Pruebas

```bash
# Run all tests / Ejecutar todos los tests
npm run test

# Run tests in watch mode / Modo watch
npm run test:watch

# Run with coverage / Con cobertura
npm run test:coverage
```

---

## 📦 Build & Deploy / Construcción y Despliegue

```bash
# Production build / Construcción producción
npm run build

# Preview locally / Vista previa local
npm run preview

# Deploy to Vercel (auto on push to main) / Desplegar en Vercel (auto en push a main)
# 1. Connect repo to Vercel / Conectar repo a Vercel
# 2. Add environment variables / Añadir variables de entorno
# 3. Deploy / Desplegar
```

---

## 📱 PWA Features / Características PWA

- **Offline Support** / **Soporte Offline** - Cached assets work offline / Assets en caché funcionan offline
- **Installable** / **Instalable** - Add to home screen on mobile/desktop / Añadir a pantalla inicio
- **Auto-Update** / **Auto-Actualización** - Service worker checks for updates / SW verifica actualizaciones
- **Caching Strategy** / **Estrategia Caché** - Network-first for API, cache-first for static assets / Network-first API, cache-first estáticos

---

## ♿ Accessibility / Accesibilidad

- Semantic HTML5 structure / HTML5 semántico
- ARIA labels & live regions / Labels ARIA y regiones live
- Focus-visible outlines for keyboard nav / Contornos focus-visible navegación teclado
- Color contrast ratios (WCAG AA) / Contraste colores (WCAG AA)
- Screen reader support / Soporte lectores pantalla
- Focus management in modals/accordions / Gestión foco modales/acordeones

---

## 🌐 Internationalization / Internacionalización

- **Spanish (ES)** - Default / Por defecto
- **English (EN)** - Full translation / Traducción completa
- Auto-detect browser language / Auto-detectar idioma navegador
- Persist selection in localStorage / Persistir selección en localStorage

---

## 📊 Performance / Rendimiento

- **Code Splitting** / **Code Splitting** - Lazy-loaded pages (Analyze, History, AuthCallback) / Páginas lazy-loaded
- **Web Workers** / **Web Workers** - PDF extraction off main thread / Extracción PDF fuera hilo principal
- **Lazy Images** / **Imágenes Lazy** - Native loading="lazy" / Carga nativa lazy
- **Bundle Analysis** / **Análisis Bundle** - `npm run build -- --mode analyze`

---

## 🤝 Contributing / Contribuir

1. Fork the repo / Fork del repo
2. Create feature branch (`git checkout -b feat/amazing-feature`) / Crear rama feature
3. Commit changes (`git commit -m 'feat: add amazing feature'`) / Commit cambios
4. Push branch (`git push origin feat/amazing-feature`) / Push rama
5. Open Pull Request / Abrir Pull Request

### Pre-commit Hooks / Ganchos Pre-commit

- ESLint + Prettier auto-fix / Auto-fix ESLint + Prettier
- TypeScript type checking / Verificación tipos TypeScript
- Test suite execution / Ejecución suite tests

---

## 📄 License / Licencia

MIT License - see [LICENSE](LICENSE) for details. / Ver [LICENSE](LICENSE) para detalles.

---

## 🙏 Acknowledgments / Agradecimientos

- [Supabase](https://supabase.com/) - Backend infrastructure / Infraestructura backend
- [Groq](https://groq.com/) - Fast AI inference / Inferencia IA rápida
- [pdf.js](https://mozilla.github.io/pdf.js/) - PDF text extraction / Extracción texto PDF
- [Lucide](https://lucide.dev/) - Beautiful icons / Iconos bonitos
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS / CSS utility-first
