// OCR Service for Receipt Scanning using Tesseract.js
// Runs entirely in the browser - no external API calls for OCR

'use client';

import Tesseract from 'tesseract.js';

// ============ Types ============

export interface ParsedReceipt {
  merchant: string;
  date: string;
  amount: number;
  currency: string;
  confidence: ReceiptConfidence;
  rawText?: string;
}

export interface ReceiptConfidence {
  merchant: 'high' | 'medium' | 'low';
  date: 'high' | 'medium' | 'low';
  amount: 'high' | 'medium' | 'low';
  currency: 'high' | 'medium' | 'low';
  overall: 'high' | 'medium' | 'low';
}

export interface OCRResult {
  success: boolean;
  data?: ParsedReceipt;
  error?: string;
}

// ============ Image Compression ============

export async function compressImage(
  imageDataUrl: string,
  maxWidth: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

// ============ Text Parsing Helpers ============

function extractAmount(text: string): { amount: number; confidence: 'high' | 'medium' | 'low' } {
  // Common patterns for totals on receipts
  const patterns = [
    /(?:total|grand\s*total|amount\s*due|balance\s*due|subtotal)[:\s]*[\$৳€£₹]?\s*([\d,]+\.?\d*)/i,
    /(?:total|amount)[:\s]*[\$৳€£₹]?\s*([\d,]+\.?\d*)/i,
    /[\$৳€£₹]\s*([\d,]+\.\d{2})/g,
    /([\d,]+\.\d{2})/g,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const matches = text.match(patterns[i]);
    if (matches) {
      // Get the last match (usually the total is at the bottom)
      const match = matches[matches.length - 1];
      const numStr = match.replace(/[^\d.]/g, '');
      const amount = parseFloat(numStr);
      if (amount > 0 && amount < 1000000) {
        return {
          amount,
          confidence: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
        };
      }
    }
  }

  return { amount: 0, confidence: 'low' };
}

function extractDate(text: string): { date: string; confidence: 'high' | 'medium' | 'low' } {
  const today = new Date().toISOString().split('T')[0];

  // Common date patterns
  const patterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // YYYY/MM/DD or YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // Month DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
    // DD Month YYYY
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i,
  ];

  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };

  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match) {
      try {
        let year: string, month: string, day: string;

        if (i === 0) {
          // DD/MM/YYYY
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3];
        } else if (i === 1) {
          // YYYY/MM/DD
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        } else if (i === 2) {
          // Month DD, YYYY
          month = monthMap[match[1].toLowerCase().slice(0, 3)];
          day = match[2].padStart(2, '0');
          year = match[3];
        } else {
          // DD Month YYYY
          day = match[1].padStart(2, '0');
          month = monthMap[match[2].toLowerCase().slice(0, 3)];
          year = match[3];
        }

        const dateStr = `${year}-${month}-${day}`;
        // Validate date
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return { date: dateStr, confidence: i < 2 ? 'high' : 'medium' };
        }
      } catch {
        continue;
      }
    }
  }

  return { date: today, confidence: 'low' };
}

