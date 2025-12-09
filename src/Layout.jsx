import React, { useState, useEffect, createContext, useContext } from "react";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, LogOut, Home, Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Theme Context
const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });
const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Language Context
const LanguageContext = createContext({ language: "en", setLanguage: () => {}, t: (key) => key });
const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    "nav.analyzer": "Analyzer",
    "nav.trading": "Trading",
    "nav.home": "Home",
    "nav.signOut": "Sign Out",
    "common.loading": "Loading...",
  },
  es: {
    "nav.analyzer": "Analizador",
    "nav.trading": "Trading",
    "nav.home": "Inicio",
    "nav.signOut": "Cerrar Sesión",
    "common.loading": "Cargando...",
  },
  fr: {
    "nav.analyzer": "Analyseur",
    "nav.trading": "Trading",
    "nav.home": "Accueil",
    "nav.signOut": "Se Déconnecter",
    "common.loading": "Chargement...",
  },
  ar: {
    "nav.analyzer": "المحلل",
    "nav.trading": "التداول",
    "nav.home": "الرئيسية",
    "nav.signOut": "تسجيل الخروج",
    "common.loading": "جاري التحميل...",
  },
};

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") || "en";
    }
    return "en";
  });

  const t = (key) => translations[language]?.[key] || key;

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

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isHomePage = currentPageName === "Home";
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isHomePage) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18191A] via-[#242526] to-[#18191A] dark:from-[#18191A] dark:via-[#242526] dark:to-[#18191A] bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <div className="w-8 h-8 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18191A] via-[#242526] to-[#18191A] dark:from-[#18191A] dark:via-[#242526] dark:to-[#18191A] bg-white">
        <nav className="bg-[#242526] dark:bg-[#242526] bg-white/80 backdrop-blur border-b border-slate-700 dark:border-slate-700 border-slate-200 sticky top-0 z-50 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <Link to={createPageUrl("Home")} className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">TradeSense AI</span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Languages className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-[#242526] border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3A3B3C] cursor-pointer ${
                          language === lang.code ? "bg-[#1877F2]/10" : ""
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  onClick={async () => {
                    try {
                      await User.redirectToLogin(createPageUrl("Analyzer"));
                    } catch (error) {
                      console.error("Login error:", error);
                    }
                  }}
                  className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] shadow-lg"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18191A] via-[#242526] to-[#18191A] flex flex-col">
      {/* Navigation */}
      <nav className="bg-[#242526] backdrop-blur border-b border-slate-700 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to={createPageUrl("Analyzer")} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1877F2] to-[#0866FF] rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#1877F2] to-[#0866FF] bg-clip-text text-transparent">TradeSense AI</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2">
                <Link 
                  to={createPageUrl("Analyzer")}
                  className={`px-4 py-2 rounded-full transition-all duration-300 font-semibold ${
                    currentPageName === "Analyzer" 
                      ? "bg-gradient-to-r from-[#1877F2] to-[#0866FF] text-white shadow-lg shadow-[#1877F2]/30" 
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {t("nav.analyzer")}
                </Link>
                <Link 
                  to={createPageUrl("Trading")}
                  className={`px-4 py-2 rounded-full transition-all duration-300 font-semibold ${
                    currentPageName === "Trading" 
                      ? "bg-gradient-to-r from-[#1877F2] to-[#0866FF] text-white shadow-lg shadow-[#1877F2]/30" 
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {t("nav.trading")}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Languages className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-[#242526] border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3A3B3C] cursor-pointer ${
                          language === lang.code ? "bg-[#1877F2]/10" : ""
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-slate-200 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600/50 rounded-full shadow-lg transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center text-white font-bold mr-2">
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <span className="hidden sm:inline">{user.full_name || user.email}</span>
                      <span className="sm:hidden">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-[#242526] border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl">
                    <DropdownMenuItem 
                      asChild
                      className="text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3A3B3C] cursor-pointer rounded-lg transition-colors"
                    >
                      <Link to={createPageUrl("Home")}>
                        <Home className="w-4 h-4 mr-2 text-[#1877F2]" />
                        {t("nav.home")}
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />

                    <DropdownMenuItem onClick={handleLogout} className="text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3A3B3C] cursor-pointer rounded-lg transition-colors">
                      <LogOut className="w-4 h-4 mr-2 text-red-400" />
                      {t("nav.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white dark:bg-[#242526] backdrop-blur border-t border-slate-200 dark:border-slate-700/50 mt-auto shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center shadow-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">© 2024 TradeSense AI. All rights reserved.</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                ⚠️ <strong className="text-[#1877F2]">Disclaimer:</strong> TradeSense AI is not a financial expert or advisor.
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                We are not liable for any trading losses. Always conduct your own research and trade responsibly.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </LanguageProvider>
    </ThemeProvider>
  );
}