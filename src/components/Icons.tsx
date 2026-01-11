'use client'

import React from 'react'

interface IconProps {
    size?: number
    color?: string
    className?: string
}

// Bell / Notification Icon - Modern filled style
export const BellIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2C10.9 2 10 2.9 10 4C10 4.17 10.02 4.34 10.06 4.5C7.72 5.14 6 7.28 6 9.85V14L4 16V17H20V16L18 14V9.85C18 7.28 16.28 5.14 13.94 4.5C13.98 4.34 14 4.17 14 4C14 2.9 13.1 2 12 2Z" fill={color} />
        <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill={color} />
        <circle cx="17" cy="6" r="4" fill="#ef4444" />
    </svg>
)

// Warning / Alert Icon - Modern style with gradient
export const AlertIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="alertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
        </defs>
        <path d="M12 2L1 21H23L12 2Z" fill="url(#alertGradient)" />
        <path d="M12 9V13" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="white" />
    </svg>
)

// Chart / Bar Chart Icon - Gradient bars
export const ChartIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="chartGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="chartGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>
        <rect x="3" y="12" width="5" height="9" rx="2" fill="url(#chartGradient1)" />
        <rect x="10" y="6" width="5" height="15" rx="2" fill="url(#chartGradient2)" />
        <rect x="17" y="3" width="5" height="18" rx="2" fill="url(#chartGradient3)" />
    </svg>
)

// Package / Box Icon - 3D style
export const PackageIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="packageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
        </defs>
        <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill={color === 'currentColor' ? 'url(#packageGradient)' : color} />
        <path d="M12 22V12M12 12L21 7M12 12L3 7" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
        <path d="M16.5 4.5L7.5 9.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
    </svg>
)

// Receipt / Invoice Icon - Modern style
export const ReceiptIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="receiptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>
        <path d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V21L17 19L14 21L12 19L10 21L7 19L4 21V4Z" fill={color === 'currentColor' ? 'url(#receiptGradient)' : color} />
        <path d="M8 7H16M8 11H14M8 15H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

// Wallet / Money Icon - Gradient style
export const WalletIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
        </defs>
        <rect x="2" y="6" width="20" height="14" rx="3" fill={color === 'currentColor' ? 'url(#walletGradient)' : color} />
        <path d="M6 6V5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V6" stroke={color === 'currentColor' ? '#dc2626' : color} strokeWidth="2" />
        <rect x="14" y="11" width="8" height="6" rx="2" fill="white" />
        <circle cx="17" cy="14" r="1.5" fill={color === 'currentColor' ? '#ef4444' : color} />
    </svg>
)

// Trending Up Icon - Dynamic arrow
export const TrendingUpIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="trendGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
        <path d="M3 17L9 11L13 15L21 7" stroke={color === 'currentColor' ? 'url(#trendGradient)' : color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7H21V13" stroke={color === 'currentColor' ? 'url(#trendGradient)' : color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// Handshake Icon - Modern filled
export const HandshakeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="handshakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
        </defs>
        <path d="M12 8L8.5 11.5C7.67 12.33 7.67 13.67 8.5 14.5C9.33 15.33 10.67 15.33 11.5 14.5L12 14L12.5 14.5C13.33 15.33 14.67 15.33 15.5 14.5C16.33 13.67 16.33 12.33 15.5 11.5L12 8Z" fill={color === 'currentColor' ? 'url(#handshakeGradient)' : color} />
        <path d="M2 9L6 5H9L12 8L15 5H18L22 9L18 17H15L12 14L9 17H6L2 9Z" fill={color === 'currentColor' ? 'url(#handshakeGradient)' : color} />
        <circle cx="7" cy="11" r="1.5" fill="white" />
        <circle cx="17" cy="11" r="1.5" fill="white" />
    </svg>
)

// Calendar Icon - Modern filled
export const CalendarIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>
        <rect x="3" y="4" width="18" height="18" rx="3" fill={color === 'currentColor' ? 'url(#calendarGradient)' : color} />
        <rect x="3" y="4" width="18" height="5" rx="2" fill={color === 'currentColor' ? '#16a34a' : color} />
        <rect x="7" y="2" width="2" height="4" rx="1" fill={color === 'currentColor' ? '#15803d' : color} />
        <rect x="15" y="2" width="2" height="4" rx="1" fill={color === 'currentColor' ? '#15803d' : color} />
        <rect x="6" y="11" width="3" height="3" rx="0.5" fill="white" />
        <rect x="10.5" y="11" width="3" height="3" rx="0.5" fill="white" />
        <rect x="15" y="11" width="3" height="3" rx="0.5" fill="white" />
        <rect x="6" y="16" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.7" />
        <rect x="10.5" y="16" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.7" />
    </svg>
)

