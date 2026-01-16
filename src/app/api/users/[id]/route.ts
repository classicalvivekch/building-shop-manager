import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

// GET employee details with salary and sales info
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

        // Get employee details using Prisma
        const employee = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                address: true,
                salary: true,
                role: true,
                createdAt: true
            }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        // Get total sales made by this employee
        const salesStats = await prisma.sale.aggregate({
            where: { createdBy: userId },
            _count: { id: true },
            _sum: { totalAmount: true }
        })

        // Get salary payments history
        const salaryPayments = await prisma.salaryPayment.findMany({
            where: { userId: userId },
            orderBy: [
                { year: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 10
        })

        // Get pending salary amount
        const pendingSalary = await prisma.salaryPayment.aggregate({
            where: { userId: userId, status: 'PENDING' },
            _sum: { amount: true }
        })

        // Get total paid salary
        const paidSalary = await prisma.salaryPayment.aggregate({
            where: { userId: userId, status: 'PAID' },
            _sum: { amount: true }
        })

        return NextResponse.json({
            employee: {
                ...employee,
                totalSales: salesStats._count.id || 0,
                totalSalesAmount: Number(salesStats._sum.totalAmount || 0),
                pendingSalary: Number(pendingSalary._sum.amount || 0),
                totalPaidSalary: Number(paidSalary._sum.amount || 0)
            },
            salaryHistory: salaryPayments
        })
    } catch (error: any) {
        console.error('Error fetching employee details:', error)
        return NextResponse.json({
            error: 'Failed to fetch employee details',
            details: error?.message
        }, { status: 500 })
    }
}

// PUT update employee details
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
        const userId = parseInt(id)
        const body = await request.json()
        const { name, email, phone, address, salary } = body

        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                phone: phone || null,
                address: address || null,
                salary: salary || null
            }
        })

        return NextResponse.json({ message: 'Employee updated successfully' })
    } catch (error: any) {
        console.error('Error updating employee:', error)
        return NextResponse.json({
            error: 'Failed to update employee',
            details: error?.message
        }, { status: 500 })
    }
}

// DELETE employee
export async function DELETE(
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

        // Check if user exists and is not an admin
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        })

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (targetUser.role === 'ADMIN') {
            return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
        }

        // Delete salary payments first (foreign key constraint)
        await prisma.salaryPayment.deleteMany({
            where: { userId: userId }
        })

        // Delete the user
        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ message: 'Employee deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting employee:', error)
        return NextResponse.json({
            error: 'Failed to delete employee',
            details: error?.message
        }, { status: 500 })
    }
}
