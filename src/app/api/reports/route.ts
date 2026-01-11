import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'today'
        const customStart = searchParams.get('startDate')
        const customEnd = searchParams.get('endDate')

        // Calculate date range based on period
        const now = new Date()
        let startDate: Date
        let endDate: Date = new Date(now)
        endDate.setHours(23, 59, 59, 999)

        // Previous period for comparison
        let prevStartDate: Date
        let prevEndDate: Date

        switch (period) {
            case 'yesterday':
                startDate = new Date(now)
                startDate.setDate(startDate.getDate() - 1)
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(startDate)
                endDate.setHours(23, 59, 59, 999)
                prevStartDate = new Date(startDate)
                prevStartDate.setDate(prevStartDate.getDate() - 1)
                prevEndDate = new Date(prevStartDate)
                prevEndDate.setHours(23, 59, 59, 999)
                break
            case 'week':
                startDate = new Date(now)
                startDate.setDate(startDate.getDate() - 7)
                startDate.setHours(0, 0, 0, 0)
                prevStartDate = new Date(startDate)
                prevStartDate.setDate(prevStartDate.getDate() - 7)
                prevEndDate = new Date(startDate)
                prevEndDate.setDate(prevEndDate.getDate() - 1)
                prevEndDate.setHours(23, 59, 59, 999)
                break
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
                prevEndDate.setHours(23, 59, 59, 999)
                break
            case 'custom':
                startDate = customStart ? new Date(customStart) : new Date(now)
                startDate.setHours(0, 0, 0, 0)
                endDate = customEnd ? new Date(customEnd) : new Date(now)
                endDate.setHours(23, 59, 59, 999)
                const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                prevEndDate = new Date(startDate)
                prevEndDate.setDate(prevEndDate.getDate() - 1)
                prevEndDate.setHours(23, 59, 59, 999)
                prevStartDate = new Date(prevEndDate)
                prevStartDate.setDate(prevStartDate.getDate() - daysDiff + 1)
                prevStartDate.setHours(0, 0, 0, 0)
                break
            default: // today
                startDate = new Date(now)
                startDate.setHours(0, 0, 0, 0)
                prevStartDate = new Date(startDate)
                prevStartDate.setDate(prevStartDate.getDate() - 1)
                prevEndDate = new Date(prevStartDate)
                prevEndDate.setHours(23, 59, 59, 999)
        }

        // Get sales for current period
        const salesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(totalAmount), 0) as total, COUNT(*) as count
            FROM sales 
            WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
        ` as Array<{ total: number, count: bigint }>
        const totalSales = Number(salesResult[0]?.total || 0)
        const salesCount = Number(salesResult[0]?.count || 0)

        // Get sales for previous period
        const prevSalesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(totalAmount), 0) as total
            FROM sales 
            WHERE createdAt >= ${prevStartDate} AND createdAt <= ${prevEndDate}
        ` as Array<{ total: number }>
        const prevTotalSales = Number(prevSalesResult[0]?.total || 0)
        const salesChange = prevTotalSales > 0
            ? ((totalSales - prevTotalSales) / prevTotalSales) * 100
            : (totalSales > 0 ? 100 : 0)

        // Get expenses for current period
        const expensesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
            FROM expenses 
            WHERE expenseDate >= ${startDate} AND expenseDate <= ${endDate}
        ` as Array<{ total: number, count: bigint }>
        const totalExpenses = Number(expensesResult[0]?.total || 0)

        // Get expenses for previous period
        const prevExpensesResult = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE expenseDate >= ${prevStartDate} AND expenseDate <= ${prevEndDate}
        ` as Array<{ total: number }>
        const prevTotalExpenses = Number(prevExpensesResult[0]?.total || 0)
        const expensesChange = prevTotalExpenses > 0
            ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100
            : (totalExpenses > 0 ? 100 : 0)

        // Calculate net profit
        const netProfit = totalSales - totalExpenses
        const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0

        // Sales by Category (from inventory items sold)
        const categoryStats = await prisma.$queryRaw`
            SELECT i.category, SUM(si.subtotal) as total
            FROM sale_items si
            JOIN inventory_items i ON si.itemId = i.id
            JOIN sales s ON si.saleId = s.id
            WHERE s.createdAt >= ${startDate} AND s.createdAt <= ${endDate}
            GROUP BY i.category
            ORDER BY total DESC
        ` as Array<{ category: string, total: number }>

        const totalCategorySales = categoryStats.reduce((sum, c) => sum + Number(c.total), 0)
        const salesByCategory = categoryStats.map(c => ({
            category: c.category,
            amount: Number(c.total),
            percentage: totalCategorySales > 0 ? Math.round((Number(c.total) / totalCategorySales) * 100) : 0
        }))

        // Top Selling Items
        const topItems = await prisma.$queryRaw`
            SELECT i.id, i.name, i.unit, SUM(si.quantity) as totalQty, SUM(si.subtotal) as totalAmount
            FROM sale_items si
            JOIN inventory_items i ON si.itemId = i.id
            JOIN sales s ON si.saleId = s.id
            WHERE s.createdAt >= ${startDate} AND s.createdAt <= ${endDate}
            GROUP BY i.id, i.name, i.unit
            ORDER BY totalAmount DESC
            LIMIT 5
        ` as Array<{ id: number, name: string, unit: string, totalQty: number, totalAmount: number }>

        // Customer Breakdown
        const customerStats = await prisma.$queryRaw`
            SELECT c.id, c.name, c.mobile, 
                   COUNT(DISTINCT s.id) as orderCount,
                   SUM(s.totalAmount) as totalSpent,
                   MAX(s.createdAt) as lastOrder,
                   SUM(CASE WHEN s.paymentStatus = 'PAID' THEN s.totalAmount ELSE 0 END) as paidAmount,
                   SUM(CASE WHEN s.paymentStatus != 'PAID' THEN s.totalAmount ELSE 0 END) as pendingAmount
            FROM customers c
            JOIN sales s ON c.id = s.customerId
            WHERE s.createdAt >= ${startDate} AND s.createdAt <= ${endDate}
            GROUP BY c.id, c.name, c.mobile
            ORDER BY totalSpent DESC
            LIMIT 10
        ` as Array<{
            id: number, name: string, mobile: string,
            orderCount: bigint, totalSpent: number, lastOrder: Date,
            paidAmount: number, pendingAmount: number
        }>

        const customers = customerStats.map(c => ({
            id: c.id,
            name: c.name,
            mobile: c.mobile,
            orderCount: Number(c.orderCount),
            totalSpent: Number(c.totalSpent),
            paidAmount: Number(c.paidAmount),
            pendingAmount: Number(c.pendingAmount),
            isRepeat: Number(c.orderCount) > 1
        }))

        // Employee Performance (User-wise)
        const employeeStats = await prisma.$queryRaw`
            SELECT u.id, u.name, u.email,
                   COUNT(DISTINCT s.id) as salesCount,
                   COALESCE(SUM(s.totalAmount), 0) as totalSales
            FROM users u
            LEFT JOIN sales s ON u.id = s.createdBy 
                AND s.createdAt >= ${startDate} AND s.createdAt <= ${endDate}
            WHERE u.role = 'EMPLOYEE' OR u.role = 'ADMIN'
            GROUP BY u.id, u.name, u.email
            ORDER BY totalSales DESC
        ` as Array<{ id: number, name: string, email: string, salesCount: bigint, totalSales: number }>

        const employees = employeeStats.map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            salesCount: Number(e.salesCount),
            totalSales: Number(e.totalSales)
        }))

        // Monthly Summary
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        lastDayOfMonth.setHours(23, 59, 59, 999)

        const monthlyInvoicesResult = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM sales 
            WHERE createdAt >= ${firstDayOfMonth} AND createdAt <= ${lastDayOfMonth}
        ` as Array<{ count: bigint }>

        // Inventory losses (items with negative adjustments or damaged)
        const inventoryLoss = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM expenses 
            WHERE category = 'INVENTORY' 
            AND expenseDate >= ${firstDayOfMonth} AND expenseDate <= ${lastDayOfMonth}
        ` as Array<{ total: number }>

        return NextResponse.json({
            period,
            dateRange: { start: startDate, end: endDate },
            summary: {
                totalSales,
                salesCount,
                salesChange: Math.round(salesChange),
                totalExpenses,
                expensesChange: Math.round(expensesChange),
                netProfit,
                profitMargin: Math.round(profitMargin)
            },
            salesByCategory,
            topSellingItems: topItems.map(i => ({
                id: i.id,
                name: i.name,
                unit: i.unit,
                quantitySold: Number(i.totalQty),
                totalAmount: Number(i.totalAmount)
            })),
            customers,
            employees,
            monthlySummary: {
                totalInvoices: Number(monthlyInvoicesResult[0]?.count || 0),
                inventoryLoss: Number(inventoryLoss[0]?.total || 0)
            }
        })
    } catch (error) {
        console.error('Reports error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
