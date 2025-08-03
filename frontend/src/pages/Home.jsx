import React, { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, AlertTriangle, Skull, Plus, Loader } from 'lucide-react'

function Home() {
  const { user, tasks, worldState, actions, getWorldBackground } = useUser()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const toNumericId = (userId) => {
  if (typeof userId === 'string' && userId.startsWith('user_')) {
    const numeric = parseInt(userId.split('_')[1], 10);
    console.log('[toNumericId] Converted', userId, '→', numeric);
    return numeric;
  }
  console.log('[toNumericId] Already numeric:', userId);
  return userId;
};


  // Load user data from API on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user.id) return
      
      setIsLoading(true)
      setLoadError(null)
      
      try {
        await actions.loadUserData(toNumericId(user.id))
        console.log('ユーザーデータをAPIから読み込みました')
      } catch (error) {
        console.error('ユーザーデータの読み込みに失敗:', error)
        setLoadError('データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user.id])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Get incomplete tasks sorted by due date
  const incompleteTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  // Check for overdue tasks
  const overdueTasks = incompleteTasks.filter(task => 
    new Date(task.due_date) < currentTime
  )

  // Handle task completion
  const handleCompleteTask = async (taskId) => {
    try {
      await actions.completeTask(taskId)
      console.log('タスクが完了しました:', taskId)
    } catch (error) {
      console.error('タスクの完了に失敗しました:', error)
      alert('タスクの完了に失敗しました。もう一度お試しください。')
    }
  }

  // Format date for display
  const formatDueDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date - now
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffMs < 0) {
      return '⚠️ 期限切れ'
    } else if (diffHours < 24) {
      return `⏰ あと${diffHours}時間`
    } else {
      return `📅 あと${diffDays}日`
    }
  }

  // Get world status icon
  const getWorldIcon = () => {
    switch (worldState) {
      case 'normal':
        return '🌍'
      case 'warning':
        return '🌎'
      case 'critical':
        return '🔥'
      case 'destroyed':
        return '💀'
      default:
        return '🌍'
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${getWorldBackground()} transition-all duration-1000`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Loader className="h-16 w-16 text-worldEnd-gold mx-auto mb-4 animate-spin" />
              <p className="text-white text-xl">データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (loadError) {
    return (
      <div className={`min-h-screen ${getWorldBackground()} transition-all duration-1000`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-xl mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-worldEnd-gold hover:bg-yellow-500 text-black px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getWorldBackground()} transition-all duration-1000`}>
      <div className="container mx-auto px-4 py-8">
        {/* World Status Section */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-pulse-glow">
            {getWorldIcon()}
          </div>
          <h2 className="text-3xl font-bold text-white text-shadow mb-2">
            {worldState === 'destroyed' ? '世界は滅亡しました' : '世界の状態'}
          </h2>
          {user.isWorldDestroyed && (
            <div className="bg-red-900 bg-opacity-50 rounded-lg p-4 mt-4 border border-red-500">
              <Skull className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-300 text-lg">
                すべてのタスクを失敗し、世界が崩壊しました...
              </p>
              <button
                onClick={actions.resetWorld}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                世界をリセット
              </button>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white text-shadow">
              未完了タスク ({incompleteTasks.length}件)
            </h3>
            <Link
              to="/create"
              className="flex items-center space-x-2 bg-worldEnd-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>新しいタスク</span>
            </Link>
          </div>

          {/* Overdue Alert */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-red-300">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">
                  {overdueTasks.length}件のタスクが期限切れです！
                </span>
              </div>
            </div>
          )}

          {/* Task List */}
          {incompleteTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-300 text-lg mb-4">
                すべてのタスクが完了しています！
              </p>
              <Link
                to="/create"
                className="text-worldEnd-gold hover:text-yellow-400 underline"
              >
                新しいタスクを作成する
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {incompleteTasks.map((task) => {
                const isOverdue = new Date(task.due_date) < currentTime
                return (
                  <div
                    key={task.id}
                    className={`task-card ${
                      isOverdue ? 'border-red-500 bg-red-900 bg-opacity-30' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className={`flex items-center space-x-1 ${
                            isOverdue ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            <Clock className="h-4 w-4" />
                            <span>{formatDueDate(task.due_date)}</span>
                          </div>
                          <div className="text-gray-400">
                            締切: {new Date(task.due_date).toLocaleString('ja-JP')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors ml-4"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>完了</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-worldEnd-gold mb-2">
                {tasks.filter(t => t.completed).length}
              </div>
              <div className="text-gray-300">完了済みタスク</div>
            </div>
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {incompleteTasks.length}
              </div>
              <div className="text-gray-300">残りタスク</div>
            </div>
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-red-400 mb-2">
                {overdueTasks.length}
              </div>
              <div className="text-gray-300">期限切れタスク</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 