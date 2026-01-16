import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const item = await prisma.inventoryItem.findUnique({
            where: { id: parseInt(id) },
        })

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ item })
    } catch (error) {
        console.error('Get inventory item error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
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
        const data = await request.json()

        const item = await prisma.inventoryItem.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                unit: data.unit,
                category: data.category,
                purchaseRate: data.purchaseRate,
                sellingRate: data.sellingRate,
                quantity: data.quantity,
                lowStockThreshold: data.lowStockThreshold,
            },
        })

        return NextResponse.json({ item })
    } catch (error) {
        console.error('Update inventory error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
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
        const itemId = parseInt(id)

        // Check if item exists
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId }
        })

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            )
        }

        // Save item name in sale_items before deleting using Prisma updateMany
        await prisma.saleItem.updateMany({
            where: { itemId: itemId },
            data: { itemName: item.name }
        })

        // Delete related purchases first (if any)
        await prisma.purchase.deleteMany({
            where: { itemId: itemId }
        })

        // Now delete the inventory item - it will SET NULL on sale_items.itemId
        await prisma.inventoryItem.delete({
            where: { id: itemId }
        })

        return NextResponse.json({ success: true, message: 'Item deleted successfully' })
    } catch (error) {
        console.error('Delete inventory error:', error)
        return NextResponse.json(
            { error: 'Failed to delete item. Please try again.' },
            { status: 500 }
        )
    }
}
