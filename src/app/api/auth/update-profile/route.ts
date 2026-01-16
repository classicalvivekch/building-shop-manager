import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, phone, avatar } = body

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
        }

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
                NOT: { id: user.id }
            }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                email,
                phone: phone || null,
                avatar: avatar || undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: true
            }
        })

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        })
    } catch (error: any) {
        console.error('Error updating profile:', error)
        return NextResponse.json({
            error: 'Failed to update profile',
            details: error?.message || 'Unknown error'
        }, { status: 500 })
    }
}
