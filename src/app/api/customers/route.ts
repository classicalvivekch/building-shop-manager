import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        const where = query ? {
            OR: [
                { name: { contains: query } },
                { mobile: { contains: query } },
            ],
        } : {}

        const customers = await prisma.customer.findMany({
            where,
            take: 20,
            orderBy: { name: 'asc' },
        })

        return NextResponse.json({ customers })
    } catch (error) {
        console.error('Get customers error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
