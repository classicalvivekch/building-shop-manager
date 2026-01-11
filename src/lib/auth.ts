import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'building-shop-manager-secret-key-2024'
)

export interface UserPayload {
    id: number
    email: string
    name: string
    role: 'ADMIN' | 'EMPLOYEE'
}

export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'shop_salt_2024').digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash
}

export async function createToken(user: UserPayload): Promise<string> {
    return new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as UserPayload
    } catch {
        return null
    }
}

export async function getSession(): Promise<UserPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return null
    return verifyToken(token)
}

export async function setSession(token: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
}

export function isAdmin(user: UserPayload | null): boolean {
    return user?.role === 'ADMIN'
}
