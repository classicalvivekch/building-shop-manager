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

        // Get employee details using raw SQL
        const employees = await prisma.$queryRaw`
            SELECT id, name, email, phone, avatar, address, salary, role, createdAt 
            FROM users 
            WHERE id = ${userId}
        ` as any[]

        if (!employees || employees.length === 0) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        const employee = employees[0]

        // Get total sales made by this employee
        const salesStats = await prisma.$queryRaw`
            SELECT 
                COUNT(*) as totalSales,
                COALESCE(SUM(totalAmount), 0) as totalSalesAmount
            FROM sales 
            WHERE createdBy = ${userId}
        ` as any[]

        // Get salary payments history
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
            LIMIT 10
        ` as any[]

        // Get pending salary amount
        const pendingSalary = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as pendingAmount
            FROM salary_payments
            WHERE userId = ${userId} AND status = 'PENDING'
        ` as any[]

        // Get total paid salary
        const paidSalary = await prisma.$queryRaw`
            SELECT COALESCE(SUM(amount), 0) as paidAmount
            FROM salary_payments
            WHERE userId = ${userId} AND status = 'PAID'
        ` as any[]

        return NextResponse.json({
            employee: {
                ...employee,
                totalSales: Number(salesStats[0]?.totalSales || 0),
                totalSalesAmount: Number(salesStats[0]?.totalSalesAmount || 0),
                pendingSalary: Number(pendingSalary[0]?.pendingAmount || 0),
                totalPaidSalary: Number(paidSalary[0]?.paidAmount || 0)
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

        await prisma.$executeRaw`
            UPDATE users 
            SET name = ${name}, 
                email = ${email}, 
                phone = ${phone || null},
                address = ${address || null},
                salary = ${salary || null}
            WHERE id = ${userId}
        `

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
        const users = await prisma.$queryRaw`
            SELECT id, role FROM users WHERE id = ${userId}
        ` as any[]

        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (users[0].role === 'ADMIN') {
            return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
        }

        // Delete salary payments first (foreign key constraint)
        await prisma.$executeRaw`DELETE FROM salary_payments WHERE userId = ${userId}`

        // Delete the user
        await prisma.$executeRaw`DELETE FROM users WHERE id = ${userId}`

        return NextResponse.json({ message: 'Employee deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting employee:', error)
        return NextResponse.json({
            error: 'Failed to delete employee',
            details: error?.message
        }, { status: 500 })
    }
}
