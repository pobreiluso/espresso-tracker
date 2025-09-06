import Navigation from './Navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main content */}
      <main className="pb-20 md:pb-0 md:ml-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}