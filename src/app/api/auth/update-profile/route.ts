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
        const existingUsers = await prisma.$queryRaw`
            SELECT id FROM users WHERE email = ${email} AND id != ${user.id}
        ` as any[]

        if (existingUsers && existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
        }

        // Update user profile using raw SQL to handle new fields
        await prisma.$executeRaw`
            UPDATE users 
            SET name = ${name}, 
                email = ${email}, 
                phone = ${phone || null},
                avatar = ${avatar || null}
            WHERE id = ${user.id}
        `

        // Fetch updated user
        const updatedUsers = await prisma.$queryRaw`
            SELECT id, name, email, phone, avatar, role 
            FROM users 
            WHERE id = ${user.id}
        ` as any[]

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUsers[0]
        })
    } catch (error: any) {
        console.error('Error updating profile:', error)
        return NextResponse.json({
            error: 'Failed to update profile',
            details: error?.message || 'Unknown error'
        }, { status: 500 })
    }
}

