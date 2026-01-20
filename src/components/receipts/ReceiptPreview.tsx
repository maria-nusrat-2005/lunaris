// Receipt Preview Component - Shows parsed receipt data with confidence indicators
// Allows user to edit fields before confirming transaction

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  AlertCircle,
  Pencil,
  Store,
  Calendar,
  DollarSign,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ParsedReceipt } from '@/lib/ocr';

interface ReceiptPreviewProps {
  receipt: ParsedReceipt;
  imageUrl?: string;
  onConfirm: (editedReceipt: ParsedReceipt) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReceiptPreview({
  receipt,
  imageUrl,
  onConfirm,
  onCancel,
  isLoading = false,
}: ReceiptPreviewProps) {
  const [editedReceipt, setEditedReceipt] = useState<ParsedReceipt>(receipt);
  const [editingField, setEditingField] = useState<string | null>(null);

  const confidenceColors = {
    high: 'text-emerald bg-emerald/10',
    medium: 'text-amber-500 bg-amber-500/10',
    low: 'text-red-500 bg-red-500/10',
  };

  const confidenceLabels = {
    high: 'High confidence',
    medium: 'Medium confidence',
    low: 'Low confidence',
  };

  const handleFieldChange = (field: keyof ParsedReceipt, value: string | number) => {
    setEditedReceipt((prev) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value as string) || 0 : value,
    }));
  };

  const FieldRow = ({
    icon: Icon,
    label,
    field,
    value,
    confidence,
    type = 'text',
  }: {
    icon: typeof Store;
    label: string;
    field: keyof ParsedReceipt;
    value: string | number;
    confidence: 'high' | 'medium' | 'low';
    type?: string;
  }) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {isEditing ? (
            <Input
              type={type}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              className="h-8 mt-1"
              autoFocus
            />
          ) : (
            <p className="font-medium truncate">
              {field === 'amount' ? `${editedReceipt.currency}${value}` : value}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              confidenceColors[confidence]
            )}
            title={confidenceLabels[confidence]}
          >
            {confidence === 'high' ? '✓' : confidence === 'medium' ? '~' : '?'}
          </span>
          <button
            onClick={() => setEditingField(isEditing ? null : field)}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Confidence Banner */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
          confidenceColors[editedReceipt.confidence.overall]
        )}
      >
        {editedReceipt.confidence.overall === 'high' ? (
          <Check className="w-4 h-4" />
        ) : editedReceipt.confidence.overall === 'medium' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span>
          {editedReceipt.confidence.overall === 'high'
            ? 'Receipt parsed successfully'
            : editedReceipt.confidence.overall === 'medium'
            ? 'Some fields may need review'
            : 'Please verify all fields'}
        </span>
      </div>

      {/* Preview Card */}
      <Card className="overflow-hidden">
        {/* Image Preview */}
        {imageUrl && (
          <div className="h-32 bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt="Receipt"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Parsed Receipt
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-0">
          <FieldRow
            icon={Store}
            label="Merchant"
            field="merchant"
            value={editedReceipt.merchant}
            confidence={editedReceipt.confidence.merchant}
          />
          <FieldRow
            icon={Calendar}
            label="Date"
            field="date"
            value={editedReceipt.date}
            confidence={editedReceipt.confidence.date}
            type="date"
          />
          <FieldRow
            icon={DollarSign}
            label="Amount"
            field="amount"
            value={editedReceipt.amount}
            confidence={editedReceipt.confidence.amount}
            type="number"
          />
          <FieldRow
            icon={Coins}
            label="Currency"
            field="currency"
            value={editedReceipt.currency}
            confidence={editedReceipt.confidence.currency}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={() => onConfirm(editedReceipt)}
          disabled={isLoading}
        >
          <Check className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Create Transaction'}
        </Button>
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-center text-muted-foreground">
        Receipt image is stored locally and never uploaded externally.
      </p>
    </motion.div>
  );
}

export default ReceiptPreview;
