import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { 
  Ticket, 
  User, 
  LogOut, 
  Menu, 
  X,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Events', href: '/events' },
    { name: 'Dashboard', href: '/dashboard', auth: true },
    { name: 'My Tickets', href: '/tickets', auth: true },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin/dashboard' },
    { name: 'Manage Events', href: '/admin/events' },
    { name: 'Manage Stadiums', href: '/admin/stadiums' },
    { name: 'Manage Users', href: '/admin/users' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-soft border-b border-neutral-200">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">StadiPass</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              if (item.auth && !isAuthenticated) return null
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600'
                      : 'text-neutral-600 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            
            {isAuthenticated && user?.role === 'admin' && (
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-medium text-neutral-600 hover:text-primary-600">
                  <BarChart3 className="h-4 w-4" />
                  <span>Admin</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-strong border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {user?.firstName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                if (item.auth && !isAuthenticated) return null
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              
              {isAuthenticated && user?.role === 'admin' && (
                <div className="pt-2 border-t border-neutral-200">
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-6 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="pt-2 border-t border-neutral-200">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    <div className="px-3 py-2 text-sm text-neutral-700">
                      Welcome, {user?.firstName}!
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
