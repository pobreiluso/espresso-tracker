'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Home, Coffee, Beaker, Settings, LogOut, ChevronDown, ChevronRight, Building, Bean, TrendingUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Bags', href: '/bags', icon: Coffee },
  { name: 'Brews', href: '/brews', icon: Beaker },
  { name: 'Analysis', href: '/analysis', icon: TrendingUp },
  { name: 'Manage', href: '/manage', icon: Trash2 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const entities = [
  { name: 'Roasters', href: '/roasters', icon: Building },
  { name: 'Coffees', href: '/coffees', icon: Bean },
]

export default function Navigation() {
  const pathname = usePathname()
  const [entitiesExpanded, setEntitiesExpanded] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface0/95 backdrop-blur-sm border-t border-surface1 md:hidden z-50">
        <div className="flex items-center justify-around py-1">
          {navigation.slice(0, 6).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            // Translate names to Spanish
            const spanishNames: Record<string, string> = {
              'Dashboard': 'Inicio',
              'Bags': 'Bolsas',
              'Brews': 'Cafés',
              'Analysis': 'Análisis',
              'Manage': 'Gestionar',
              'Settings': 'Config'
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 min-w-0 ${
                  isActive
                    ? 'text-peach bg-peach/10'
                    : 'text-subtext0 hover:text-text hover:bg-surface1'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {spanishNames[item.name] || item.name}
                </span>
              </Link>
            )
          })}
          
          {/* Mobile menu for entities */}
          <div className="relative">
            <button
              onClick={() => setEntitiesExpanded(!entitiesExpanded)}
              className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors ${
                entities.some(e => pathname === e.href)
                  ? 'text-primary bg-surface1'
                  : 'text-subtext0 hover:text-text hover:bg-surface1'
              }`}
            >
              <Building className="w-5 h-5 mb-1" />
              <span className="text-xs">More</span>
            </button>
            
            {entitiesExpanded && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-surface0 border border-overlay0 rounded-lg shadow-lg min-w-[120px]">
                {entities.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setEntitiesExpanded(false)}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'text-primary bg-surface1'
                          : 'text-subtext0 hover:text-text hover:bg-surface1'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
                <div className="border-t border-overlay0 mt-1 pt-1">
                  <button
                    onClick={() => {
                      handleSignOut()
                      setEntitiesExpanded(false)
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors text-subtext0 hover:text-destructive hover:bg-surface1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Desktop navigation */}
      <nav className="hidden md:flex md:fixed md:top-0 md:left-0 md:bottom-0 md:w-64 md:bg-surface0 md:border-r md:border-overlay0 md:flex-col md:p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">☕ Coffee Tracker</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          {navigation.map((item) => {
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