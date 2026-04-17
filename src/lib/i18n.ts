export type Lang = "es" | "en";

export const translations = {
  es: {
    nav: {
      analyze: "Analizar CV",
    },
    home: {
      badge: "Beta gratuita · Sin registro",
      headline1: "Tu CV tiene que hablar por ti.",
      headline2: "Asegurémonos de que lo haga.",
      subtitle:
        "Sube tu hoja de vida, pega la oferta y te decimos exactamente qué mejorar para tener más chances.",
      stat1Value: "73%",
      stat1Label: "de CVs no pasan el filtro ATS",
      stat2Value: "3 min",
      stat2Label: "para obtener tu análisis",
      cta: "Analizar mi CV →",
      subCta: "Sin registro · Sin tarjeta · 100% gratis",
    },
    analyze: {
      title: "Sube tu información",
      uploadTitle: "Arrastra tu CV aquí",
      uploadSub: "o haz click para seleccionar · Solo PDF",
      jobTitlePlaceholder: "Nombre del cargo — ej: Desarrollador Frontend",
      jobDescPlaceholder: "Pega aquí la descripción completa de la oferta...",
      analyzeBtn: "Analizar mi CV →",
      analyzing: "Analizando tu CV...",
      emptyState: "Tu análisis aparecerá aquí",
      scoreLabel: "sobre 100 puntos",
    },
    upload: {
      drag: "Arrastra tu CV aquí",
      sub: "o haz click para seleccionar · Solo PDF",
    },
    badges: {
      critical: "Crítico",
      improve: "Mejorar",
      good: "Bien",
    },
  },
  en: {
    nav: {
      analyze: "Analyze CV",
    },
    home: {
      badge: "Free beta · No signup",
      headline1: "Your CV needs to speak for you.",
      headline2: "Let's make sure it does.",
      subtitle:
        "Upload your resume, paste the job posting, and we'll tell you exactly what to improve to increase your chances.",
      stat1Value: "73%",
      stat1Label: "of CVs don't pass the ATS filter",
      stat2Value: "3 min",
      stat2Label: "to get your analysis",
      cta: "Analyze my CV →",
      subCta: "No signup · No card · 100% free",
    },
    analyze: {
      title: "Upload your information",
      uploadTitle: "Drag your CV here",
      uploadSub: "or click to select · PDF only",
      jobTitlePlaceholder: "Job title — e.g., Frontend Developer",
      jobDescPlaceholder: "Paste the full job description here...",
      analyzeBtn: "Analyze my CV →",
      analyzing: "Analyzing your CV...",
      emptyState: "Your analysis will appear here",
      scoreLabel: "out of 100 points",
    },
    upload: {
      drag: "Drag your CV here",
      sub: "or click to select · PDF only",
    },
    badges: {
      critical: "Critical",
      improve: "Improve",
      good: "Good",
    },
  },
} as const;
