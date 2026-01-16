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

        // Get all active borrows using Prisma ORM
        const activeBorrowsRaw = await prisma.borrowRecord.findMany({
            where: {
                isReturned: false
            },
            include: {
                sale: {
                    include: {
                        customer: true,
                        items: {
                            include: {
                                item: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                borrowDate: 'asc'
            }
        })

        // Transform data
        const activeBorrows = activeBorrowsRaw.map((borrow) => {
            const daysSinceBorrow = Math.floor((now.getTime() - new Date(borrow.borrowDate).getTime()) / (1000 * 60 * 60 * 24))

            return {
                id: borrow.id,
                borrowDate: borrow.borrowDate,
                dueDate: borrow.dueDate,
                outstandingAmount: Number(borrow.outstandingAmount),
                isOverdue: daysSinceBorrow > 7,
                daysSinceBorrow: daysSinceBorrow,
                daysOverdue: Math.max(0, daysSinceBorrow - 7),
                reminderDismissed: borrow.reminderDismissed,
                orderNumber: borrow.sale.orderNumber,
                customer: borrow.sale.customer ? {
                    id: borrow.sale.customer.id,
                    name: borrow.sale.customer.name,
                    mobile: borrow.sale.customer.mobile
                } : null,
                items: borrow.sale.items.map(saleItem => ({
                    name: saleItem.item?.name || saleItem.itemName || 'Unknown Item',
                    quantity: saleItem.quantity
                }))
            }
        })

        // Calculate stats
        const totalActiveBorrows = activeBorrows.length
        const overdueBorrows = activeBorrows.filter(b => b.isOverdue && !b.reminderDismissed)
        const overdueCount = overdueBorrows.length
        const overdueRate = totalActiveBorrows > 0 ? Math.round((overdueCount / totalActiveBorrows) * 100) : 0

        // Get last week's stats for comparison
        const lastWeekBorrows = await prisma.borrowRecord.count({
            where: {
                isReturned: false,
                borrowDate: {
                    lt: oneWeekAgo,
                    gte: twoWeeksAgo
                }
            }
        })

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
            // Get borrow record to find associated sale
            const borrowRecord = await prisma.borrowRecord.findUnique({
                where: { id: borrowId }
            })

            if (!borrowRecord) {
                return NextResponse.json(
                    { error: 'Borrow record not found' },
                    { status: 404 }
                )
            }

            // Mark as returned
            await prisma.borrowRecord.update({
                where: { id: borrowId },
                data: {
                    isReturned: true,
                    returnedAt: new Date()
                }
            })

            // Update sale payment status
            await prisma.sale.update({
                where: { id: borrowRecord.saleId },
                data: { paymentStatus: 'PAID' }
            })

            return NextResponse.json({ message: 'Marked as returned' })
        } else if (action === 'remind_later') {
            // Dismiss reminder for now
            await prisma.borrowRecord.update({
                where: { id: borrowId },
                data: {
                    reminderDismissed: true,
                    dismissedAt: new Date(),
                    dismissedBy: user.id
                }
            })
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
