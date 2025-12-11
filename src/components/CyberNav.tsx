'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface NavItem {
  path: string
  label: string
  icon: string
  color: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Terminal', icon: '◉', color: 'neon-text-cyan' },
  { path: '/discover', label: 'Discover', icon: '◎', color: 'neon-text-cyan' },
  { path: '/create', label: 'Create', icon: '⬢', color: 'neon-text-green' },
  { path: '/validate', label: 'Validate', icon: '⬡', color: 'neon-text-pink' },
  { path: '/arbitrate', label: 'Arbitrate', icon: '⬢', color: 'neon-text-orange' },
  { path: '/reputation', label: 'Reputation', icon: '◆', color: 'neon-text-cyan' },
]

export function CyberNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Allow default behavior for modifier keys (cmd/ctrl click for new tab)
    if (e.metaKey || e.ctrlKey) return
    
    // Otherwise handle navigation programmatically
    e.preventDefault()
    router.push(path)
  }

  return (
    <nav className="cyber-card border-b-2 border-cyan-400/30 backdrop-blur-md fixed top-0 left-0 right-0 z-[9999] pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 cyber-grid bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-xs">◉</span>
            </div>
            <span className="font-mono text-sm neon-text-cyan font-bold tracking-wide">
              INTUITION.SYS
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
            {navItems.slice(1).map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleClick(e, item.path)}
                  className={`nav-link px-3 py-1 text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? `${item.color} cyber-glow bg-cyan-400/10 border border-cyan-400/50 rounded`
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/5 rounded'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center -mr-4">
            <div className="scale-60 origin-right">
              <ConnectButton />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-cyan-400/30 py-3">
          <div className="grid grid-cols-3 gap-2">
            {navItems.slice(1).map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleClick(e, item.path)}
                  className={`nav-link block px-2 py-1 text-xs font-medium uppercase tracking-wider text-center transition-all duration-300 ${
                    isActive
                      ? `${item.color} cyber-glow bg-cyan-400/10 border border-cyan-400/50 rounded`
                      : 'text-gray-400 hover:text-cyan-400 rounded'
                  }`}
                >
                  <div>{item.icon}</div>
                  <div>{item.label}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}