// Users / Team Icon - Modern filled
export const UsersIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="usersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
        </defs>
        <circle cx="9" cy="7" r="4" fill={color === 'currentColor' ? 'url(#usersGradient)' : color} />
        <path d="M2 20C2 16.6863 5.13401 14 9 14C12.866 14 16 16.6863 16 20V21H2V20Z" fill={color === 'currentColor' ? 'url(#usersGradient)' : color} />
        <circle cx="17" cy="8" r="3" fill={color === 'currentColor' ? '#fca5a5' : color} fillOpacity="0.8" />
        <path d="M22 20C22 17.5 20.0899 15.5 17 15C17.5 15 18 17.5 18 20V21H22V20Z" fill={color === 'currentColor' ? '#fca5a5' : color} fillOpacity="0.8" />
    </svg>
)

// Shopping Cart Icon - Filled style
export const ShoppingCartIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="cartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>
        <path d="M4 4H6L7.68 13.39C7.77 13.83 8.19 14.16 8.64 14.16H18.36C18.81 14.16 19.23 13.83 19.32 13.39L21 6H8" fill={color === 'currentColor' ? 'url(#cartGradient)' : color} />
        <circle cx="9" cy="19" r="2" fill={color === 'currentColor' ? 'url(#cartGradient)' : color} />
        <circle cx="18" cy="19" r="2" fill={color === 'currentColor' ? 'url(#cartGradient)' : color} />
    </svg>
)

// Arrow Up Right Icon
export const ArrowUpRightIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </svg>
)

// Rupee / Currency Icon - Coin style
export const RupeeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="rupeeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={color === 'currentColor' ? 'url(#rupeeGradient)' : color} />
        <path d="M8 7H16M8 11H16M8 15L13 19M8 15H11C13 15 14.5 13.5 14.5 11C14.5 8.5 13 7 11 7H8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// Dollar Sign / Sales Icon
export const DollarIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="dollarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={color === 'currentColor' ? 'url(#dollarGradient)' : color} />
        <path d="M12 6V18M15 9C15 7.89543 13.6569 7 12 7C10.3431 7 9 7.89543 9 9C9 10.1046 10.3431 11 12 11C13.6569 11 15 11.8954 15 13C15 14.1046 13.6569 15 12 15C10.3431 15 9 14.1046 9 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

// Money Out Icon - Expense arrow
export const MoneyOutIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="moneyOutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={color === 'currentColor' ? 'url(#moneyOutGradient)' : color} />
        <path d="M12 8V16M8 12L12 16L16 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// Building Icon - For app logo
export const BuildingIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
        </defs>
        <path d="M3 21H21" stroke="url(#buildingGradient)" strokeWidth="2" strokeLinecap="round" />
        <rect x="5" y="7" width="6" height="14" rx="1" fill="url(#buildingGradient)" />
        <rect x="13" y="3" width="6" height="18" rx="1" fill="#60a5fa" />
        <rect x="7" y="10" width="2" height="2" rx="0.5" fill="white" />
        <rect x="7" y="14" width="2" height="2" rx="0.5" fill="white" />
        <rect x="15" y="6" width="2" height="2" rx="0.5" fill="white" />
        <rect x="15" y="10" width="2" height="2" rx="0.5" fill="white" />
        <rect x="15" y="14" width="2" height="2" rx="0.5" fill="white" />
    </svg>
)

// User Icon (for login form)
export const UserIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" />
    </svg>
)

// Lock Icon (for login form)
export const LockIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" />
    </svg>
)

// Eye Icon (for password visibility)
export const EyeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

// Eye Off Icon (for password visibility)
export const EyeOffIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 4.04 7.66 6.06 6.06" />
        <path d="M9.9 4.24C10.58 4.08 11.28 4 12 4C19 4 23 12 23 12C22.39 13.13 21.66 14.17 20.83 15.11" />
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M14.12 14.12C13.54 14.68 12.78 15 12 15C10.34 15 9 13.66 9 12C9 11.22 9.32 10.46 9.88 9.88" />
    </svg>
)

// Fingerprint Icon (for Face ID button)
export const FingerprintIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12" />
        <path d="M12 2C12 8 12 14 12 22" />
        <path d="M4.93 4.93C7.84 10.3 7.84 13.7 4.93 19.07" />
        <path d="M19.07 4.93C16.16 10.3 16.16 13.7 19.07 19.07" />
    </svg>
)
