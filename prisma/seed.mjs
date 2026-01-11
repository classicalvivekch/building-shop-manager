import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/building_shop',
})

function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'shop_salt_2024').digest('hex')
}

async function main() {
    console.log('🌱 Seeding database...')

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@shop.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@shop.com',
            password: hashPassword('admin123'),
            role: 'ADMIN',
        },
    })
    console.log('✅ Created admin user:', admin.email)

    // Create Employee User
    const employee = await prisma.user.upsert({
        where: { email: 'employee@shop.com' },
        update: {},
        create: {
            name: 'Michael Scott',
            email: 'employee@shop.com',
            password: hashPassword('employee123'),
            role: 'EMPLOYEE',
        },
    })
    console.log('✅ Created employee user:', employee.email)

    // Create Inventory Items
    const inventoryItems = [
        { name: 'UltraTech Cement', unit: 'Bag (50kg)', category: 'Cement', purchaseRate: 320, sellingRate: 380, quantity: 180, totalPurchased: 500, totalSold: 320, lowStockThreshold: 50 },
        { name: 'Portland Cement', unit: 'Bag (50kg)', category: 'Cement', purchaseRate: 300, sellingRate: 350, quantity: 120, totalPurchased: 300, totalSold: 180, lowStockThreshold: 30 },
        { name: 'TATA Steel 8mm', unit: 'Rod (12m)', category: 'Steel', purchaseRate: 380, sellingRate: 450, quantity: 8, totalPurchased: 200, totalSold: 192, lowStockThreshold: 20 },
        { name: 'TMT Steel Bars', unit: 'Rod (12m)', category: 'Steel', purchaseRate: 400, sellingRate: 480, quantity: 45, totalPurchased: 100, totalSold: 55, lowStockThreshold: 15 },
        { name: 'Red Clay Bricks', unit: 'Piece', category: 'Bricks', purchaseRate: 6, sellingRate: 8, quantity: 8000, totalPurchased: 10000, totalSold: 2000, lowStockThreshold: 1000 },
        { name: 'Asian Paints White', unit: 'Bucket (20L)', category: 'Paint', purchaseRate: 2000, sellingRate: 2400, quantity: 22, totalPurchased: 50, totalSold: 28, lowStockThreshold: 10 },
        { name: 'River Sand', unit: 'Truck Load', category: 'Aggregates', purchaseRate: 2000, sellingRate: 2500, quantity: 15, totalPurchased: 30, totalSold: 15, lowStockThreshold: 5 },
        { name: 'Steel Rods 10mm', unit: 'Kg', category: 'Steel', purchaseRate: 1.8, sellingRate: 2.1, quantity: 200, totalPurchased: 500, totalSold: 300, lowStockThreshold: 100 },
        { name: '50mm PVC Pipes', unit: 'Piece (6m)', category: 'Plumbing', purchaseRate: 80, sellingRate: 120, quantity: 45, totalPurchased: 100, totalSold: 55, lowStockThreshold: 20 },
        { name: 'Plywood Sheets', unit: 'Sheet (8x4)', category: 'Wood', purchaseRate: 800, sellingRate: 1000, quantity: 30, totalPurchased: 60, totalSold: 30, lowStockThreshold: 10 },
    ]

    for (let i = 0; i < inventoryItems.length; i++) {
        await prisma.inventoryItem.upsert({
            where: { id: i + 1 },
            update: {},
            create: inventoryItems[i],
        })
    }
    console.log('✅ Created inventory items')

    // Create Sample Customers
    const customers = [
        { name: 'John Carpenter', mobile: '9876543210', address: '123 Main Street, City' },
        { name: 'Sarah Smith', mobile: '9876543211', address: '456 Oak Avenue, Town' },
        { name: 'Mike Ross', mobile: '9876543212', address: '789 Pine Road, Village' },
        { name: 'Elena Fisher', mobile: '9876543213', address: '321 Cedar Lane, District' },
        { name: 'John Doe Const.', mobile: '9876543214', address: '555 Builder Street, Metro' },
        { name: 'Sara Builders', mobile: '9876543215', address: '777 Construction Ave, Downtown' },
    ]

    for (const customer of customers) {
        await prisma.customer.upsert({
            where: { mobile: customer.mobile },
            update: {},
            create: customer,
        })
    }
    console.log('✅ Created sample customers')

    // Create Sample Expenses
    const expenses = [
        { description: 'Truck Fuel', amount: 320, category: 'TRANSPORT', createdBy: admin.id },
        { description: 'Electricity Bill', amount: 1500, category: 'UTILITIES', createdBy: admin.id },
        { description: 'Cement Bags Purchase', amount: 15000, category: 'INVENTORY', createdBy: admin.id },
        { description: 'Lunch for Staff', amount: 450, category: 'OTHER', createdBy: employee.id },
        { description: 'Delivery Fee', amount: 45, category: 'TRANSPORT', createdBy: employee.id },
    ]

    for (const expense of expenses) {
        await prisma.expense.create({ data: expense })
    }
    console.log('✅ Created sample expenses')

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
