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

        // Get sales for this date using Prisma ORM
        const salesData = await prisma.sale.findMany({
            where: {
                createdAt: { gte: targetDate, lt: nextDay }
            },
            include: {
                customer: true,
                creator: { select: { name: true } },
                items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const sales = salesData.map(sale => ({
            id: sale.id,
            orderNumber: sale.orderNumber,
            totalAmount: sale.totalAmount,
            isBorrow: sale.isBorrow,
            paymentStatus: sale.paymentStatus,
            clientPhoto: sale.clientPhoto,
            createdAt: sale.createdAt,
            customer: sale.customer ? { name: sale.customer.name, mobile: sale.customer.mobile } : null,
            creator: { name: sale.creator.name },
            items: sale.items.map(saleItem => ({
                quantity: saleItem.quantity,
                rate: saleItem.rate,
                subtotal: saleItem.subtotal,
                item: {
                    name: saleItem.item?.name || saleItem.itemName || 'Unknown Item',
                    unit: saleItem.item?.unit || 'unit'
                }
            }))
        }))

        // Get expenses for this date using Prisma ORM
        const expensesData = await prisma.expense.findMany({
            where: {
                expenseDate: { gte: targetDate, lt: nextDay }
            },
            include: {
                creator: { select: { name: true } }
            },
            orderBy: { expenseDate: 'desc' }
        })

        const expenses = expensesData.map(exp => ({
            id: exp.id,
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            expenseDate: exp.expenseDate,
            receiptPhoto: exp.receiptPhoto,
            creator: { name: exp.creator.name }
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
