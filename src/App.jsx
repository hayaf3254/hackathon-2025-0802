import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Import components (we'll create these next)
import Header from './components/Header'
import Home from './pages/Home'
import CreateTask from './pages/CreateTask'
import Result from './pages/Result'
import { UserProvider } from './context/UserContext'
import { useTaskMonitor } from './hooks/useTaskMonitor'

// Inner App component that uses the context
function AppContent() {
  // Monitor tasks for overdue status
  useTaskMonitor()

  return (
    <div className="min-h-screen world-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<CreateTask />} />
          <Route path="/result" element={<Result />} />
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
