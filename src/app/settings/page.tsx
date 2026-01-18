// Settings Page with working export/import and AI configuration
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  DollarSign,
  Download,
  Upload,
  Trash2,
  Lock,
  Diamond,
  Sparkles,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/lib/stores';
import { useTheme, useTranslation } from '@/lib/hooks';
import { exportToJSON, exportToCSV, importFromJSON, importFromCSV, downloadFile, deleteAllData } from '@/lib/utils/dataExport';
import { isAIEnabled, saveAPIKey, removeAPIKey, getMaskedAPIKey } from '@/lib/ai';
import { ProfileSettings } from '@/components/settings';
import type { ThemeMode, Currency, Language } from '@/lib/types';

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const { theme, setTheme } = useTheme();
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const { t } = useTranslation();

  const [exportLoading, setExportLoading] = useState<'json' | 'csv' | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(isAIEnabled());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeOptions: { value: ThemeMode; icon: typeof Sun; labelKey: string; descKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'light', descKey: 'brightAndClean' },
    { value: 'dark', icon: Moon, labelKey: 'dark', descKey: 'easyOnEyes' },
    { value: 'system', icon: Monitor, labelKey: 'system', descKey: 'matchDevice' },
  ];

  const currencyOptions: { value: Currency; labelKey: string; symbol: string }[] = [
    { value: 'BDT', labelKey: 'bangladeshiTaka', symbol: '৳' },
    { value: 'USD', labelKey: 'usDollar', symbol: '$' },
    { value: 'EUR', labelKey: 'euro', symbol: '€' },
    { value: 'GBP', labelKey: 'britishPound', symbol: '£' },
    { value: 'INR', labelKey: 'indianRupee', symbol: '₹' },
  ];

  const languageOptions: { value: Language; label: string; native: string }[] = [
    { value: 'en', label: 'English', native: 'English' },
    { value: 'bn', label: 'বাংলা', native: 'বাংলা' },
  ];

  const handleExportJSON = async () => {
    setExportLoading('json');
    try {
      const data = await exportToJSON();
      const filename = `clarity-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(data, filename, 'application/json');
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportCSV = async () => {
    setExportLoading('csv');
    try {
      const data = await exportToCSV();
      const filename = `clarity-finance-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(data, filename, 'text/csv');
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportMessage(null);

    try {
      const content = await file.text();
      let result;

      if (file.name.endsWith('.json')) {
        result = await importFromJSON(content);
      } else if (file.name.endsWith('.csv')) {
        result = await importFromCSV(content);
      } else {
        result = { success: false, message: 'Please select a .json or .csv file' };
      }

      setImportMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });

      if (result.success) {
        // Reload the page to refresh data
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: 'Failed to import file',
      });
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAll = async () => {
    await deleteAllData();
    setDeleteDialogOpen(false);
    window.location.reload();
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveAPIKey(apiKey.trim());
      setAiEnabled(true);
      setApiKey('');
      setAiDialogOpen(false);
    }
  };

  const handleRemoveApiKey = () => {
    removeAPIKey();
    setAiEnabled(false);
    setAiDialogOpen(false);
  };

  return (
    <AppShell>
    <div className="space-y-8 max-w-3xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('customizeExperience')}
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <ProfileSettings />
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">{t('appearance')}</CardTitle>
            <CardDescription>{t('chooseAppearance')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      theme === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      theme === option.value ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6',
                        theme === option.value ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{t(option.labelKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(option.descKey)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Regional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">{t('regionalSettings')}</CardTitle>
            <CardDescription>{t('setPreferredCurrency')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4" />
                  {t('currency')}
                </label>
                <Select
                  value={settings?.currency || 'BDT'}
                  onValueChange={(value: Currency) => setCurrency(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{option.symbol}</span>
                          <span>{t(option.labelKey)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="w-4 h-4" />
                  {t('language')}
                </label>
                <Select
                  value={settings?.language || 'en'}
                  onValueChange={(value: Language) => setLanguage(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span>{option.native}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">{t('dataManagement')}</CardTitle>
            <CardDescription>{t('exportImportDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="gap-2 h-auto py-4 flex-col"
                onClick={handleExportJSON}
                disabled={exportLoading !== null}
              >
                <Download className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {exportLoading === 'json' ? t('loading') : t('exportToJson')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('fullBackup')}</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="gap-2 h-auto py-4 flex-col"
                onClick={handleExportCSV}
                disabled={exportLoading !== null}
              >
                <Download className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {exportLoading === 'csv' ? t('loading') : t('exportToCsv')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('transactionsSpreadsheet')}</p>
                </div>
              </Button>
            </div>

            <Separator />

            {/* Import */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{t('importData')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('restoreBackup')}
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importLoading}
                  >
                    <Upload className="w-4 h-4" />
                    {importLoading ? t('loading') : t('import')}
                  </Button>
                </div>
              </div>

              {importMessage && (
                <div className={cn(
                  'flex items-center gap-2 p-3 rounded-lg text-sm',
                  importMessage.type === 'success' 
                    ? 'bg-emerald/10 text-emerald' 
                    : 'bg-destructive/10 text-destructive'
                )}>
                  {importMessage.type === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {importMessage.text}
                </div>
              )}
            </div>

            <Separator />

            {/* Danger zone */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">{t('dangerZone')}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('deleteAllDataDesc')}
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('deleteAllData')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy & AI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">{t('privacySecurity')}</CardTitle>
            <CardDescription>{t('dataStaysLocal')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('appLock')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('appLockDesc')}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {t('setUp')}
              </Button>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{t('aiFeatures')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('aiFeaturesDesc')}
                  </p>
                  {aiEnabled && (
                    <p className="text-xs text-emerald mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      API Key configured: {getMaskedAPIKey()}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAiDialogOpen(true)}
              >
                {t('configure')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="shadow-soft">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💎</span>
              <div>
                <h3 className="text-lg font-bold">{t('appName')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('appTagline')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('version')} 1.0.0 • {t('madeWith')} ❤️
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{t('deleteAllData')}</DialogTitle>
            <DialogDescription>
              {t('deleteAllDataDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteAll}>
              {t('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI configuration dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              {t('aiFeatures')}
            </DialogTitle>
            <DialogDescription>
              Enter your Google Gemini API key to enable AI-powered insights and auto-categorization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gemini API Key</label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://aistudio.google.com/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="flex gap-3">
              {aiEnabled ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={handleRemoveApiKey}>
                    Remove API Key
                  </Button>
                  <Button className="flex-1" onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                    Update Key
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => setAiDialogOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button className="flex-1" onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                    {t('save')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AppShell>
  );
}
