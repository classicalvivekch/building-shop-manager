import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        // Use raw SQL to include receiptPhoto field
        const expenses = await prisma.$queryRaw`
            SELECT 
                e.id, e.description, e.amount, e.category, e.expenseDate, 
                e.receiptPhoto, e.createdBy, e.createdAt,
                u.name as creatorName, u.email as creatorEmail
            FROM expenses e
            LEFT JOIN users u ON e.createdBy = u.id
            ORDER BY e.expenseDate DESC
        ` as Array<{
            id: number
            description: string
            amount: number
            category: string
            expenseDate: Date
            receiptPhoto: string | null
            createdBy: number
            createdAt: Date
            creatorName: string
            creatorEmail: string
        }>

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
                name: exp.creatorName,
                email: exp.creatorEmail
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

        const expDate = expenseDate ? new Date(expenseDate) : new Date()
        const cat = category || 'OTHER'

        // Use raw SQL to avoid Prisma client sync issues
        await prisma.$executeRaw`
            INSERT INTO expenses (description, amount, category, expenseDate, receiptPhoto, createdBy, createdAt)
            VALUES (${description}, ${amount}, ${cat}, ${expDate}, ${receiptPhoto || null}, ${user.id}, NOW())
        `

        return NextResponse.json({ message: 'Expense created successfully' }, { status: 201 })
    } catch (error) {
        console.error('Create expense error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
