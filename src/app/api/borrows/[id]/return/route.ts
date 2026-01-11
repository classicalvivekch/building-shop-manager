import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const { id } = await params

        const borrowRecord = await prisma.borrowRecord.update({
            where: { id: parseInt(id) },
            data: {
                isReturned: true,
                returnedAt: new Date(),
                outstandingAmount: 0,
            },
            include: {
                sale: {
                    include: { items: true },
                },
            },
        })

        // Update sale payment status
        await prisma.sale.update({
            where: { id: borrowRecord.saleId },
            data: { paymentStatus: 'PAID' },
        })

        return NextResponse.json({ borrowRecord })
    } catch (error) {
        console.error('Return borrow error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
