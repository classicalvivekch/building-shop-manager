import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        // Use Prisma ORM instead of raw SQL
        const sales = await prisma.sale.findMany({
            include: {
                customer: true,
                creator: {
                    select: {
                        name: true
                    }
                },
                items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Transform to expected format
        const salesWithItems = sales.map(sale => ({
            id: sale.id,
            orderNumber: sale.orderNumber,
            totalAmount: sale.totalAmount,
            isBorrow: sale.isBorrow,
            paymentStatus: sale.paymentStatus,
            notes: sale.notes,
            clientPhoto: sale.clientPhoto,
            createdAt: sale.createdAt,
            customer: sale.customer ? {
                name: sale.customer.name,
                mobile: sale.customer.mobile
            } : null,
            creator: {
                name: sale.creator.name
            },
            items: sale.items.map(saleItem => ({
                quantity: saleItem.quantity,
                rate: saleItem.rate,
                subtotal: saleItem.subtotal,
                item: {
                    name: saleItem.item?.name || saleItem.itemName || 'Unknown Item',
                    unit: saleItem.item?.unit || 'unit'
                }
            }))
        }))

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

        // Update clientPhoto after transaction using Prisma
        if (clientPhoto) {
            await prisma.sale.update({
                where: { id: sale.id },
                data: { clientPhoto }
            })
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
