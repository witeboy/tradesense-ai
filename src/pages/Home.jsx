import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Shield,
  Brain,
  ChevronRight,
  CheckCircle2,
  Star,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  LineChart,
  Eye,
  Award,
  Menu,
  X,
  Home,
  HelpCircle,
  Activity, // Added for new Setup Guide section
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// FloatingMenu Component
const FloatingMenu = () => {
  const [activeSection, setActiveSection] = useState('hero'); // Default to hero

  const sections = [
    { id: 'hero', name: 'Home', icon: Home },
    { id: 'features', name: 'Features', icon: Zap },
    { id: 'how-it-works', name: 'How It Works', icon: Brain },
    { id: 'setup-guide', name: 'Setup', icon: CheckCircle2 },
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
    { id: 'testimonials', name: 'Testimonials', icon: Users },
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // When 50% of the viewport height passes the top/bottom of the element
      threshold: 0, // Trigger when any part of the target is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
      observer.disconnect();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-slate-700">
        <div className="space-y-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`block p-2 rounded-full transition-all duration-300
                ${activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              title={section.name}
            >
              <section.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};


export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleStartAnalyzing = async () => {
    if (!user) {
      // Redirect to login
      await base44.auth.redirectToLogin(createPageUrl("Analyzer"));
    } else {
      // Go directly to analyzer
      window.location.href = createPageUrl("Analyzer");
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Vision AI Chart Analysis",
      description: "Upload any chart image and our AI extracts precise technical indicators: EMAs, RSI, MACD, ADX, candlestick patterns, and more.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Confluence Scoring System",
      description: "Get exact 0-100% confluence scores based on EMA alignment (30%), ADX trend strength (20%), RSI momentum (20%), MACD (20%), and candlestick patterns (10%).",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: LineChart,
      title: "Multi-Timeframe Analysis",
      description: "Analyze multiple timeframes simultaneously to identify top-down confluence. Perfect for sniper entries on pullbacks.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Real-Time Fundamentals & News",
      description: "Aggregates news from ForexFactory, FXStreet, Reuters, Bloomberg, and more. Get net bias scores for informed decisions.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Automated Trade Plans",
      description: "Receive complete trade plans with entry, stop loss, take profit levels, lot sizing, and risk management - all calculated automatically.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Smart Alert System",
      description: "Set confluence threshold alerts (75%+ or 100%) and get notified when high-probability setups appear.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Upload Your Chart",
      description: "Take a screenshot of any trading chart with EMAs (20, 50, 200), RSI, MACD, and ADX visible. Upload it to TradeSense AI.",
      icon: Eye
    },
    {
      step: "2",
      title: "AI Extracts Indicators",
      description: "Our vision AI automatically reads and extracts exact values from your indicators - no manual data entry needed.",
      icon: Brain
    },
    {
      step: "3",
      title: "Get Confluence Score",
      description: "Receive your 0-100% confluence score showing how well all indicators align for a high-probability trade.",
      icon: Target
    },
    {
      step: "4",
      title: "Review Trade Plan",
      description: "Get complete entry, stop loss, take profit levels, lot size recommendations, and risk management notes.",
      icon: Award
    },
    {
      step: "5",
      title: "Execute with Confidence",
      description: "Trade with clarity knowing every indicator has been analyzed and you have a complete, rules-based plan.",
      icon: Sparkles
    }
  ];

  // The indicatorSetup object is removed as its content is now directly in JSX within the setup-guide section.

  const faqs = [
    {
      question: "What indicators does TradeSense AI analyze?",
      answer: "We analyze EMA 20/50/200 alignment, ADX trend strength, RSI momentum, MACD confirmation, and candlestick patterns. All indicators are weighted and combined into a single confluence score."
    },
    {
      question: "How accurate is the vision AI?",
      answer: "Our vision AI is trained to extract precise numeric values from chart images with high accuracy. It reads indicator lines, candles, and price levels just like a human trader would."
    },
    {
      question: "What timeframes can I analyze?",
      answer: "All timeframes from M1 to D1 are supported. You can analyze multiple timeframes simultaneously for top-down confluence analysis."
    },
    {
      question: "Do I need to connect my trading account?",
      answer: "No! TradeSense AI is a pure analysis tool. You review the analysis and execute trades manually on your preferred platform."
    },
    {
      question: "What happens if confluence is below 70%?",
      answer: "The system will recommend waiting for a better setup. Trading only high-confluence setups (70%+) dramatically improves win rates."
    },
    {
      question: "Can I analyze forex, indices, and commodities?",
      answer: "Yes! TradeSense AI works with any trading instrument - forex pairs (EUR/USD), indices (US30, NASDAQ), commodities (Gold, Oil), and more."
    },
    {
      question: "How does the fundamental analysis work?",
      answer: "We aggregate news from 10+ top-tier sources (ForexFactory, Bloomberg, Reuters, etc.) and calculate a net bias score showing whether fundamentals support your technical setup."
    },
    {
      question: "What's the best way to use this tool?",
      answer: "Upload charts when you spot potential setups. Use the confluence score and trade plan to decide if it's worth entering. Set alerts for your favorite pairs at 75%+ or 100% confluence."
    }
  ];

  const testimonials = [
    {
      name: "Michael R.",
      role: "Full-Time Forex Trader",
      avatar: "M",
      rating: 5,
      text: "TradeSense AI transformed my trading. The confluence scoring system helps me filter out low-probability setups and focus only on the best opportunities. My win rate jumped from 52% to 68%."
    },
    {
      name: "Sarah K.",
      role: "Swing Trader",
      avatar: "S",
      rating: 5,
      text: "The multi-timeframe analysis is a game-changer. Being able to see H4, H1, and M30 confluence at a glance saves me hours of manual chart analysis every week."
    },
    {
      name: "David L.",
      role: "Part-Time Trader",
      avatar: "D",
      rating: 5,
      text: "As someone with a full-time job, I don't have time to analyze 10 indicators manually. This tool does it in seconds and gives me clear trade plans. Absolutely worth it."
    },
    {
      name: "Jennifer M.",
      role: "Index Trader",
      avatar: "J",
      rating: 5,
      text: "The fundamental news integration is brilliant. Seeing how news aligns with technicals gives me the confidence to hold trades longer and avoid getting shaken out early."
    }
  ];

  const stats = [
    { label: "Active Traders", value: "2,500+", icon: Users },
    { label: "Charts Analyzed", value: "50,000+", icon: BarChart3 },
    { label: "Avg. Confluence Score", value: "78%", icon: Target },
    { label: "User Satisfaction", value: "4.9/5", icon: Star }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18191A] via-[#242526] to-[#18191A]">
      {/* Navigation */}
      <nav className="bg-[#242526]/80 backdrop-blur border-b border-slate-700/50 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1877F2] to-[#0866FF] rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#1877F2] to-[#0866FF] bg-clip-text text-transparent">TradeSense AI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#setup-guide" className="text-slate-300 hover:text-white transition-colors">Setup Guide</a>
              <a href="#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
              {user ? (
                <>
                  <Link to={createPageUrl("Analyzer")}>
                    <Button className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] shadow-lg hover:shadow-xl transition-all duration-300 rounded-full">
                      Go to Analyzer
                    </Button>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to={createPageUrl("Admin")}>
                      <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                        Admin
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button onClick={handleStartAnalyzing} className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] shadow-lg hover:shadow-xl transition-all duration-300 rounded-full">
                  Start Analyzing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4 space-y-3"
              >
                <a href="#features" className="block text-slate-300 hover:text-white transition-colors py-2">Features</a>
                <a href="#how-it-works" className="block text-slate-300 hover:text-white transition-colors py-2">How It Works</a>
                <a href="#setup-guide" className="block text-slate-300 hover:text-white transition-colors py-2">Setup Guide</a>
                <a href="#faq" className="block text-slate-300 hover:text-white transition-colors py-2">FAQ</a>
                <a href="#testimonials" className="block text-slate-300 hover:text-white transition-colors py-2">Testimonials</a>
                {user ? (
                  <Link to={createPageUrl("Analyzer")} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Analyzer</Button>
                  </Link>
                ) : (
                  <Button onClick={handleStartAnalyzing} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Start Analyzing
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/30 px-4 py-2 text-sm rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Vision AI-Powered Chart Analysis
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#1877F2] via-[#0866FF] to-[#1877F2] bg-clip-text text-transparent leading-tight">
              Trade with Precision,<br />Not Guesswork
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload any chart. Get instant 0-100% confluence scores. Receive complete trade plans.
              TradeSense AI analyzes every indicator so you can trade with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleStartAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] text-lg px-8 py-6 rounded-2xl shadow-2xl shadow-[#1877F2]/30 group transition-all duration-300"
              >
                {user ? "Go to Analyzer" : "Start Free Analysis"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-200 hover:bg-slate-800 text-lg px-8 py-6 rounded-xl"
                >
                  See How It Works
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#1877F2]/20 to-[#0866FF]/20 rounded-xl flex items-center justify-center shadow-lg">
                  <stat.icon className="w-6 h-6 text-[#1877F2]" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[#242526]/30 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why Traders Choose TradeSense AI
            </h2>
            <p className="text-xl text-slate-400">
              Professional-grade analysis tools designed for serious traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="bg-[#242526]/80 border-slate-700/50 hover:border-[#1877F2]/50 transition-all duration-300 h-full backdrop-blur rounded-2xl shadow-xl hover:shadow-2xl">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Indicator Setup Guide Section */}
      <section id="setup-guide" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Indicator Setup Guide
            </h2>
            <p className="text-xl text-slate-400">
              Configure your chart with these exact indicator settings for optimal analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  Moving Averages (EMA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
                  <h4 className="text-green-300 font-semibold mb-2">EMA 21 (Fast Trend)</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Length: <strong className="text-white">21</strong></li>
                    <li>• Type: <strong className="text-white">Exponential</strong></li>
                    <li>• Color: <strong className="text-green-400">Green (#00FF00)</strong></li>
                    <li>• Line Style: Solid, Width 2</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
                  <h4 className="text-yellow-300 font-semibold mb-2">EMA 50 (Medium Trend)</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Length: <strong className="text-white">50</strong></li>
                    <li>• Type: <strong className="text-white">Exponential</strong></li>
                    <li>• Color: <strong className="text-yellow-400">Yellow (#FFFF00)</strong></li>
                    <li>• Line Style: Solid, Width 2</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-red-900/20 to-rose-900/20 border border-red-500/30">
                  <h4 className="text-red-300 font-semibold mb-2">EMA 200 (Slow Trend)</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Length: <strong className="text-white">200</strong></li>
                    <li>• Type: <strong className="text-white">Exponential</strong></li>
                    <li>• Color: <strong className="text-red-400">Red (#FF0000)</strong></li>
                    <li>• Line Style: Solid, Width 2</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-purple-400" />
                  Oscillators & Momentum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30">
                  <h4 className="text-purple-300 font-semibold mb-2">RSI (Relative Strength Index)</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Length: <strong className="text-white">14</strong></li>
                    <li>• Overbought Level: <strong className="text-white">70</strong></li>
                    <li>• Oversold Level: <strong className="text-white">30</strong></li>
                    <li>• Line Color: <strong className="text-purple-400">Purple (#9333EA)</strong></li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30">
                  <h4 className="text-blue-300 font-semibold mb-2">MACD</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Fast Length: <strong className="text-white">12</strong></li>
                    <li>• Slow Length: <strong className="text-white">26</strong></li>
                    <li>• Signal Length: <strong className="text-white">9</strong></li>
                    <li>• MACD Line: <strong className="text-blue-400">Blue</strong></li>
                    <li>• Signal Line: <strong className="text-orange-400">Orange</strong></li>
                    <li>• Histogram: <strong className="text-slate-400">Gray with gradient</strong></li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30">
                  <h4 className="text-orange-300 font-semibold mb-2">ADX (Trend Strength)</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Length: <strong className="text-white">14</strong></li>
                    <li>• ADX Line: <strong className="text-white">White</strong></li>
                    <li>• DI+: <strong className="text-green-400">Green</strong></li>
                    <li>• DI-: <strong className="text-red-400">Red</strong></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 backdrop-blur">
            <CardContent className="p-6">
              <h4 className="text-blue-200 font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Setup Tips
              </h4>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>✓ Use a clean, uncluttered chart for best results</li>
                <li>✓ Ensure all indicators are visible in your screenshot</li>
                <li>✓ Include at least 50-100 candles for proper analysis</li>
                <li>✓ Take screenshots in landscape mode for better clarity</li>
                <li>✓ Avoid overlapping indicators - keep them in separate panels</li>
                <li>✓ Make sure candlesticks are clearly visible</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              From chart upload to trade execution in 5 simple steps
            </p>
          </div>

          <div className="space-y-8">
            {howItWorks.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#1877F2]/30">
                    {step.step}
                  </div>
                </div>
                <Card className="flex-1 bg-[#242526]/80 border-slate-700/50 hover:border-[#1877F2]/50 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="w-6 h-6 text-blue-400" />
                      <CardTitle className="text-white text-xl">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={handleStartAnalyzing}
              size="lg"
              className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] text-lg px-8 py-6 rounded-2xl shadow-2xl shadow-[#1877F2]/30 transition-all duration-300"
            >
              {user ? "Start Analyzing Now" : "Try It Free"}
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Trusted by Traders Worldwide
            </h2>
            <p className="text-xl text-slate-400">
              See what professional traders are saying about TradeSense AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{testimonial.name}</div>
                        <div className="text-slate-400 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need to know about TradeSense AI
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 leading-relaxed pl-9">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
            <CardContent className="p-12 text-center relative z-10">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-400" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to Transform Your Trading?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who have improved their win rates and trade with confidence using TradeSense AI.
              </p>
              <Button
                onClick={handleStartAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] text-lg px-12 py-6 rounded-2xl shadow-2xl shadow-[#1877F2]/30 group transition-all duration-300"
              >
                {user ? "Go to Analyzer" : "Start Your First Analysis"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-slate-400 text-sm mt-4">
                {user ? "Continue your trading journey" : "No credit card required • Free to start"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center gap-6 text-slate-400">
            <a href="#hero" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#setup-guide" className="hover:text-white transition-colors">Setup Guide</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          
          <div className="border-t border-slate-800 pt-6">
            <p className="text-slate-400 text-sm max-w-4xl mx-auto">
              ⚠️ <strong>Important Disclaimer:</strong> TradeSense AI is not a financial expert or advisor and is not liable for any losses incurred from using this platform. 
              All analysis provided is for educational and informational purposes only. Trading forex, commodities, and other financial instruments involves substantial risk of loss and is not suitable for all investors. 
              Past performance is not indicative of future results. Always conduct your own research and consult with a qualified financial professional before making any investment decisions.
            </p>
          </div>
          
          <p className="text-slate-500 text-xs mt-4">
            © 2024 TradeSense AI. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Menu */}
      <FloatingMenu />
    </div>
  );
}