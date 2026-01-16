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

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category: category || 'OTHER',
                expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
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
