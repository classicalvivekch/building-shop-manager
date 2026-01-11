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

        // Get today's sales using raw SQL to avoid Prisma sync issues
        const todaySalesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(totalAmount), 0) as total, COUNT(*) as count
            FROM sales 
            WHERE createdAt >= ${today} AND createdAt < ${tomorrow}
        ` as Array<{ total: number, count: bigint }>
        const todaySalesTotal = Number(todaySalesResult[0]?.total || 0)

        // Get today's expenses using raw SQL
        const todayExpensesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
            FROM expenses 
            WHERE expenseDate >= ${today} AND expenseDate < ${tomorrow}
        ` as Array<{ total: number, count: bigint }>
        const todayExpensesTotal = Number(todayExpensesResult[0]?.total || 0)

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

        // Calculate monthly expenses using raw SQL
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        const monthlyExpensesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE expenseDate >= ${firstDayOfMonth} AND expenseDate <= ${lastDayOfMonth}
        ` as Array<{ total: number }>
        const monthlyExpensesTotal = Number(monthlyExpensesResult[0]?.total || 0)

        // Calculate monthly stats (for admin only)
        let monthlyStats = null
        if (isAdmin(user)) {
            const monthlySalesResult = await prisma.$queryRaw`
                SELECT COALESCE(SUM(totalAmount), 0) as total, COUNT(*) as count
                FROM sales 
                WHERE createdAt >= ${firstDayOfMonth} AND createdAt <= ${lastDayOfMonth}
                AND paymentStatus IN ('PAID', 'PARTIAL')
            ` as Array<{ total: number, count: bigint }>
            const monthlyRevenue = Number(monthlySalesResult[0]?.total || 0)
            const totalInvoices = Number(monthlySalesResult[0]?.count || 0)

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

        // Get recent sales using raw SQL to include clientPhoto
        const recentSalesRaw = await prisma.$queryRaw`
            SELECT s.id, s.orderNumber, s.customerId, s.totalAmount, s.isBorrow, 
                   s.paymentStatus, s.clientPhoto, s.createdBy, s.createdAt,
                   c.name as customerName, c.mobile as customerMobile,
                   u.name as creatorName
            FROM sales s
            LEFT JOIN customers c ON s.customerId = c.id
            LEFT JOIN users u ON s.createdBy = u.id
            ORDER BY s.createdAt DESC
            LIMIT 5
        ` as Array<{
            id: number
            orderNumber: string
            customerId: number | null
            totalAmount: number
            isBorrow: boolean
            paymentStatus: string
            clientPhoto: string | null
            createdBy: number
            createdAt: Date
            customerName: string | null
            customerMobile: string | null
            creatorName: string
        }>

        const recentSales = recentSalesRaw.map(sale => ({
            id: sale.id,
            orderNumber: sale.orderNumber,
            totalAmount: sale.totalAmount,
            isBorrow: sale.isBorrow ? true : false,
            paymentStatus: sale.paymentStatus,
            clientPhoto: sale.clientPhoto,
            createdAt: sale.createdAt,
            customer: sale.customerName ? { name: sale.customerName, mobile: sale.customerMobile } : null,
            creator: { name: sale.creatorName }
        }))

        // Get recent expenses using raw SQL to include receiptPhoto
        const recentExpensesRaw = await prisma.$queryRaw`
            SELECT e.id, e.description, e.amount, e.category, e.expenseDate, 
                   e.receiptPhoto, e.createdBy, e.createdAt,
                   u.name as creatorName
            FROM expenses e
            LEFT JOIN users u ON e.createdBy = u.id
            ORDER BY e.expenseDate DESC
            LIMIT 5
        ` as Array<{
            id: number
            description: string
            amount: number
            category: string
            expenseDate: Date
            receiptPhoto: string | null
            createdBy: number
            createdAt: Date
            creatorName: string
        }>

        const recentExpenses = recentExpensesRaw.map(exp => ({
            id: exp.id,
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            expenseDate: exp.expenseDate,
            receiptPhoto: exp.receiptPhoto,
            creator: { name: exp.creatorName }
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
                sales: recentSales,
                expenses: recentExpenses,
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
