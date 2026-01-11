import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const now = new Date()
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        // Previous week for comparison
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

        // Get all active borrows
        const activeBorrowsRaw = await prisma.$queryRaw`
            SELECT 
                br.id, br.borrowDate, br.dueDate, br.outstandingAmount, br.isReturned,
                br.reminderDismissed, br.saleId,
                s.orderNumber, s.totalAmount,
                c.id as customerId, c.name as customerName, c.mobile as customerMobile,
                DATEDIFF(NOW(), br.borrowDate) as daysSinceBorrow
            FROM borrow_records br
            JOIN sales s ON br.saleId = s.id
            LEFT JOIN customers c ON s.customerId = c.id
            WHERE br.isReturned = false
            ORDER BY br.borrowDate ASC
        ` as Array<{
            id: number
            borrowDate: Date
            dueDate: Date
            outstandingAmount: number
            isReturned: boolean
            reminderDismissed: boolean
            saleId: number
            orderNumber: string
            totalAmount: number
            customerId: number | null
            customerName: string | null
            customerMobile: string | null
            daysSinceBorrow: number
        }>

        // Get items for each borrow
        const activeBorrows = await Promise.all(
            activeBorrowsRaw.map(async (borrow) => {
                const items = await prisma.$queryRaw`
                    SELECT i.name, si.quantity
                    FROM sale_items si
                    JOIN inventory_items i ON si.itemId = i.id
                    WHERE si.saleId = ${borrow.saleId}
                ` as Array<{ name: string, quantity: number }>

                return {
                    id: borrow.id,
                    borrowDate: borrow.borrowDate,
                    dueDate: borrow.dueDate,
                    outstandingAmount: Number(borrow.outstandingAmount),
                    isOverdue: Number(borrow.daysSinceBorrow) > 7,
                    daysSinceBorrow: Number(borrow.daysSinceBorrow),
                    daysOverdue: Math.max(0, Number(borrow.daysSinceBorrow) - 7),
                    reminderDismissed: borrow.reminderDismissed ? true : false,
                    orderNumber: borrow.orderNumber,
                    customer: borrow.customerName ? {
                        id: borrow.customerId,
                        name: borrow.customerName,
                        mobile: borrow.customerMobile
                    } : null,
                    items: items.map(item => ({
                        name: item.name,
                        quantity: Number(item.quantity)
                    }))
                }
            })
        )

        // Calculate stats
        const totalActiveBorrows = activeBorrows.length
        const overdueBorrows = activeBorrows.filter(b => b.isOverdue && !b.reminderDismissed)
        const overdueCount = overdueBorrows.length
        const overdueRate = totalActiveBorrows > 0 ? Math.round((overdueCount / totalActiveBorrows) * 100) : 0

        // Get last week's stats for comparison
        const lastWeekBorrowsResult = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM borrow_records
            WHERE isReturned = false
            AND borrowDate < ${oneWeekAgo} AND borrowDate >= ${twoWeeksAgo}
        ` as Array<{ count: bigint }>
        const lastWeekBorrows = Number(lastWeekBorrowsResult[0]?.count || 0)
        const borrowsChange = lastWeekBorrows > 0
            ? Math.round(((totalActiveBorrows - lastWeekBorrows) / lastWeekBorrows) * 100)
            : (totalActiveBorrows > 0 ? 100 : 0)

        // Split into overdue alerts and recent borrows (not overdue)
        const overdueAlerts = activeBorrows.filter(b => b.isOverdue && !b.reminderDismissed)
        const recentBorrows = activeBorrows.filter(b => !b.isOverdue || b.reminderDismissed)

        return NextResponse.json({
            stats: {
                activeBorrowers: totalActiveBorrows,
                borrowsChange,
                overdueCount,
                overdueRate
            },
            overdueAlerts,
            recentBorrows
        })
    } catch (error) {
        console.error('Borrower report error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const data = await request.json()
        const { borrowId, action } = data

        if (!borrowId || !action) {
            return NextResponse.json(
                { error: 'Borrow ID and action are required' },
                { status: 400 }
            )
        }

        if (action === 'returned') {
            // Mark as returned
            await prisma.$executeRaw`
                UPDATE borrow_records 
                SET isReturned = true, returnedAt = NOW()
                WHERE id = ${borrowId}
            `

            // Update sale payment status
            await prisma.$executeRaw`
                UPDATE sales s
                JOIN borrow_records br ON s.id = br.saleId
                SET s.paymentStatus = 'PAID'
                WHERE br.id = ${borrowId}
            `

            return NextResponse.json({ message: 'Marked as returned' })
        } else if (action === 'remind_later') {
            // Dismiss reminder for now
            await prisma.$executeRaw`
                UPDATE borrow_records 
                SET reminderDismissed = true
                WHERE id = ${borrowId}
            `
            return NextResponse.json({ message: 'Reminder dismissed' })
        } else {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Borrower action error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
