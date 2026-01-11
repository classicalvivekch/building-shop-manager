# Building Shop Manager

A comprehensive business management system for a building material shop.

## Prerequisites

- Node.js (v18 or higher recommended)
- MySQL Database

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Ensure you have a `.env` file in the root directory with your database connection string and secret keys:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="your-secret-key"
   ADMIN_SECRET="your-admin-secret"
   ```

3. **Database Setup**
   Initialize the database and seed it with initial data:
   ```bash
   # Push schema to database
   npx prisma db push

   # Seed initial data (admin user, categories, etc.)
   npx prisma db seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Common Commands

- **Stop Server**: Press `Ctrl + C` in the terminal.
- **Restart Server**: Run `npm run dev` again.
- **Open Studio**: Run `npx prisma studio` to view database records in a UI.

## Project Structure

- `/src/app` - Frontend pages and API routes
- `/src/components` - Reusable UI components
- `/prisma` - Database schema and seed scripts
