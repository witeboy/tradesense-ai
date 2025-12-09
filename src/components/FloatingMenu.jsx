import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Menu, 
  X, 
  HelpCircle, 
  BookOpen, 
  Settings, 
  LogIn,
  ChevronUp,
  Info,
  Target
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await base44.auth.redirectToLogin(window.location.href);
    } catch (error) {
      console.error("Login error:", error);
    }
    setIsLoading(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    } else {
      // If not on home page, navigate there first
      window.location.href = `${createPageUrl("Home")}#${sectionId}`;
    }
  };

  const menuItems = [
    {
      icon: LogIn,
      label: user ? "Go to Analyzer" : "Sign In / Sign Up",
      action: user ? () => window.location.href = createPageUrl("Analyzer") : handleSignIn,
      color: "from-blue-500 to-cyan-500",
      show: true
    },
    {
      icon: HelpCircle,
      label: "FAQ",
      action: () => scrollToSection("faq"),
      color: "from-purple-500 to-pink-500",
      show: true
    },
    {
      icon: BookOpen,
      label: "How It Works",
      action: () => scrollToSection("how-it-works"),
      color: "from-green-500 to-emerald-500",
      show: true
    },
    {
      icon: Settings,
      label: "Indicator Setup Guide",
      action: () => scrollToSection("setup-guide"),
      color: "from-orange-500 to-red-500",
      show: true
    },
    {
      icon: Target,
      label: "Features",
      action: () => scrollToSection("features"),
      color: "from-indigo-500 to-purple-500",
      show: true
    },
    {
      icon: Info,
      label: "About TradeSense AI",
      action: () => scrollToSection("hero"),
      color: "from-yellow-500 to-orange-500",
      show: true
    }
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-28 right-8 z-50"
            >
              <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
                  {/* Header */}
                  <div className="pb-3 border-b border-slate-700 mb-2">
                    <h3 className="text-white font-bold text-lg">Quick Access</h3>
                    <p className="text-slate-400 text-xs">Everything you need in one place</p>
                  </div>

                  {/* Menu Items */}
                  {visibleItems.map((item, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={item.action}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all duration-200 group"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-medium text-sm flex-1 text-left">
                        {item.label}
                      </span>
                      <ChevronUp className="w-4 h-4 text-slate-400 transform -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  ))}

                  {/* Footer Note */}
                  <div className="pt-3 border-t border-slate-700 mt-3">
                    <p className="text-slate-500 text-xs text-center">
                      TradeSense AI v1.0
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}