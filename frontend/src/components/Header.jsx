import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Home, Plus, BarChart3, Flame } from 'lucide-react'

function Header() {
  const { user, worldState } = useUser()
  const location = useLocation()

  const navItems = [
    { path: '/home', icon: Home, label: 'ホーム' },
    { path: '/create', icon: Plus, label: 'タスク作成' },
    { path: '/result', icon: BarChart3, label: '実績' }
  ]

  const getPointsColor = () => {
    if (user.points === 0) return 'text-red-500 animate-pulse'
    if (user.points <= 20) return 'text-red-400'
    if (user.points <= 50) return 'text-yellow-400'
    return 'text-worldEnd-gold'
  }

  const getWorldStatusMessage = () => {
    switch (worldState) {
      case 'normal':
        return '世界は平和です'
      case 'warning':
        return '世界に危機が迫っています...'
      case 'critical':
        return '🚨 世界滅亡まであと少し！'
      case 'destroyed':
        return '💀 世界は滅亡しました...'
      default:
        return ''
    }
  }

  return (
    <header className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        {/* Top section - Title and Points */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white text-shadow">
              🌍 WorldEnd Task Manager
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              {getWorldStatusMessage()}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Flame className="h-6 w-6 text-worldEnd-gold" />
              <span className={`text-2xl font-bold ${getPointsColor()}`}>
                {user.points}pt
              </span>
            </div>
            {user.isWorldDestroyed && (
              <div className="text-red-500 text-sm mt-1 animate-pulse">
                世界が滅亡しました！
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-worldEnd-gold text-black font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Header 