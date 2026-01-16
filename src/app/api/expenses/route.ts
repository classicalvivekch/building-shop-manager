import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        // Use Prisma ORM instead of raw SQL
        const expenses = await prisma.expense.findMany({
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                expenseDate: 'desc'
            }
        })

        // Transform to expected format
        const formattedExpenses = expenses.map(exp => ({
            id: exp.id,
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            expenseDate: exp.expenseDate,
            receiptPhoto: exp.receiptPhoto,
            createdAt: exp.createdAt,
            creator: {
                name: exp.creator.name,
                email: exp.creator.email
            }
        }))

        return NextResponse.json({ expenses: formattedExpenses })
    } catch (error) {
        console.error('Get expenses error:', error)
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
        const { description, amount, category, expenseDate, receiptPhoto } = data

        if (!description || !amount) {
            return NextResponse.json(
                { error: 'Description and amount are required' },
                { status: 400 }
            )
        }

        // Parse the expense date - handle timezone correctly
        let parsedDate: Date
        if (expenseDate) {
            // If date string provided (YYYY-MM-DD format), parse it as local date at noon
            // This prevents timezone offset issues
            const [year, month, day] = expenseDate.split('-').map(Number)
            parsedDate = new Date(year, month - 1, day, 12, 0, 0) // Noon to avoid timezone shifts
        } else {
            parsedDate = new Date()
        }

        // For non-admin employees, restrict to today's date only
        if (user.role !== 'ADMIN') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const expenseDateStart = new Date(parsedDate)
            expenseDateStart.setHours(0, 0, 0, 0)

            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            // Check if expense date is not today
            if (expenseDateStart.getTime() !== today.getTime()) {
                return NextResponse.json(
                    { error: 'You can only add expenses for today. Contact admin for other dates.' },
                    { status: 403 }
                )
            }
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category: category || 'OTHER',
                expenseDate: parsedDate,
                receiptPhoto: receiptPhoto || null,
                createdBy: user.id
            }
        })

        return NextResponse.json({ message: 'Expense created successfully', expense }, { status: 201 })
    } catch (error) {
        console.error('Create expense error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
