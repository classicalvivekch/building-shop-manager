import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const type = formData.get('type') as string || 'general' // expense, sale, client, general

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

        // Determine folder based on type
        const folder = type === 'expense' ? 'receipts' : type === 'sale' ? 'sales' : type === 'client' ? 'clients' : 'general'

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder)
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const extension = file.name.split('.').pop() || 'jpg'
        const filename = `${type}_${Date.now()}.${extension}`
        const filePath = path.join(uploadsDir, filename)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Generate URL
        const imageUrl = `/uploads/${folder}/${filename}`

        return NextResponse.json({
            message: 'Photo uploaded successfully',
            imageUrl
        })
    } catch (error) {
        console.error('Error uploading photo:', error)
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }
}
