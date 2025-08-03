import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Import components
import Header from './components/Header'
import Home from './pages/Home'
import CreateTask from './pages/CreateTask'
import Result from './pages/Result'
import Login from './pages/Login'
import Ranking from './pages/Ranking'
import Calendar from './pages/Calendar'
import { UserProvider, useUser } from './context/UserContext'
import { useTaskMonitor } from './hooks/useTaskMonitor'

// Inner App component that uses the context
function AppContent() {
  const { user, getWorldBackground } = useUser()
  
  // ログイン状態チェック（localStorageベースでより確実に判定）
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    const storedUser = localStorage.getItem('worldend_user')
    const hasValidUser = storedUser && user.id
    setIsLoggedIn(hasValidUser)
    
    // デバッグ用ログ
    console.log('Login status check:', {
      storedUser: !!storedUser,
      userId: user.id,
      userName: user.name,
      isLoggedIn: hasValidUser
    })
  }, [user.id, user.name])

  // Monitor tasks for overdue status (ログイン時のみ)
  useTaskMonitor()

  // 期限ベースの背景色を取得
  const worldBackgroundClass = getWorldBackground()

  // ログインしていない場合はログイン画面のみ表示
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${worldBackgroundClass}`}>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    )
  }

  // ログイン済みの場合は通常のアプリを表示
  return (
    <div className={`min-h-screen ${worldBackgroundClass}`}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<CreateTask />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/result" element={<Result />} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  )
}

export default App
