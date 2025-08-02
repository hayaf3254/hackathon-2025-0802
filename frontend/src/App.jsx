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
  const { user } = useUser()
  
  // ログイン状態チェック（nameがあるか、localStorageにユーザー情報がある場合はログイン済み）
  const isLoggedIn = user.name || localStorage.getItem('worldend_user')

  // Monitor tasks for overdue status (ログイン時のみ)
  useTaskMonitor()

  // ログインしていない場合はログイン画面のみ表示
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen world-background">
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    )
  }

  // ログイン済みの場合は通常のアプリを表示
  return (
    <div className="min-h-screen world-background">
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
