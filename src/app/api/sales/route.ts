import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        // Use raw SQL to include clientPhoto and creator info
        const sales = await prisma.$queryRaw`
            SELECT 
                s.id, s.orderNumber, s.customerId, s.totalAmount, s.isBorrow, 
                s.paymentStatus, s.notes, s.clientPhoto, s.createdBy, s.createdAt,
                c.name as customerName, c.mobile as customerMobile,
                u.name as creatorName
            FROM sales s
            LEFT JOIN customers c ON s.customerId = c.id
            LEFT JOIN users u ON s.createdBy = u.id
            ORDER BY s.createdAt DESC
        ` as Array<{
            id: number
            orderNumber: string
            customerId: number | null
            totalAmount: number
            isBorrow: boolean
            paymentStatus: string
            notes: string | null
            clientPhoto: string | null
            createdBy: number
            createdAt: Date
            customerName: string | null
            customerMobile: string | null
            creatorName: string
        }>

        // Get items for each sale
        const salesWithItems = await Promise.all(
            sales.map(async (sale) => {
                const items = await prisma.$queryRaw`
                    SELECT si.id, si.quantity, si.rate, si.subtotal, 
                           i.name as itemName, i.unit as itemUnit
                    FROM sale_items si
                    LEFT JOIN inventory_items i ON si.itemId = i.id
                    WHERE si.saleId = ${sale.id}
                ` as Array<{
                    id: number
                    quantity: number
                    rate: number
                    subtotal: number
                    itemName: string
                    itemUnit: string
                }>

                return {
                    id: sale.id,
                    orderNumber: sale.orderNumber,
                    totalAmount: sale.totalAmount,
                    isBorrow: sale.isBorrow ? true : false,
                    paymentStatus: sale.paymentStatus,
                    notes: sale.notes,
                    clientPhoto: sale.clientPhoto,
                    createdAt: sale.createdAt,
                    customer: sale.customerName ? {
                        name: sale.customerName,
                        mobile: sale.customerMobile
                    } : null,
                    creator: {
                        name: sale.creatorName
                    },
                    items: items.map(item => ({
                        quantity: item.quantity,
                        rate: item.rate,
                        subtotal: item.subtotal,
                        item: {
                            name: item.itemName,
                            unit: item.itemUnit
                        }
                    }))
                }
            })
        )

        return NextResponse.json({ sales: salesWithItems })
    } catch (error) {
        console.error('Get sales error:', error)
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
        const { customerName, customerMobile, customerAddress, clientPhoto, items, isBorrow, paymentStatus, notes } = data

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'At least one item is required' },
                { status: 400 }
            )
        }

        // Create or find customer
        let customer = null
        if (customerMobile) {
            customer = await prisma.customer.upsert({
                where: { mobile: customerMobile },
                update: { name: customerName, address: customerAddress },
                create: { name: customerName || 'Walk-in Customer', mobile: customerMobile, address: customerAddress },
            })
        }

        // Generate order number
        const orderCount = await prisma.sale.count()
        const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`

        // Calculate total
        let totalAmount = 0
        for (const item of items) {
            totalAmount += item.quantity * item.rate
        }

        // Create sale with items in a transaction
        const sale = await prisma.$transaction(async (tx) => {
            // Create the sale
            const newSale = await tx.sale.create({
                data: {
                    orderNumber,
                    customerId: customer?.id,
                    totalAmount,
                    isBorrow: isBorrow || false,
                    paymentStatus: paymentStatus || (isBorrow ? 'UNPAID' : 'PAID'),
                    notes,
                    createdBy: user.id,
                    items: {
                        create: items.map((item: { itemId: number, quantity: number, rate: number }) => ({
                            itemId: item.itemId,
                            quantity: item.quantity,
                            rate: item.rate,
                            subtotal: item.quantity * item.rate,
                        })),
                    },
                },
                include: {
                    customer: true,
                    items: { include: { item: true } },
                },
            })

            // Update inventory for each item
            for (const item of items) {
                await tx.inventoryItem.update({
                    where: { id: item.itemId },
                    data: {
                        quantity: { decrement: item.quantity },
                        totalSold: { increment: item.quantity },
                    },
                })
            }

            // Create borrow record if needed
            if (isBorrow) {
                const dueDate = new Date()
                dueDate.setDate(dueDate.getDate() + 7)

                await tx.borrowRecord.create({
                    data: {
                        saleId: newSale.id,
                        borrowDate: new Date(),
                        dueDate,
                        outstandingAmount: totalAmount,
                    },
                })
            }

            return newSale
        })

        // Update clientPhoto after transaction using raw SQL (to avoid Prisma sync issues)
        if (clientPhoto) {
            await prisma.$executeRaw`UPDATE sales SET clientPhoto = ${clientPhoto} WHERE id = ${sale.id}`
        }

        return NextResponse.json({ sale }, { status: 201 })
    } catch (error) {
        console.error('Create sale error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
