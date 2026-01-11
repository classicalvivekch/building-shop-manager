import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Fetch fresh user data from database
        // Using raw select to avoid Prisma client type issues with new fields
        const user = await prisma.$queryRaw`
            SELECT id, name, email, phone, avatar, role 
            FROM users 
            WHERE id = ${session.id}
        ` as any[]

        if (!user || user.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ user: user[0] })
    } catch (error) {
        console.error('Session error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

