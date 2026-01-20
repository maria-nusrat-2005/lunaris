// Scan Page - Receipt Scanner with Tesseract OCR (Upload Only)
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  Receipt,
  QrCode,
  Upload,
  Loader2,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptPreview } from '@/components/receipts';
import { cn } from '@/lib/utils';
import { parseReceiptImage, saveReceiptLocally } from '@/lib/ocr';
import type { ParsedReceipt } from '@/lib/ocr';
import { useIsMobile, useTranslation } from '@/lib/hooks';
import { useSettingsStore, useTransactionStore, useCategoryStore } from '@/lib/stores';
import { v4 as uuidv4 } from 'uuid';

type ScanState = 'idle' | 'processing' | 'preview' | 'error';

export default function ScanPage() {
  const { t } = useTranslation();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const settings = useSettingsStore((s) => s.settings);
  const currency = settings?.currency || 'BDT';

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const categories = useCategoryStore((s) => s.categories);

  // Get expense categories for receipt transactions
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const defaultCategory = expenseCategories.find((c) => c.name === 'Shopping') || expenseCategories[0];

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      processImage(imageData);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process image with Tesseract OCR
  const processImage = async (imageData: string) => {
    setCapturedImage(imageData);
    setScanState('processing');
    setErrorMessage(null);

    const result = await parseReceiptImage(imageData, true, currency);

    if (result.success && result.data) {
      setParsedReceipt(result.data);
      setScanState('preview');
    } else {
      setErrorMessage(result.error || 'Failed to parse receipt');
      setScanState('error');
    }
  };

  // Create transaction from parsed receipt
  const handleConfirmReceipt = async (receipt: ParsedReceipt) => {
    setIsSaving(true);

    try {
      const transactionId = uuidv4();

      // Create transaction
      await addTransaction({
        type: 'expense',
        amount: receipt.amount,
        currency: (receipt.currency as 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR') || currency,
        categoryId: defaultCategory?.id || 'cat_shopping',
        description: `Receipt from ${receipt.merchant}`,
        date: new Date(receipt.date),
        recurrence: 'none',
      });

      // Save receipt locally
      if (capturedImage) {
        saveReceiptLocally({
          id: uuidv4(),
          imageData: capturedImage,
          parsedData: receipt,
          transactionId,
          createdAt: new Date(),
        });
      }

      // Reset state
      resetScan();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      setErrorMessage('Failed to create transaction');
      setScanState('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset scan state
  const resetScan = () => {
    setCapturedImage(null);
    setParsedReceipt(null);
    setErrorMessage(null);
    setScanState('idle');
  };

  const renderContent = () => {
    // Processing
    if (scanState === 'processing') {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="font-medium">{t('analyzingReceipt')}</p>
          <p className="text-sm text-muted-foreground">{t('timeTip')}</p>
        </div>
      );
    }

    // Preview parsed receipt
    if (scanState === 'preview' && parsedReceipt) {
      return (
        <ReceiptPreview
          receipt={parsedReceipt}
          imageUrl={capturedImage || undefined}
          onConfirm={handleConfirmReceipt}
          onCancel={resetScan}
          isLoading={isSaving}
        />
      );
    }

    // Error state
    if (scanState === 'error') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium mb-2">{errorMessage}</p>
          <Button variant="outline" onClick={resetScan}>
            {t('tryAgain')}
          </Button>
        </div>
      );
    }

    // Idle state - show upload option
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-6">
          {t('scanUploadTip')}
        </p>
        
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 mb-4 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">{t('uploadImage')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('supportsImages')}
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          {t('selectImage')}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
            <ScanLine className="w-8 h-8 text-primary" />
            {t('scanTitle')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('scanDesc')}
          </p>
        </motion.div>

        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-soft overflow-hidden">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scanState}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {t('scanningTips')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• {t('tip1')}</p>
              <p>• {t('tip2')}</p>
              <p>• {t('tip3')}</p>
              <p>• {t('tip4')}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
