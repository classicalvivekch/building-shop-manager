import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WEBP or GIF' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
        }

        // Generate unique filename
        const extension = file.name.split('.').pop() || 'jpg'
        const filename = `avatars/avatar_${user.id}_${Date.now()}.${extension}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const avatarUrl = await uploadToSupabase(buffer, 'uploads', filename, file.type)

        // Update user avatar in database
        await prisma.user.update({
            where: { id: user.id },
            data: { avatar: avatarUrl }
        })

        return NextResponse.json({
            message: 'Avatar uploaded successfully',
            avatarUrl
        })
    } catch (error) {
        console.error('Error uploading avatar:', error)
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
    }
}
