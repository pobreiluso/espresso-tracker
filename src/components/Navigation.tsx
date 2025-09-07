'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { UserMenu } from '@/components/auth/UserMenu'
import { Home, Coffee, Beaker, Settings, LogOut, ChevronDown, ChevronRight, Building, Bean, TrendingUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

// Primary navigation items (always visible on mobile)
const primaryNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Bags', href: '/bags', icon: Coffee },
  { name: 'Brews', href: '/brews', icon: Beaker },
  { name: 'Analysis', href: '/analysis', icon: TrendingUp },
]

// Secondary navigation (desktop only, or accessible through simplified mobile menu)
const secondaryNavigation = [
  { name: 'Manage', href: '/manage', icon: Trash2 },
  { name: 'Roasters', href: '/roasters', icon: Building },
  { name: 'Coffees', href: '/coffees', icon: Bean },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const allNavigation = [...primaryNavigation, ...secondaryNavigation]

export default function Navigation() {
  const pathname = usePathname()
  const [entitiesExpanded, setEntitiesExpanded] = useState(false)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Simplified Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface0/95 backdrop-blur-sm border-t border-surface1 md:hidden z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {primaryNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            // Coffee-specific Spanish names
            const spanishNames: Record<string, string> = {
              'Dashboard': 'Cafetería',
              'Bags': 'Colección', 
              'Brews': 'Extracciones',
              'Analysis': 'Cata'
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-h-[60px] min-w-[64px] ${
                  isActive
                    ? 'text-peach bg-peach/10 scale-105'
                    : 'text-subtext0 hover:text-text hover:bg-surface1 active:scale-95'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 transition-all ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {spanishNames[item.name] || item.name}
                </span>
              </Link>
            )
          })}
          
          {/* Settings shortcut - more accessible */}
          <Link
            href="/settings"
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-h-[60px] min-w-[64px] ${
              pathname === '/settings'
                ? 'text-peach bg-peach/10 scale-105'
                : 'text-subtext0 hover:text-text hover:bg-surface1 active:scale-95'
            }`}
          >
            <Settings className={`w-6 h-6 mb-1 transition-all ${pathname === '/settings' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium leading-tight text-center">
              Config
            </span>
          </Link>
        </div>
        
        {/* Quick access indicator */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-1 bg-surface2 rounded-full" />
        </div>
      </nav>

      {/* Desktop navigation */}
      <nav className="hidden md:flex md:fixed md:top-0 md:left-0 md:bottom-0 md:w-64 md:bg-surface0 md:border-r md:border-overlay0 md:flex-col md:p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">☕ Coffee Tracker</h1>
        </div>
        
        {/* User Menu */}
        <div className="mb-6">
          <UserMenu />
        </div>
        
        <div className="flex-1 space-y-2">
          {allNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-surface1'
                    : 'text-subtext0 hover:text-text hover:bg-surface1'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
          
          {/* Entities Section */}
          <div className="mt-6">
            <button
              onClick={() => setEntitiesExpanded(!entitiesExpanded)}
              className="flex items-center w-full px-3 py-2 rounded-lg transition-colors text-subtext0 hover:text-text hover:bg-surface1"
            >
              {entitiesExpanded ? (
                <ChevronDown className="w-4 h-4 mr-3" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-3" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider">Entities</span>
            </button>
            
            {entitiesExpanded && (
              <div className="ml-4 mt-2 space-y-1">
                {entities.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-primary bg-surface1'
                          : 'text-subtext0 hover:text-text hover:bg-surface1'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center px-3 py-2 rounded-lg transition-colors text-subtext0 hover:text-destructive mt-4"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </nav>
    </>
  )
}