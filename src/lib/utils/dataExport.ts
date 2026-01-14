// Data export/import utilities
import { db } from '@/lib/db/database';
import type { Transaction, Category, Budget, Goal, Settings } from '@/lib/types';

// Export all data to JSON
export async function exportToJSON(): Promise<string> {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    transactions: await db.transactions.toArray(),
    categories: await db.categories.toArray(),
    budgets: await db.budgets.toArray(),
    goals: await db.goals.toArray(),
    settings: await db.settings.toArray(),
  };
  
  return JSON.stringify(data, null, 2);
}

// Export transactions to CSV
export async function exportToCSV(): Promise<string> {
  const transactions = await db.transactions.filter(t => !t.isDeleted).toArray();
  const categories = await db.categories.toArray();
  
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat?.name || 'Unknown';
  };

  // CSV header
  const headers = [
    'Date',
    'Type',
    'Category',
    'Amount',
    'Currency',
    'Description',
    'Recurrence',
  ];

  // CSV rows
  const rows = transactions.map(t => [
    new Date(t.date).toISOString().split('T')[0],
    t.type,
    getCategoryName(t.categoryId),
    t.amount.toString(),
    t.currency,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.recurrence,
  ]);

  // Combine
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import data from JSON
export async function importFromJSON(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.version) {
      return { success: false, message: 'Invalid backup file format' };
    }

    // Clear existing data
    await db.transactions.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await db.goals.clear();
    
    // Import new data
    if (data.transactions?.length) {
      await db.transactions.bulkAdd(data.transactions);
    }
    if (data.categories?.length) {
      await db.categories.bulkAdd(data.categories);
    }
    if (data.budgets?.length) {
      await db.budgets.bulkAdd(data.budgets);
    }
    if (data.goals?.length) {
      await db.goals.bulkAdd(data.goals);
    }

    return { 
      success: true, 
      message: `Imported ${data.transactions?.length || 0} transactions, ${data.categories?.length || 0} categories` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to parse backup file: ' + (error as Error).message 
    };
  }
}

// Import transactions from CSV
export async function importFromCSV(csvString: string): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, message: 'CSV file is empty or invalid', count: 0 };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateIdx = headers.indexOf('date');
    const typeIdx = headers.indexOf('type');
    const categoryIdx = headers.indexOf('category');
    const amountIdx = headers.indexOf('amount');
    const descIdx = headers.indexOf('description');

    if (dateIdx === -1 || amountIdx === -1) {
      return { success: false, message: 'CSV must have Date and Amount columns', count: 0 };
    }

    const categories = await db.categories.toArray();
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < Math.max(dateIdx, amountIdx) + 1) continue;

      const date = new Date(values[dateIdx]);
      const amount = parseFloat(values[amountIdx]);
      if (isNaN(date.getTime()) || isNaN(amount)) continue;

      const type = typeIdx !== -1 ? values[typeIdx]?.toLowerCase() : 'expense';
      const categoryName = categoryIdx !== -1 ? values[categoryIdx] : '';
      const description = descIdx !== -1 ? values[descIdx]?.replace(/^"|"$/g, '') : '';

      // Find or create category
      let category = categories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase() && c.type === type
      );
      if (!category) {
        category = categories.find(c => c.type === type);
      }

      if (category) {
        await db.transactions.add({
          id: crypto.randomUUID(),
          type: type as 'income' | 'expense',
          amount,
          currency: 'BDT',
          categoryId: category.id,
          description,
          date,
          recurrence: 'none',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        importedCount++;
      }
    }

    return { 
      success: true, 
      message: `Successfully imported ${importedCount} transactions`, 
      count: importedCount 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to parse CSV: ' + (error as Error).message, 
      count: 0 
    };
  }
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// Delete all user data
export async function deleteAllData(): Promise<void> {
  await db.transactions.clear();
  await db.budgets.clear();
  await db.goals.clear();
  await db.goalContributions.clear();
  await db.recycleBin.clear();
  // Keep categories and settings
}
