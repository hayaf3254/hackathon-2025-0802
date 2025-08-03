import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Trophy,
  Target,
  Clock
} from 'lucide-react'

function Result() {
  const { tasks, user } = useUser()
  const [activeTab, setActiveTab] = useState('overview') // overview, tasks, history

  // Calculate statistics
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed)
    const incompleteTasks = tasks.filter(task => !task.completed)
    const overdueTasks = incompleteTasks.filter(task => 
      new Date(task.due_date) < new Date()
    )

    // Calculate completion rate
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0

    // Group tasks by date
    const tasksByDate = tasks.reduce((acc, task) => {
      const date = new Date(task.created_at || task.due_date).toDateString()
      if (!acc[date]) {
        acc[date] = { total: 0, completed: 0 }
      }
      acc[date].total++
      if (task.completed) acc[date].completed++
      return acc
    }, {})

    return {
      total: tasks.length,
      completed: completedTasks.length,
      incomplete: incompleteTasks.length,
      overdue: overdueTasks.length,
      completionRate,
      tasksByDate
    }
  }, [tasks])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTaskStatusIcon = (task) => {
    if (task.completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    
    const isOverdue = new Date(task.due_date) < new Date()
    return isOverdue ? 
      <XCircle className="h-5 w-5 text-red-500" /> :
      <Clock className="h-5 w-5 text-yellow-500" />
  }

  const getTaskStatusText = (task) => {
    if (task.completed) {
      return '完了'
    }
    
    const isOverdue = new Date(task.due_date) < new Date()
    return isOverdue ? '期限切れ' : '未完了'
  }

  const getTaskStatusColor = (task) => {
    if (task.completed) {
      return 'text-green-400'
    }
    
    const isOverdue = new Date(task.due_date) < new Date()
    return isOverdue ? 'text-red-400' : 'text-yellow-400'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <BarChart3 className="h-8 w-8 text-worldEnd-gold" />
        <h1 className="text-3xl font-bold text-white text-shadow">
          実績・統計
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'overview', label: '概要', icon: Trophy },
          { id: 'tasks', label: 'タスク履歴', icon: Target },
          { id: 'history', label: 'ポイント履歴', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === id
                ? 'bg-worldEnd-gold text-black font-semibold'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-worldEnd-gold mb-2">
                {stats.total}
              </div>
              <div className="text-gray-300">総タスク数</div>
            </div>
            
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.completed}
              </div>
              <div className="text-gray-300">完了済み</div>
            </div>
            
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {stats.incomplete}
              </div>
              <div className="text-gray-300">未完了</div>
            </div>
            
            <div className="glass-effect rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {stats.overdue}
              </div>
              <div className="text-gray-300">期限切れ</div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">完了率</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-worldEnd-gold to-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-worldEnd-gold">
                {stats.completionRate}%
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">現在の状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">現在のポイント</div>
                <div className="text-2xl font-bold text-worldEnd-gold">
                  {user.points} pt
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">世界の状態</div>
                <div className={`text-lg font-semibold ${
                  user.isWorldDestroyed ? 'text-red-500' : 'text-green-400'
                }`}>
                  {user.isWorldDestroyed ? '💀 滅亡' : '🌍 平和'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              タスク履歴 ({tasks.length}件)
            </h3>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-300 text-lg">
                まだタスクがありません
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks
                .sort((a, b) => new Date(b.created_at || b.due_date) - new Date(a.created_at || a.due_date))
                .map((task) => (
                  <div key={task.id} className="glass-effect rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTaskStatusIcon(task)}
                          <h4 className="text-lg font-semibold text-white">
                            {task.title}
                          </h4>
                          <span className={`text-sm font-medium ${getTaskStatusColor(task)}`}>
                            {getTaskStatusText(task)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>
                            <span>締切: </span>
                            {formatDate(task.due_date)}
                          </div>
                          {task.completed && task.completed_at && (
                            <div>
                              <span>完了: </span>
                              {formatDate(task.completed_at)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {task.completed ? (
                          <div className="text-green-400 font-semibold">
                            +5pt
                          </div>
                        ) : new Date(task.due_date) < new Date() ? (
                          <div className="text-red-400 font-semibold">
                            -10pt
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">ポイント変化履歴</h3>
          
          <div className="glass-effect rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">ポイント獲得・損失の概要</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <span className="text-lg font-semibold text-white">獲得ポイント</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  +{stats.completed * 5} pt
                </div>
                <div className="text-sm text-gray-400">
                  {stats.completed}件のタスク完了
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                  <span className="text-lg font-semibold text-white">失ったポイント</span>
                </div>
                <div className="text-2xl font-bold text-red-400">
                  -{stats.overdue * 10} pt
                </div>
                <div className="text-sm text-gray-400">
                  {stats.overdue}件の期限切れ
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-600">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">初期ポイント: 0pt</div>
                <div className="text-sm text-gray-400 mb-2">
                  累計変化: {user.points > 0 ? '+' : ''}{user.points}pt
                </div>
                <div className="text-xl font-bold text-worldEnd-gold">
                  現在: {user.points}pt
                </div>
              </div>
            </div>
          </div>

          {/* Daily Activity (Simple version) */}
          <div className="glass-effect rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">日別アクティビティ</h4>
            {Object.keys(stats.tasksByDate).length === 0 ? (
              <p className="text-gray-400 text-center py-8">データがありません</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.tasksByDate)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .slice(0, 7) // Show last 7 days
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">
                          {new Date(date).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400">
                          {data.completed}/{data.total} 完了
                        </div>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-worldEnd-gold h-2 rounded-full"
                            style={{ 
                              width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Result 