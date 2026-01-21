// Public Landing Page - No login required
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  Diamond, 
  Wallet, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  Star,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(particle.id) * 50],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Animated sparkle effect
const SparkleEffect = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute"
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
    }}
  >
    <Sparkles className="w-4 h-4 text-yellow-400" />
  </motion.div>
);

// Animated logo with sparkles
const AnimatedLogo = () => (
  <div className="relative inline-flex items-center justify-center">
    <motion.span
      className="text-6xl"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img src="/half-moon.png" alt="Lunaris Logo" className="w-16 h-16 object-contain" />
    </motion.span>
    <SparkleEffect delay={0} />
    <motion.div
      className="absolute -top-2 -right-2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <SparkleEffect delay={0.5} />
    </motion.div>
    <motion.div
      className="absolute -bottom-1 -left-3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1 }}
    >
      <SparkleEffect delay={1} />
    </motion.div>
  </div>
);

// Animated gradient text component
const AnimatedGradientText = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-[length:200%_auto]"
    animate={{
      backgroundPosition: ['0% center', '200% center'],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    {children}
  </motion.span>
);

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Wallet,
      title: t('trackTransactions'),
      description: t('trackTransactionsDesc'),
      color: '#3B82F6',
      details: {
        fullDescription: t('trackTransactionsFull'),
        highlights: [
          t('highlightAddIncome'),
          t('highlightAutoCat'),
          t('highlightCharts'),
          t('highlightSearch'),
          t('highlightRecurring'),
        ],
      },
    },
    {
      icon: PiggyBank,
      title: t('smartBudgets'),
      description: t('smartBudgetsDesc'),
      color: '#10B981',
      details: {
        fullDescription: t('smartBudgetsFull'),
        highlights: [
          t('highlightCatBudgets'),
          t('highlightVisualProg'),
          t('highlightOverAlerts'),
          t('highlightRollover'),
          t('highlightDashboard'),
        ],
      },
    },
    {
      icon: Target,
      title: t('savingsGoals'),
      description: t('savingsGoalsDesc'),
      color: '#F59E0B',
      details: {
        fullDescription: t('savingsGoalsFull'),
        highlights: [
          t('highlightMultipleGoals'),
          t('highlightGoalProg'),
          t('highlightContribHist'),
          t('highlightCeleb'),
          t('highlightTargetDate'),
        ],
      },
    },
    {
      icon: TrendingUp,
      title: t('aiInsights'),
      description: t('aiInsightsDesc'),
      color: '#06B6D4',
      details: {
        fullDescription: t('aiInsightsFull'),
        highlights: [
          t('highlightPattern'),
          t('highlightTips'),
          t('highlightSmartCat'),
          t('highlightPredictions'),
          t('highlightWeekly'),
        ],
      },
    },
  ];

  const benefits = [
    t('completelyOffline'),
    t('chooseAppearance'), // Using matching existing keys where possible
    t('multiCurrency'),
    t('exportData'),
    t('englishBangla'),
  ];

  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className="text-3xl"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <img src="/half-moon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </motion.span>
            <span className="text-xl font-bold">{t('appName')}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="gap-2">
                  {t('login')}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="mb-8"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(var(--primary), 0)',
                  '0 0 0 8px rgba(var(--primary), 0.1)',
                  '0 0 0 0 rgba(var(--primary), 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Shield className="w-4 h-4" />
              </motion.div>
              {t('privacyFirst')}
            </motion.div>
          </motion.div>

          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
            className="mb-6"
          >
            <AnimatedLogo />
          </motion.div>

          {/* Title with staggered animation */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="block"
            >
              {t('yourCalmClear')}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="block"
            >
              <AnimatedGradientText>
                {t('financeCompanion')}
              </AnimatedGradientText>
            </motion.span>
          </motion.h1>

          {/* Description with fade-in */}
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {t('appHeroDesc')}
          </motion.p>

          {/* CTA Buttons with pulse and hover effects */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(var(--primary), 0.4)',
                    '0 0 20px 10px rgba(var(--primary), 0.1)',
                    '0 0 0 0 rgba(var(--primary), 0.4)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
                className="rounded-lg"
              >
                <Button size="lg" className="gap-2 text-lg px-8">
                  {t('getStarted')}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDemoVideo(true)}
              className="cursor-pointer"
            >
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Play className="w-5 h-5" />
                </motion.span>
                {t('watchDemo')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="inline-flex flex-col items-center text-muted-foreground text-sm"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="mb-2">{t('scrollToExplore')}</span>
              <motion.div
                className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
              >
                <motion.div
                  className="w-1.5 h-2.5 bg-primary rounded-full"
                  animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('everythingYouNeed')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('powerfulFeatures')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                   whileHover={{ 
                    scale: 1.02,
                    y: -10,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFeature(feature)}
                  className="cursor-pointer h-full"
                >
                  <Card 
                    className="h-full shadow-soft transition-all duration-300 hover:shadow-2xl border-2 border-transparent group relative overflow-hidden"
                    style={{
                      '--hover-color': feature.color,
                    } as React.CSSProperties}
                  >
                    <CardContent className="p-6 text-center relative z-10">
                      <motion.div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10"
                        style={{ backgroundColor: `${feature.color}20` }}
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        <Icon className="w-7 h-7" style={{ color: feature.color }} />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2 relative z-10 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm relative z-10">{feature.description}</p>
                      
                      {/* Click hint */}
                      <motion.div 
                        className="mt-4 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                        initial={{ y: 10 }}
                        whileHover={{ y: 0 }}
                      >
                        <span>{t('clickToLearnMore')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${selectedFeature.color}20` }}
                  >
                    <selectedFeature.icon 
                      className="w-7 h-7" 
                      style={{ color: selectedFeature.color }} 
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedFeature.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedFeature.details.fullDescription}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">{t('keyFeatures')}</h4>
                <div className="space-y-2">
                  {selectedFeature.details.highlights.map((highlight, i) => (
                    <motion.div
                      key={highlight}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 
                        className="w-4 h-4 shrink-0" 
                        style={{ color: selectedFeature.color }} 
                      />
                      <span className="text-sm">{highlight}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedFeature(null)}
                >
                  {t('close')}
                </Button>
                <Link href="/login" className="flex-1">
                  <Button className="w-full gap-2">
                    {t('getStarted')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemoVideo && (
          <Dialog open={showDemoVideo} onOpenChange={setShowDemoVideo}>
            <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-primary/20">
              <DialogHeader className="sr-only">
                <DialogTitle>{t('lunarisAppTour')}</DialogTitle>
                <DialogDescription>{t('seeEasyManage')}</DialogDescription>
              </DialogHeader>
              
              {/* Close button */}
              <motion.button
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setShowDemoVideo(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
              
              {/* Video container */}
              <motion.div
                className="relative w-full aspect-video rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {/* Video element - using webp as animated image */}
                <img
                  src="/demo-video.webp"
                  alt={t('watchDemo')}
                  className="w-full h-full object-contain bg-black"
                />
                
                {/* Video overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3">
                    <motion.span 
                      className="text-3xl"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                    <img src="/half-moon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </motion.span>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{t('lunarisAppTour')}</h3>
                      <p className="text-white/60 text-sm">{t('seeEasyManage')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Action buttons */}
              <div className="p-4 flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="gap-2 border-white/20 text-white hover:bg-white/10"
                  onClick={() => setShowDemoVideo(false)}
                >
                  {t('close')}
                </Button>
                <Link href="/login">
                  <Button className="gap-2">
                    {t('getStarted')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('whyLunaris')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('builtWithPrivacy')}
            </p>
          </motion.div>
          
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 cursor-default transition-colors hover:bg-muted"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>{t('copyright')}</p>
          <p className="mt-1">{t('dataStaysAlways')}</p>
        </div>
      </footer>
    </div>
  );
}
