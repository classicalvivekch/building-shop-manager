# Building Material Shop Manager - Complete Prompt

Use this prompt to recreate the Building Material Shop Manager application from scratch.

---

## 🎯 Project Overview

Build a **mobile-first business management system** for a small building materials shop. The app should help track inventory, sales, expenses, borrowers, and employees with role-based access (Admin & Employee).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16+ with App Router, React, TypeScript
- **Styling**: CSS (mobile-first, max-width 430px container)
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies

---

## 👥 User Roles

### Admin
- Full access to all features
- Manage employees (add/edit/delete)
- View all reports and analytics
- Manage inventory (add/edit/delete items)
- View borrower reports and mark returns

### Employee
- View and create sales
- View and create expenses
- View inventory (read-only)
- Access personal settings

---

## 📦 Core Modules

### 1. Authentication
- Login page with email/password
- Role-based redirects (admin → /dashboard, employee → /employee)
- JWT tokens stored in HTTP-only cookies
- Session management with /api/auth/me endpoint

### 2. Inventory Management
- List all items with search and category filter
- Categories: Cement, Steel, Bricks, Paint, Aggregates, Plumbing, Wood, Other
- Track: quantity, purchase rate, selling rate, low stock threshold
- Stock calculations: totalPurchased, totalSold, remaining
- Progress bar showing stock levels (red if low)
- Edit/Delete items with confirmation
- Add new inventory items

### 3. Sales
- Create new sales with customer details
- Multi-item sales with quantity and rate
- Payment types: PAID or BORROW
- Client photo upload (mandatory)
- Order number auto-generation (ORD-YYYYMMDD-XXXX)
- Sales list with filters
- Sale summary popup with items, amounts, sold by info

### 4. Expenses
- Create expenses with description, amount, category
- Receipt photo upload (mandatory)
- Categories: MATERIAL, TRANSPORT, UTILITIES, SALARY, MAINTENANCE, OTHER
- Expense list with filters
- View expense details with receipt

### 5. Borrower Report
- Stats: Active Borrowers count, Overdue Items count
- Overdue Alerts with "Remind Later" and "Returned" buttons
- Recent Borrows list with outstanding amounts
- Mark as Returned functionality
- 7-day overdue threshold

### 6. Reports Dashboard
- Time period filters: Today, Yesterday, This Week, This Month, Custom
- Financial overview: Total Sales, Expenses, Net Profit with % changes
- Sales by Category (pie chart visualization)
- Top Selling Items
- Customer Breakdown (orders, total spent, paid/pending)
- Employee Performance (sales count, total sales)
- Download report button

### 7. Calendar
- Monthly view with sales/expense indicators
- Click date to see details
- Shows: Sales (+amount), Expenses (-amount), Borrow (amount)
- Transaction list for selected date

### 8. Employee Management (Admin only)
- List all employees
- Add new employee with name, email, password
- Edit employee details
- View employee sales and salary history
- Pay salary with modal

### 9. Settings
- Edit profile (name, email)
- Change password
- Logout

### 10. Dashboard
- Welcome header with user name
- Today's Sales and Expenses cards
- Inventory Health (capacity %, low stock count)
- Quick Actions grid (Inventory, Sales, Expenses, Reports, Borrowers, Calendar, Employees)
- Monthly Summary (Net Profit, Revenue, Expenses)
- Recent Activity feed

---

## 🗄️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(EMPLOYEE)
  createdAt DateTime @default(now())
}

model Customer {
  id        Int      @id @default(autoincrement())
  name      String
  mobile    String?
  address   String?
  createdAt DateTime @default(now())
  sales     Sale[]
}

model InventoryItem {
  id                Int      @id @default(autoincrement())
  name              String
  unit              String
  category          String
  purchaseRate      Decimal
  sellingRate       Decimal
  quantity          Int      @default(0)
  totalPurchased    Int      @default(0)
  totalSold         Int      @default(0)
  lowStockThreshold Int      @default(10)
  createdAt         DateTime @default(now())
}

model Sale {
  id            Int           @id @default(autoincrement())
  orderNumber   String        @unique
  customerId    Int?
  totalAmount   Decimal
  isBorrow      Boolean       @default(false)
  paymentStatus PaymentStatus @default(PAID)
  notes         String?
  clientPhoto   String?
  createdBy     Int
  createdAt     DateTime      @default(now())
  items         SaleItem[]
  borrowRecord  BorrowRecord?
}

