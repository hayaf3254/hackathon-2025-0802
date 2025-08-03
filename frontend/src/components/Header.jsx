import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Home, Plus, BarChart3, Flame, LogOut, User, Trophy, Calendar, Loader } from 'lucide-react'

function Header() {
  const { user, worldState, actions } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return // 二重実行防止
    
    setIsLoggingOut(true)
    
    try {
      console.log('ログアウト開始:', user.name || user.id)
      
      // 1. localStorageからログイン情報を削除
      localStorage.removeItem('worldend_user')
      console.log('localStorage cleared')
      
      // 2. ユーザー状態をリセット
      actions.logoutUser()
      console.log('User state reset')
      
      // 3. 少し待ってからページ遷移（状態更新を確実にするため）
      setTimeout(() => {
        console.log('Navigating to login page')
        navigate('/login', { replace: true })
        setIsLoggingOut(false)
      }, 100)
      
    } catch (error) {
      console.error('ログアウトエラー:', error)
      // エラーが起きてもログアウトは続行
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    { path: '/home', icon: Home, label: 'ホーム' },
    { path: '/create', icon: Plus, label: 'タスク作成' },
    { path: '/calendar', icon: Calendar, label: 'カレンダー' },
    { path: '/result', icon: BarChart3, label: '実績' },
    { path: '/ranking', icon: Trophy, label: 'ランキング' }
  ]

  const getPointsColor = () => {
    if (user.points < -100) return 'text-red-500 animate-pulse' // 世界滅亡
    if (user.points < -20) return 'text-red-400'              // 危険
    if (user.points < 50) return 'text-yellow-400'            // 警告
    return 'text-worldEnd-gold'                               // 正常
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
            {/* ユーザー情報 */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-gray-300" />
                  <span className="text-sm text-gray-300">
                    {user.name || user.id}
                  </span>
                </div>
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
              
              {/* ログアウトボタン */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={isLoggingOut ? "ログアウト中..." : "ログアウト"}
              >
                {isLoggingOut ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </button>
            </div>
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