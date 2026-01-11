import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
    try {
        const items = await prisma.inventoryItem.findMany({
            orderBy: { name: 'asc' },
        })

        return NextResponse.json({ items })
    } catch (error) {
        console.error('Get inventory error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const data = await request.json()
        const { name, unit, category, purchaseRate, sellingRate, quantity, lowStockThreshold } = data

        if (!name || !unit) {
            return NextResponse.json(
                { error: 'Name and unit are required' },
                { status: 400 }
            )
        }

        const item = await prisma.inventoryItem.create({
            data: {
                name,
                unit,
                category: category || 'Other',
                purchaseRate: purchaseRate || 0,
                sellingRate: sellingRate || 0,
                quantity: quantity || 0,
                totalPurchased: quantity || 0,
                lowStockThreshold: lowStockThreshold || 10,
            },
        })

        return NextResponse.json({ item }, { status: 201 })
    } catch (error) {
        console.error('Create inventory error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
