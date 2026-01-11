import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
    try {
        const borrowRecords = await prisma.borrowRecord.findMany({
            where: { isReturned: false },
            include: {
                sale: {
                    include: {
                        customer: true,
                        items: { include: { item: true } },
                    },
                },
            },
            orderBy: { borrowDate: 'asc' },
        })

        // Calculate overdue days for each record
        const today = new Date()
        const recordsWithOverdue = borrowRecords.map(record => {
            const borrowDate = new Date(record.borrowDate)
            const daysSinceBorrow = Math.floor((today.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24))
            const overdueDays = Math.max(0, daysSinceBorrow - 7)
            const isOverdue = overdueDays > 0

            return {
                ...record,
                daysSinceBorrow,
                overdueDays,
                isOverdue,
            }
        })

        const overdueRecords = recordsWithOverdue.filter(r => r.isOverdue && !r.reminderDismissed)
        const upcomingRecords = recordsWithOverdue.filter(r => !r.isOverdue)

        return NextResponse.json({
            total: borrowRecords.length,
            overdueCount: overdueRecords.length,
            records: recordsWithOverdue,
            overdueRecords,
            upcomingRecords,
        })
    } catch (error) {
        console.error('Get borrows error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
