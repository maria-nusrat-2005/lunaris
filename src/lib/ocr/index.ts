// OCR Service exports
export {
  parseReceiptImage,
  compressImage,
  saveReceiptLocally,
  getStoredReceipts,
  deleteStoredReceipt,
} from './ocrService';

export type {
  ParsedReceipt,
  ReceiptConfidence,
  OCRResult,
  StoredReceipt,
} from './ocrService';