model SaleItem {
  id       Int     @id @default(autoincrement())
  saleId   Int
  itemId   Int?    // Nullable - allows item deletion
  itemName String? // Preserved when item deleted
  quantity Int
  rate     Decimal
  subtotal Decimal
}

model Expense {
  id           Int             @id @default(autoincrement())
  description  String
  amount       Decimal
  category     ExpenseCategory
  expenseDate  DateTime
  receiptPhoto String?
  createdBy    Int
  createdAt    DateTime        @default(now())
}

model BorrowRecord {
  id                Int       @id @default(autoincrement())
  saleId            Int       @unique
  borrowDate        DateTime
  dueDate           DateTime
  outstandingAmount Decimal
  isReturned        Boolean   @default(false)
  returnedAt        DateTime?
  reminderDismissed Boolean   @default(false)
}

enum Role { ADMIN, EMPLOYEE }
enum PaymentStatus { PAID, PENDING }
enum ExpenseCategory { MATERIAL, TRANSPORT, UTILITIES, SALARY, MAINTENANCE, OTHER }
```

---

## 🎨 Design Guidelines

### Colors
- Primary: #2563eb (Blue)
- Success: #22c55e (Green)
- Danger: #ef4444 (Red)
- Warning: #f59e0b (Orange)
- Background: #f8fafc
- Text Primary: #1e293b
- Text Secondary: #64748b

### Components
- Cards with 16px border-radius, subtle shadows
- Buttons: 12px border-radius, 14px padding
- Input fields: 12px border-radius, #f8fafc background
- Bottom navigation with 5 items (Home, center action, Settings)
- Category chips with filter functionality
- Modal overlays with dark backdrop

### Mobile-First
- Max container width: 430px
- Centered layout
- Bottom nav fixed at bottom
- FAB (Floating Action Button) for add actions
- Touch-friendly 44px minimum tap targets

---

## 📱 Page Structure

```
/                     → Login
/dashboard            → Admin Dashboard
/dashboard/inventory  → Inventory List
/dashboard/inventory/new → Add Inventory
/dashboard/inventory/[id]/edit → Edit Inventory
/dashboard/sales      → Sales List
/dashboard/sales/new  → New Sale (multi-step)
/dashboard/expenses   → Expenses List
/dashboard/expenses/new → New Expense
/dashboard/reports    → Reports Dashboard
/dashboard/borrowers  → Borrower Report
/dashboard/calendar   → Calendar View
/dashboard/employees  → Employee List
/dashboard/employees/[id] → Employee Details
/dashboard/employees/[id]/edit → Edit Employee
/dashboard/settings   → Admin Settings
/employee             → Employee Dashboard
/employee/sales       → Employee Sales
/employee/expenses    → Employee Expenses
/employee/settings    → Employee Settings
```

---

## 🔑 Key Features to Remember

1. **Mandatory Photos**: Client photo for sales, Receipt photo for expenses
2. **Raw SQL Queries**: Use Prisma.$queryRaw for complex queries to avoid sync issues
3. **Soft Delete**: When deleting inventory items, preserve item name in sales records
4. **Real-time Updates**: Refresh data after actions
5. **Error Handling**: User-friendly error messages
6. **Loading States**: Spinner component for async operations
7. **Confirmation Modals**: For destructive actions like delete

---

## 🚀 Setup Instructions

1. Create Next.js project: `npx create-next-app@latest building-shop-manager`
2. Install dependencies: `npm install prisma @prisma/client bcryptjs jsonwebtoken`
3. Initialize Prisma: `npx prisma init`
4. Configure MySQL in .env: `DATABASE_URL="mysql://user:password@localhost:3306/building_shop"`
5. Add JWT_SECRET to .env
6. Run migrations: `npx prisma db push`
7. Seed database with admin user
8. Start dev server: `npm run dev`

---

## 📝 Notes

- Use HTTP-only cookies for JWT storage (secure)
- Implement role-based middleware for API routes
- Use onDelete: SetNull for inventory items in sale_items
- Format currency as ₹ (Indian Rupee)
- Date format: MMM DD, YYYY
- All dates stored in UTC, displayed in local timezone
