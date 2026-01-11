import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, isAdmin, hashPassword } from '@/lib/auth'

// GET all users
export async function GET() {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use raw SQL to avoid Prisma client type issues
        const users = await prisma.$queryRaw`
            SELECT id, name, email, phone, avatar, role, createdAt 
            FROM users 
            ORDER BY createdAt DESC
        ` as any[]

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

// POST create new user
export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, phone, password, role } = body

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
        }

        // Check if email already exists using raw SQL
        const existingUsers = await prisma.$queryRaw`
            SELECT id FROM users WHERE email = ${email}
        ` as any[]

        if (existingUsers && existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }

        // Hash password
        const hashedPassword = hashPassword(password)
        const userRole = role || 'EMPLOYEE'
        const userPhone = phone || null

        // Create user using raw SQL
        await prisma.$executeRaw`
            INSERT INTO users (name, email, phone, password, role, createdAt, updatedAt)
            VALUES (${name}, ${email}, ${userPhone}, ${hashedPassword}, ${userRole}, NOW(), NOW())
        `

        // Get the newly created user
        const newUsers = await prisma.$queryRaw`
            SELECT id, name, email, phone, role, createdAt 
            FROM users 
            WHERE email = ${email}
        ` as any[]

        return NextResponse.json({
            message: 'User created successfully',
            user: newUsers[0]
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating user:', error)
        return NextResponse.json({
            error: 'Failed to create user',
            details: error?.message || 'Unknown error'
        }, { status: 500 })
    }
}

