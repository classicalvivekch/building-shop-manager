import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find first admin user
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true
            }
        })

        if (!admin) {
            return NextResponse.json({ error: 'No admin found' }, { status: 404 })
        }

        return NextResponse.json({ admin })
    } catch (error) {
        console.error('Error fetching admin contact:', error)
        return NextResponse.json({ error: 'Failed to fetch admin contact' }, { status: 500 })
    }
}
