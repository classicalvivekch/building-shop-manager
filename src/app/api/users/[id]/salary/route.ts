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

        const salaryPayments = await prisma.salaryPayment.findMany({
            where: { userId: userId },
            orderBy: [
                { year: 'desc' },
                { createdAt: 'desc' }
            ]
        })

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

        const paymentStatus = status || 'PENDING'
        const paidAt = paymentStatus === 'PAID' ? new Date() : null

        // Use upsert for PostgreSQL (instead of ON DUPLICATE KEY UPDATE which is MySQL syntax)
        await prisma.salaryPayment.upsert({
            where: {
                userId_month_year: {
                    userId: userId,
                    month: month,
                    year: parseInt(year)
                }
            },
            update: {
                amount: parseFloat(amount),
                status: paymentStatus,
                notes: notes || null,
                paidAt: paidAt
            },
            create: {
                userId: userId,
                amount: parseFloat(amount),
                month: month,
                year: parseInt(year),
                status: paymentStatus,
                notes: notes || null,
                paidAt: paidAt
            }
        })

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

        await prisma.salaryPayment.update({
            where: { id: paymentId },
            data: {
                status: status,
                paidAt: paidAt
            }
        })

        return NextResponse.json({ message: 'Salary payment updated successfully' })
    } catch (error: any) {
        console.error('Error updating salary payment:', error)
        return NextResponse.json({ error: 'Failed to update salary payment' }, { status: 500 })
    }
}
