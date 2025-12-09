import React, { createContext, useContext, useState } from "react";

const translations = {
  en: {
    // Navigation
    "nav.analyzer": "Analyzer",
    "nav.trading": "Trading",
    "nav.home": "Home",
    "nav.signOut": "Sign Out",
    
    // Analyzer
    "analyzer.title": "Professional Forex Analysis",
    "analyzer.subtitle": "Vision AI-Powered Multi-Timeframe Analysis with Advanced Confluence Detection",
    "analyzer.instrument": "Instrument/Symbol",
    "analyzer.primaryTimeframe": "Primary Timeframe",
    "analyzer.multiTimeframe": "Multi-Timeframe Analysis",
    "analyzer.currentPrice": "Current Price (Optional)",
    "analyzer.uploadChart": "Upload Chart",
    "analyzer.analyzing": "Analyzing Chart",
    "analyzer.uploadPrompt": "Drop your chart image here or click to browse",
    
    // Trading
    "trading.title": "Trading Dashboard",
    "trading.subtitle": "Manage your MT4/MT5 accounts and monitor trades",
    "trading.totalAccounts": "Total Accounts",
    "trading.openTrades": "Open Trades",
    "trading.totalProfit": "Total P/L",
    "trading.winRate": "Win Rate",
    
    // Common
    "common.loading": "Loading...",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
  },
  es: {
    // Navigation
    "nav.analyzer": "Analizador",
    "nav.trading": "Trading",
    "nav.home": "Inicio",
    "nav.signOut": "Cerrar Sesión",
    
    // Analyzer
    "analyzer.title": "Análisis Profesional de Forex",
    "analyzer.subtitle": "Análisis Multi-Temporal Impulsado por IA de Visión con Detección Avanzada de Confluencia",
    "analyzer.instrument": "Instrumento/Símbolo",
    "analyzer.primaryTimeframe": "Marco Temporal Principal",
    "analyzer.multiTimeframe": "Análisis Multi-Temporal",
    "analyzer.currentPrice": "Precio Actual (Opcional)",
    "analyzer.uploadChart": "Subir Gráfico",
    "analyzer.analyzing": "Analizando Gráfico",
    "analyzer.uploadPrompt": "Suelta tu imagen de gráfico aquí o haz clic para navegar",
    
    // Trading
    "trading.title": "Panel de Trading",
    "trading.subtitle": "Gestiona tus cuentas MT4/MT5 y monitorea operaciones",
    "trading.totalAccounts": "Cuentas Totales",
    "trading.openTrades": "Operaciones Abiertas",
    "trading.totalProfit": "Ganancia/Pérdida Total",
    "trading.winRate": "Tasa de Ganancia",
    
    // Common
    "common.loading": "Cargando...",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.close": "Cerrar",
  },
  fr: {
    // Navigation
    "nav.analyzer": "Analyseur",
    "nav.trading": "Trading",
    "nav.home": "Accueil",
    "nav.signOut": "Se Déconnecter",
    
    // Analyzer
    "analyzer.title": "Analyse Professionnelle Forex",
    "analyzer.subtitle": "Analyse Multi-Temporelle Alimentée par IA de Vision avec Détection Avancée de Confluence",
    "analyzer.instrument": "Instrument/Symbole",
    "analyzer.primaryTimeframe": "Période Principale",
    "analyzer.multiTimeframe": "Analyse Multi-Temporelle",
    "analyzer.currentPrice": "Prix Actuel (Optionnel)",
    "analyzer.uploadChart": "Télécharger le Graphique",
    "analyzer.analyzing": "Analyse du Graphique",
    "analyzer.uploadPrompt": "Déposez votre image de graphique ici ou cliquez pour parcourir",
    
    // Trading
    "trading.title": "Tableau de Bord Trading",
    "trading.subtitle": "Gérez vos comptes MT4/MT5 et surveillez les transactions",
    "trading.totalAccounts": "Comptes Totaux",
    "trading.openTrades": "Transactions Ouvertes",
    "trading.totalProfit": "Profit/Perte Total",
    "trading.winRate": "Taux de Gain",
    
    // Common
    "common.loading": "Chargement...",
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.close": "Fermer",
  },
  ar: {
    // Navigation
    "nav.analyzer": "المحلل",
    "nav.trading": "التداول",
    "nav.home": "الرئيسية",
    "nav.signOut": "تسجيل الخروج",
    
    // Analyzer
    "analyzer.title": "تحليل فوركس احترافي",
    "analyzer.subtitle": "تحليل متعدد الأطر الزمنية مدعوم بالذكاء الاصطناعي مع كشف التقارب المتقدم",
    "analyzer.instrument": "الأداة/الرمز",
    "analyzer.primaryTimeframe": "الإطار الزمني الأساسي",
    "analyzer.multiTimeframe": "التحليل متعدد الأطر الزمنية",
    "analyzer.currentPrice": "السعر الحالي (اختياري)",
    "analyzer.uploadChart": "تحميل الرسم البياني",
    "analyzer.analyzing": "تحليل الرسم البياني",
    "analyzer.uploadPrompt": "أسقط صورة الرسم البياني هنا أو انقر للتصفح",
    
    // Trading
    "trading.title": "لوحة التداول",
    "trading.subtitle": "إدارة حسابات MT4/MT5 ومراقبة الصفقات",
    "trading.totalAccounts": "إجمالي الحسابات",
    "trading.openTrades": "الصفقات المفتوحة",
    "trading.totalProfit": "إجمالي الربح/الخسارة",
    "trading.winRate": "نسبة الفوز",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.close": "إغلاق",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") || "en";
    }
    return "en";
  });

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}