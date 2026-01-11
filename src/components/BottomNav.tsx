'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
    isAdmin?: boolean
}

export default function BottomNav({ isAdmin = false }: BottomNavProps) {
    const pathname = usePathname()

    const baseHref = isAdmin ? '/dashboard' : '/employee'

    return (
        <nav className="bottom-nav">
            <Link
                href={baseHref}
                className={`bottom-nav-item ${pathname === baseHref ? 'active' : ''}`}
            >
                <span style={{ fontSize: '20px' }}>🏠</span>
                <span style={{ fontSize: '12px', marginTop: '4px' }}>Home</span>
            </Link>

            <Link
                href={`${baseHref}/sales/new`}
                className="bottom-nav-center"
            >
                <span style={{ fontSize: '24px' }}>🛒</span>
            </Link>

            <Link
                href={`${baseHref}/settings`}
                className={`bottom-nav-item ${pathname.includes('/settings') ? 'active' : ''}`}
            >
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <span style={{ fontSize: '12px', marginTop: '4px' }}>Settings</span>
            </Link>
        </nav>
    )
}
