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
                <img src="/icons/3d/home.png" alt="Home" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontSize: '11px', marginTop: '2px' }}>Home</span>
            </Link>

            <Link
                href={`${baseHref}/sales/new`}
                className="bottom-nav-center"
            >
                <img src="/icons/3d/add_sale.png" alt="New Sale" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </Link>

            <Link
                href={`${baseHref}/settings`}
                className={`bottom-nav-item ${pathname.includes('/settings') ? 'active' : ''}`}
            >
                <img src="/icons/3d/settings.png" alt="Settings" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontSize: '11px', marginTop: '2px' }}>Settings</span>
            </Link>
        </nav>
    )
}
