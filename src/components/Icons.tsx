'use client'

import React from 'react'

interface IconProps {
    size?: number
    color?: string
    className?: string
    filled?: boolean
    weight?: number
}

// Base Material Icon component
const MaterialIcon: React.FC<IconProps & { name: string }> = ({
    name,
    size = 24,
    color = 'currentColor',
    className = '',
    filled = true,
    weight = 500
}) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={{
            fontSize: size,
            color,
            fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`
        }}
    >
        {name}
    </span>
)

// Bell / Notification Icon
export const BellIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="notifications" {...props} />
)

// Warning / Alert Icon  
export const AlertIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="warning" {...props} color={props.color || '#f59e0b'} />
)

// Chart / Bar Chart Icon (for expenses/stats)
export const ChartIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="bar_chart" {...props} />
)

// Package / Box Icon (inventory)
export const PackageIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="inventory_2" {...props} />
)

// Receipt / Invoice Icon (sales)
export const ReceiptIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="receipt_long" {...props} />
)

// Wallet / Money Icon (expenses)
export const WalletIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="account_balance_wallet" {...props} />
)

// Trending Up Icon (reports)
export const TrendingUpIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="trending_up" {...props} />
)

// Handshake Icon (borrowers)
export const HandshakeIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="handshake" {...props} />
)

// Calendar Icon
export const CalendarIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="calendar_month" {...props} />
)

// Users / Team Icon (employees)
export const UsersIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="groups" {...props} />
)

// Shopping Cart Icon (sales transaction)
export const ShoppingCartIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="shopping_cart" {...props} />
)

// Arrow Up Right Icon (for positive change)
export const ArrowUpRightIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="trending_up" {...props} />
)

// Rupee / Currency Icon
export const RupeeIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="currency_rupee" {...props} />
)

// Dollar Sign / Sales Icon
export const DollarIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="attach_money" {...props} />
)

// Money Out Icon (for showing expense transactions)
export const MoneyOutIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="payments" {...props} />
)

// Building Icon - For app logo
export const BuildingIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="domain" color="white" {...props} />
)

// User Icon (for login form)
export const UserIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="person" {...props} filled={false} />
)

// Lock Icon (for login form)
export const LockIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="lock" {...props} filled={false} />
)

// Eye Icon (for password visibility)
export const EyeIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="visibility" {...props} filled={false} />
)

// Eye Off Icon (for password visibility)
export const EyeOffIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="visibility_off" {...props} filled={false} />
)

// Fingerprint Icon (for biometric login)
export const FingerprintIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="fingerprint" {...props} />
)

// Additional useful icons

// Home Icon
export const HomeIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="home" {...props} />
)

// Settings Icon
export const SettingsIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="settings" {...props} />
)

// Add Icon
export const AddIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="add" {...props} />
)

// Search Icon
export const SearchIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="search" {...props} filled={false} />
)

// Close Icon
export const CloseIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="close" {...props} />
)

// Back Arrow Icon
export const BackIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="arrow_back" {...props} />
)

// Forward Arrow Icon
export const ForwardIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="arrow_forward" {...props} />
)

// More Options Icon (3 dots)
export const MoreIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="more_vert" {...props} />
)

// Edit Icon
export const EditIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="edit" {...props} />
)

// Delete Icon
export const DeleteIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="delete" {...props} />
)

// Check Icon
export const CheckIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="check" {...props} />
)

// Info Icon
export const InfoIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="info" {...props} />
)

// Help Icon
export const HelpIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="help" {...props} />
)

// Phone Icon
export const PhoneIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="phone" {...props} />
)

// Email Icon
export const EmailIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="email" {...props} />
)

// Location Icon
export const LocationIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="location_on" {...props} />
)

// Camera Icon
export const CameraIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="photo_camera" {...props} />
)

// Upload Icon
export const UploadIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="upload" {...props} />
)

// Download Icon
export const DownloadIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="download" {...props} />
)

// Share Icon
export const ShareIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="share" {...props} />
)

// Print Icon
export const PrintIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="print" {...props} />
)

// Logout Icon
export const LogoutIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="logout" {...props} />
)

// Security Icon
export const SecurityIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="security" {...props} />
)

// Store Icon
export const StoreIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="store" {...props} />
)

// Filter Icon
export const FilterIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="filter_list" {...props} />
)

// Sort Icon
export const SortIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="sort" {...props} />
)

// Refresh Icon
export const RefreshIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="refresh" {...props} />
)

// Construction Icon
export const ConstructionIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="construction" {...props} />
)

// Dashboard Icon
export const DashboardIcon: React.FC<IconProps> = (props) => (
    <MaterialIcon name="dashboard" {...props} />
)
