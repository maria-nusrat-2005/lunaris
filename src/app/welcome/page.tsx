// Public Landing Page - No login required
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const features = [
  {
    icon: Wallet,
    title: 'Track Transactions',
    description: 'Monitor your income and expenses with beautiful visualizations.',
    color: '#3B82F6',
    details: {
      fullDescription: 'Keep a detailed record of every transaction. Categorize your spending, add notes, and see patterns in your financial habits.',
      highlights: [
        'Add income and expenses easily',
        'Auto-categorization with AI',
        'Beautiful charts and graphs',
        'Search and filter transactions',
        'Recurring transaction support',
      ],
    },
  },
  {
    icon: PiggyBank,
    title: 'Smart Budgets',
    description: 'Set monthly budgets and get alerts when you\'re close to limits.',
    color: '#10B981',
    details: {
      fullDescription: 'Create budgets for different spending categories and track your progress throughout the month.',
      highlights: [
        'Category-based budgets',
        'Visual progress tracking',
        'Over-budget alerts',
        'Rollover unused amounts',
        'Monthly overview dashboard',
      ],
    },
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Create goals and track your progress towards financial freedom.',
    color: '#F59E0B',
    details: {
      fullDescription: 'Set savings goals for vacations, emergency funds, or any big purchase. Track your progress and celebrate when you reach them!',
      highlights: [
        'Multiple savings goals',
        'Progress tracking',
        'Contribution history',
        'Goal completion celebrations',
        'Target date tracking',
      ],
    },
  },
  {
    icon: TrendingUp,
    title: 'AI Insights',
    description: 'Get smart recommendations powered by AI to optimize spending.',
    color: '#8B5CF6',
    details: {
      fullDescription: 'Our AI analyzes your spending patterns and provides personalized recommendations to help you save more.',
      highlights: [
        'Spending pattern analysis',
        'Personalized tips',
        'Smart categorization',
        'Trend predictions',
        'Weekly insights digest',
      ],
    },
  },
];

const benefits = [
  'Completely offline - your data never leaves your device',
  'Beautiful dark and light themes',
  'Multi-currency support (BDT, USD, EUR, GBP, INR)',
  'Export your data anytime (JSON/CSV)',
  'Available in English and Bangla',
];

export default function LandingPage() {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💎</span>
            <span className="text-xl font-bold">Lunaris</span>
          </div>
          <Link href="/login">
            <Button className="gap-2">
              Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Privacy-First • Offline-First
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Calm, Clear
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Finance Companion
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A beautiful, privacy-focused personal finance app. Track income, expenses, 
              budgets, and savings goals with complete local data ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <Smartphone className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
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
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              Powerful features to take control of your finances
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
                    scale: 1.05,
                    y: -8,
                  }}
                  onClick={() => setSelectedFeature(feature)}
                  className="cursor-pointer"
                >
                  <Card 
                    className="h-full shadow-soft transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-primary/30 group"
                    style={{
                      '--hover-color': feature.color,
                    } as React.CSSProperties}
                  >
                    <CardContent className="p-6 text-center relative overflow-hidden">
                      {/* Gradient overlay on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        style={{ backgroundColor: feature.color }}
                      />
                      
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
                        <span>Click to learn more</span>
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
                <h4 className="font-semibold mb-3">Key Features:</h4>
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
                  Close
                </Button>
                <Link href="/login" className="flex-1">
                  <Button className="w-full gap-2">
                    Get Started
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
            <h2 className="text-3xl font-bold mb-4">Why Lunaris?</h2>
            <p className="text-muted-foreground text-lg">
              Built with privacy and simplicity in mind
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-xl overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-purple-500/10">
                <div className="text-6xl mb-6">💎</div>
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Create your account in seconds and start taking control of your finances today.
                </p>
                <Link href="/login">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Lunaris. Made with ❤️</p>
          <p className="mt-1">Your data stays on your device. Always.</p>
        </div>
      </footer>
    </div>
  );
}
