import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ date: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { date } = await params
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        // Get sales for this date using raw SQL to include clientPhoto
        const salesRaw = await prisma.$queryRaw`
            SELECT s.id, s.orderNumber, s.customerId, s.totalAmount, s.isBorrow, 
                   s.paymentStatus, s.clientPhoto, s.createdBy, s.createdAt,
                   c.name as customerName, c.mobile as customerMobile,
                   u.name as creatorName
            FROM sales s
            LEFT JOIN customers c ON s.customerId = c.id
            LEFT JOIN users u ON s.createdBy = u.id
            WHERE s.createdAt >= ${targetDate} AND s.createdAt < ${nextDay}
            ORDER BY s.createdAt DESC
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

        // Get items for each sale
        const sales = await Promise.all(
            salesRaw.map(async (sale) => {
                const items = await prisma.$queryRaw`
                    SELECT si.id, si.quantity, si.rate, si.subtotal, 
                           i.name as itemName, i.unit as itemUnit
                    FROM sale_items si
                    LEFT JOIN inventory_items i ON si.itemId = i.id
                    WHERE si.saleId = ${sale.id}
                ` as Array<{
                    id: number
                    quantity: number
                    rate: number
                    subtotal: number
                    itemName: string
                    itemUnit: string
                }>

                return {
                    id: sale.id,
                    orderNumber: sale.orderNumber,
                    totalAmount: sale.totalAmount,
                    isBorrow: sale.isBorrow ? true : false,
                    paymentStatus: sale.paymentStatus,
                    clientPhoto: sale.clientPhoto,
                    createdAt: sale.createdAt,
                    customer: sale.customerName ? { name: sale.customerName, mobile: sale.customerMobile } : null,
                    creator: { name: sale.creatorName },
                    items: items.map(item => ({
                        quantity: item.quantity,
                        rate: item.rate,
                        subtotal: item.subtotal,
                        item: { name: item.itemName, unit: item.itemUnit }
                    }))
                }
            })
        )

        // Get expenses for this date using raw SQL to include receiptPhoto
        const expensesRaw = await prisma.$queryRaw`
            SELECT e.id, e.description, e.amount, e.category, e.expenseDate, 
                   e.receiptPhoto, e.createdBy, e.createdAt,
                   u.name as creatorName
            FROM expenses e
            LEFT JOIN users u ON e.createdBy = u.id
            WHERE e.expenseDate >= ${targetDate} AND e.expenseDate < ${nextDay}
            ORDER BY e.expenseDate DESC
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

        const expenses = expensesRaw.map(exp => ({
            id: exp.id,
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            expenseDate: exp.expenseDate,
            receiptPhoto: exp.receiptPhoto,
            creator: { name: exp.creatorName }
        }))

        // Calculate totals
        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
        const totalBorrows = sales.filter(s => s.isBorrow).reduce((sum, sale) => sum + Number(sale.totalAmount), 0)

        return NextResponse.json({
            date,
            sales,
            expenses,
            totals: {
                sales: totalSales,
                expenses: totalExpenses,
                borrows: totalBorrows,
            },
        })
    } catch (error) {
        console.error('Calendar date error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
