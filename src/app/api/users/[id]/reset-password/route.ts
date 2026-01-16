import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin, hashPassword } from '@/lib/auth'

// PUT reset password
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const userId = parseInt(id)

        const body = await request.json()
        const { password } = body

        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Hash and update password
        const hashedPassword = hashPassword(password)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ message: 'Password reset successfully' })
    } catch (error) {
        console.error('Error resetting password:', error)
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }
}
