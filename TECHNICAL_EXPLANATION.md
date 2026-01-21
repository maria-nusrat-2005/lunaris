# Technical Explanation of Lunaris / Clarity Finance

This report provides a step-by-step breakdown of how the Lunaris application works, focusing on its frontend architecture and logic.

---

## 1. High-Level Application Flow (User Perspective)

When a user interacts with Lunaris, they experience a seamless, fast, and responsive journey:

1.  **Application Load**: The app initializes by setting up the local database (IndexedDB) and loading default settings (currency, theme, categories).
2.  **Dashboard Hub**: The user lands on the Dashboard, where they see a real-time summary of their financial health (Total Balance, Income vs. Expenses).
3.  **Core Actions**: Users can navigate to different pages (Transactions, Budgets, Goals) using the Sidebar. They can add new records, set limits, or track progress towards savings.
4.  **AI Assistance**: A floating AI Chat Panel is available to answer financial questions or provide insights based on the local data.
5.  **Receipt Scanning**: Users can upload or snap a photo of a receipt, and the app automatically extracts the details (Merchant, Amount, Date).

---

## 2. Functional Logic Flow (Behind the UI)

The application uses a **"Client-First"** architecture, meaning all logic and data handling happen directly in the user's browser.

### Data Storage: Dexie.js (IndexedDB)
Instead of a remote server, Lunaris uses **Dexie.js** to manage a local database called `ClarityFinance`. 
- **Persistence**: Data remains on the device even after closing the tab.
- **Privacy**: No financial data is sent to a backend server.
- **File**: `src/lib/db/database.ts`

### State Management: Zustand
To keep the UI in sync with the database, the app uses **Zustand** stores.
- **Reactivity**: When a transaction is added to the database, the Zustand store updates the local "state," which instantly triggers a re-render of the UI components (like the charts or balance cards).
- **Stores**: Found in `src/lib/stores/`, managing Transactions, Budgets, Goals, and Settings.

### Client-Side OCR: Tesseract.js
The receipt scanning feature uses **Tesseract.js** to perform Optical Character Recognition (OCR) entirely within the browser.
- **Processing**: The image is compressed, then scanned for text, and custom logic parses the merchant and amount.
- **File**: `src/lib/ocr/ocrService.ts`

---

## 3. File & Folder Responsibility Breakdown

| Folder / File | Responsibility |
| :--- | :--- |
| `src/app/` | **Pages & Routes**: Defines the URL structure (e.g., `/transactions`, `/goals`). |
| `src/components/` | **UI Library**: Reusable visual parts like Buttons, Cards, and Tables. |
| `src/lib/stores/` | **Logic & State**: Handles the "brain" of the app (Add/Delete/Update logic). |
| `src/lib/db/` | **Data Layer**: Defines the schema and handles direct database reads/writes. |
| `src/lib/hooks/` | **Calculations**: Custom hooks that calculate metrics like "Monthly Expenses" or "Savings Rate." |
| `src/lib/ocr/` | **Utility**: Logic for processing images and extracting text from receipts. |

---

## 4. Form Validation Logic

The application ensures data integrity through a multi-layered validation approach:

1.  **HTML5 Validation**: Standard attributes like `required`, `type="number"`, and `min="0"` are used on inputs to provide immediate browser-level feedback.
2.  **Reactive UI**: The "Submit" button in forms (e.g., `TransactionDialog`) is dynamically disabled using React state if required fields are empty.
    - *Example*: `disabled={!formData.amount || !formData.categoryId}`
3.  **Logical Guard**: The submission handler (`handleSubmit`) performs a final check before calling the database store, preventing accidental empty entries.
4.  **Local State**: All form inputs are "controlled components," meaning their values are always synced with a local React `useState` object for real-time tracking.

---

## 5. Example Flow: Adding a Transaction

Here is a step-by-step trace of what happens when you add an expense:

1.  **UI Trigger**: User clicks "Add Expense" in `src/app/transactions/page.tsx`.
2.  **Input Collection**: A dialog opens, collecting the amount, category, and description.
3.  **Store Action**: On submit, the `addTransaction` function in `src/lib/stores/transactionStore.ts` is called.
4.  **Database Write**: The store generates a unique ID (UUID) and saves the record into the IndexedDB using `db.transactions.add()`.
5.  **State Update**: The store updates its internal list of transactions.
6.  **UI Update**: 
    - The **Transaction List** re-renders to show the new item.
    - The **Dashboard Metrics** recalculate the "Monthly Expenses" automatically.
    - A **Success Notification** appears via the `notificationStore`.

---

### Academic Summary
Lunaris demonstrates a modern **Single Page Application (SPA)** approach using **Next.js**. It highlights **Separation of Concerns** by cleanly dividing UI (Components), Data (Dexie), and Business Logic (Zustand Stores), making it a robust and scalable frontend project.
