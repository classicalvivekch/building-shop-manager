import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

// GET salary history for an employee
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

        const salaryPayments = await prisma.$queryRaw`
            SELECT id, amount, month, year, status, notes, paidAt, createdAt
            FROM salary_payments
            WHERE userId = ${userId}
            ORDER BY year DESC, 
                CASE month 
                    WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
                    WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
                    WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
                    WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
                END DESC
        ` as any[]

        return NextResponse.json({ salaryPayments })
    } catch (error: any) {
        console.error('Error fetching salary history:', error)
        return NextResponse.json({ error: 'Failed to fetch salary history' }, { status: 500 })
    }
}

// POST record new salary payment
export async function POST(
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
        const body = await request.json()
        const { amount, month, year, status, notes } = body

        if (!amount || !month || !year) {
            return NextResponse.json({ error: 'Amount, month, and year are required' }, { status: 400 })
        }

        const paidAt = status === 'PAID' ? new Date() : null
        const paymentStatus = status || 'PENDING'

        await prisma.$executeRaw`
            INSERT INTO salary_payments (userId, amount, month, year, status, notes, paidAt, createdAt, updatedAt)
            VALUES (${userId}, ${amount}, ${month}, ${year}, ${paymentStatus}, ${notes || null}, ${paidAt}, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
                amount = ${amount},
                status = ${paymentStatus},
                notes = ${notes || null},
                paidAt = ${paidAt},
                updatedAt = NOW()
        `

        return NextResponse.json({ message: 'Salary payment recorded successfully' }, { status: 201 })
    } catch (error: any) {
        console.error('Error recording salary payment:', error)
        return NextResponse.json({
            error: 'Failed to record salary payment',
            details: error?.message
        }, { status: 500 })
    }
}

// PUT update salary payment status
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const paymentId = parseInt(id)
        const body = await request.json()
        const { status } = body

        const paidAt = status === 'PAID' ? new Date() : null

        await prisma.$executeRaw`
            UPDATE salary_payments 
            SET status = ${status}, paidAt = ${paidAt}
            WHERE id = ${paymentId}
        `

        return NextResponse.json({ message: 'Salary payment updated successfully' })
    } catch (error: any) {
        console.error('Error updating salary payment:', error)
        return NextResponse.json({ error: 'Failed to update salary payment' }, { status: 500 })
    }
}
