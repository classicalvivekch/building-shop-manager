const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'shop_salt_2024').digest('hex')
}

async function main() {
    console.log('Creating test users...')

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
    console.log('Created admin:', admin.email)

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
    console.log('Created employee:', employee.email)

    // Create some inventory items
    const items = [
        { name: 'UltraTech Cement', unit: 'Bag (50kg)', category: 'Cement', purchaseRate: 320, sellingRate: 380, quantity: 180, totalPurchased: 500, totalSold: 320, lowStockThreshold: 50 },
        { name: 'TATA Steel 8mm', unit: 'Rod (12m)', category: 'Steel', purchaseRate: 380, sellingRate: 450, quantity: 8, totalPurchased: 200, totalSold: 192, lowStockThreshold: 20 },
        { name: 'Red Clay Bricks', unit: 'Piece', category: 'Bricks', purchaseRate: 6, sellingRate: 8, quantity: 8000, totalPurchased: 10000, totalSold: 2000, lowStockThreshold: 1000 },
        { name: 'Asian Paints White', unit: 'Bucket (20L)', category: 'Paint', purchaseRate: 2000, sellingRate: 2400, quantity: 22, totalPurchased: 50, totalSold: 28, lowStockThreshold: 10 },
    ]

    for (let i = 0; i < items.length; i++) {
        await prisma.inventoryItem.upsert({
            where: { id: i + 1 },
            update: {},
            create: items[i],
        })
    }
    console.log('Created inventory items')

    console.log('Seed complete!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
