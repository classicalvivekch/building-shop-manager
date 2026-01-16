import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Get today's sales using Prisma aggregate
        const todaySalesResult = await prisma.sale.aggregate({
            where: {
                createdAt: { gte: today, lt: tomorrow }
            },
            _sum: { totalAmount: true },
            _count: { id: true }
        })
        const todaySalesTotal = Number(todaySalesResult._sum.totalAmount || 0)

        // Get today's expenses using Prisma aggregate
        const todayExpensesResult = await prisma.expense.aggregate({
            where: {
                expenseDate: { gte: today, lt: tomorrow }
            },
            _sum: { amount: true },
            _count: { id: true }
        })
        const todayExpensesTotal = Number(todayExpensesResult._sum.amount || 0)

        // Get inventory stats
        const inventory = await prisma.inventoryItem.findMany()
        const totalItems = inventory.length
        const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold)
        const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * Number(item.sellingRate)), 0)
        const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0)

        // Get overdue borrows (> 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const overdueBorrows = await prisma.borrowRecord.findMany({
            where: {
                isReturned: false,
                borrowDate: { lt: sevenDaysAgo },
                reminderDismissed: false,
            },
            include: {
                sale: {
                    include: { customer: true, items: { include: { item: true } } },
                },
            },
        })

        // Get active borrows
        const activeBorrows = await prisma.borrowRecord.findMany({
            where: { isReturned: false },
            include: {
                sale: {
                    include: { customer: true },
                },
            },
        })

        // Calculate monthly expenses using Prisma aggregate
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        const monthlyExpensesResult = await prisma.expense.aggregate({
            where: {
                expenseDate: { gte: firstDayOfMonth, lte: lastDayOfMonth }
            },
            _sum: { amount: true }
        })
        const monthlyExpensesTotal = Number(monthlyExpensesResult._sum.amount || 0)

        // Calculate monthly stats (for admin only)
        let monthlyStats = null
        if (isAdmin(user)) {
            const monthlySalesResult = await prisma.sale.aggregate({
                where: {
                    createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
                    paymentStatus: { in: ['PAID', 'PARTIAL'] }
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            })
            const monthlyRevenue = Number(monthlySalesResult._sum.totalAmount || 0)
            const totalInvoices = monthlySalesResult._count.id || 0

            const monthlyPurchases = await prisma.purchase.findMany({
                where: {
                    purchaseDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
                },
            })
            const monthlyPurchaseCost = monthlyPurchases.reduce((sum, p) => sum + Number(p.totalCost), 0)

            monthlyStats = {
                revenue: monthlyRevenue,
                expenses: monthlyExpensesTotal,
                purchaseCost: monthlyPurchaseCost,
                profit: monthlyRevenue - monthlyExpensesTotal - monthlyPurchaseCost,
                totalInvoices,
            }
        }

        // Get recent sales using Prisma ORM
        const recentSales = await prisma.sale.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                creator: { select: { name: true } }
            }
        })

        const formattedRecentSales = recentSales.map(sale => ({
            id: sale.id,
            orderNumber: sale.orderNumber,
            totalAmount: sale.totalAmount,
            isBorrow: sale.isBorrow,
            paymentStatus: sale.paymentStatus,
            clientPhoto: sale.clientPhoto,
            createdAt: sale.createdAt,
            customer: sale.customer ? { name: sale.customer.name, mobile: sale.customer.mobile } : null,
            creator: { name: sale.creator.name }
        }))

        // Get recent expenses using Prisma ORM
        const recentExpenses = await prisma.expense.findMany({
            take: 5,
            orderBy: { expenseDate: 'desc' },
            include: {
                creator: { select: { name: true } }
            }
        })

        const formattedRecentExpenses = recentExpenses.map(exp => ({
            id: exp.id,
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            expenseDate: exp.expenseDate,
            receiptPhoto: exp.receiptPhoto,
            creator: { name: exp.creator.name }
        }))

        return NextResponse.json({
            todaySales: todaySalesTotal,
            todayExpenses: todayExpensesTotal,
            monthlyExpenses: monthlyExpensesTotal,
            inventory: {
                totalItems,
                lowStockCount: lowStockItems.length,
                lowStockItems,
                totalValue,
                totalUnits,
                capacityPercent: Math.min(100, Math.round((totalUnits / (totalItems * 100)) * 100)),
            },
            borrows: {
                overdueCount: overdueBorrows.length,
                overdueBorrows,
                activeCount: activeBorrows.length,
                activeBorrows,
            },
            monthlyStats,
            recentActivity: {
                sales: formattedRecentSales,
                expenses: formattedRecentExpenses,
            },
        })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