function extractMerchant(text: string): { merchant: string; confidence: 'high' | 'medium' | 'low' } {
  const lines = text.split('\n').filter(line => line.trim().length > 2);

  // Usually the merchant name is in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Skip lines that look like addresses, dates, or numbers
    if (
      line.length > 3 &&
      line.length < 50 &&
      !/^\d+$/.test(line) &&
      !/^\d{1,2}[\/\-]/.test(line) &&
      !/^tel|phone|fax|address|receipt/i.test(line)
    ) {
      return {
        merchant: line.replace(/[^\w\s&'-]/g, '').trim(),
        confidence: i === 0 ? 'high' : 'medium',
      };
    }
  }

  return { merchant: 'Unknown Store', confidence: 'low' };
}

function extractCurrency(text: string, defaultCurrency: string): { currency: string; confidence: 'high' | 'medium' | 'low' } {
  if (/৳|taka|bdt/i.test(text)) return { currency: 'BDT', confidence: 'high' };
  if (/\$|usd|dollar/i.test(text)) return { currency: 'USD', confidence: 'high' };
  if (/€|eur/i.test(text)) return { currency: 'EUR', confidence: 'high' };
  if (/£|gbp|pound/i.test(text)) return { currency: 'GBP', confidence: 'high' };
  if (/₹|inr|rupee/i.test(text)) return { currency: 'INR', confidence: 'high' };

  return { currency: defaultCurrency, confidence: 'low' };
}

// ============ OCR Processing with Tesseract ============

export async function parseReceiptImage(
  imageDataUrl: string,
  _aiEnabled: boolean, // Not needed for Tesseract but kept for API compatibility
  preferredCurrency: string = 'BDT'
): Promise<OCRResult> {
  try {
    // Compress image first
    const compressedImage = await compressImage(imageDataUrl);

    // Run Tesseract OCR
    const result = await Tesseract.recognize(compressedImage, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text;
    const ocrConfidence = result.data.confidence;

    if (!text || text.trim().length < 10) {
      return {
        success: false,
        error: 'Could not read text from image. Please try a clearer photo.',
      };
    }

    // Extract fields from OCR text
    const merchantResult = extractMerchant(text);
    const dateResult = extractDate(text);
    const amountResult = extractAmount(text);
    const currencyResult = extractCurrency(text, preferredCurrency);

    // Calculate overall confidence
    const confidenceScores = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const avgScore = (
      confidenceScores[merchantResult.confidence] +
      confidenceScores[dateResult.confidence] +
      confidenceScores[amountResult.confidence] +
      confidenceScores[currencyResult.confidence]
    ) / 4;

    const overallConfidence: 'high' | 'medium' | 'low' =
      avgScore >= 2.5 ? 'high' : avgScore >= 1.5 ? 'medium' : 'low';

    // Adjust based on Tesseract confidence
    const finalConfidence: 'high' | 'medium' | 'low' =
      ocrConfidence < 50 ? 'low' : overallConfidence;

    const receiptData: ParsedReceipt = {
      merchant: merchantResult.merchant,
      date: dateResult.date,
      amount: amountResult.amount,
      currency: currencyResult.currency,
      confidence: {
        merchant: merchantResult.confidence,
        date: dateResult.confidence,
        amount: amountResult.confidence,
        currency: currencyResult.confidence,
        overall: finalConfidence,
      },
      rawText: text.slice(0, 500), // Keep first 500 chars for debugging
    };

    return { success: true, data: receiptData };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to process receipt',
    };
  }
}

// ============ Receipt Storage (LocalStorage) ============

const RECEIPT_STORE_KEY = 'lunaris_receipts';

export interface StoredReceipt {
  id: string;
  imageData: string; // Compressed base64
  parsedData: ParsedReceipt;
  transactionId?: string;
  createdAt: Date;
}

export function saveReceiptLocally(receipt: StoredReceipt): void {
  try {
    const existing = localStorage.getItem(RECEIPT_STORE_KEY);
    const receipts: StoredReceipt[] = existing ? JSON.parse(existing) : [];

    // Keep only last 50 receipts to manage storage
    if (receipts.length >= 50) {
      receipts.shift();
    }

    receipts.push(receipt);
    localStorage.setItem(RECEIPT_STORE_KEY, JSON.stringify(receipts));
  } catch (error) {
    console.error('Failed to save receipt:', error);
  }
}

export function getStoredReceipts(): StoredReceipt[] {
  try {
    const data = localStorage.getItem(RECEIPT_STORE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteStoredReceipt(id: string): void {
  try {
    const existing = localStorage.getItem(RECEIPT_STORE_KEY);
    if (existing) {
      const receipts: StoredReceipt[] = JSON.parse(existing);
      const filtered = receipts.filter((r) => r.id !== id);
      localStorage.setItem(RECEIPT_STORE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Failed to delete receipt:', error);
  }
}
