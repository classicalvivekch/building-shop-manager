import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

// GET sales made by an employee
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const userId = parseInt(id)

        // Get all sales made by this employee
        const sales = await prisma.$queryRaw`
            SELECT 
                s.id, 
                s.orderNumber, 
                s.totalAmount, 
                s.paymentStatus, 
                s.createdAt,
                c.name as customerName,
                c.mobile as customerMobile
            FROM sales s
            LEFT JOIN customers c ON s.customerId = c.id
            WHERE s.createdBy = ${userId}
            ORDER BY s.createdAt DESC
            LIMIT 50
        ` as any[]

        // Get sales items for each sale
        const salesWithItems = await Promise.all(sales.map(async (sale) => {
            const items = await prisma.$queryRaw`
                SELECT 
                    si.quantity,
                    si.rate,
                    si.subtotal,
                    i.name as itemName
                FROM sale_items si
                JOIN inventory_items i ON si.itemId = i.id
                WHERE si.saleId = ${sale.id}
            ` as any[]

            return {
                ...sale,
                items
            }
        }))

        return NextResponse.json({ sales: salesWithItems })
    } catch (error: any) {
        console.error('Error fetching employee sales:', error)
        return NextResponse.json({
            error: 'Failed to fetch sales',
            details: error?.message
        }, { status: 500 })
    }
}
