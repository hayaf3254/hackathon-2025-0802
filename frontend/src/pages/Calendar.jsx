import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'

function Calendar() {
  const { tasks } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)

  // 現在の月の情報を取得
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // 月の名前
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  // 曜日の名前
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  // カレンダーのグリッドデータを生成
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []

    // 前月の日付で埋める
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i)
      days.push({
        date: date.getDate(),
        fullDate: date,
        isCurrentMonth: false,
        tasks: []
      })
    }

    // 当月の日付
    for (let date = 1; date <= daysInMonth; date++) {
      const fullDate = new Date(currentYear, currentMonth, date)
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date)
        return taskDate.toDateString() === fullDate.toDateString()
      })

      days.push({
        date,
        fullDate,
        isCurrentMonth: true,
        tasks: dayTasks
      })
    }

    // 来月の日付で埋める（6週間分 = 42日）
    const remainingDays = 42 - days.length
    for (let date = 1; date <= remainingDays; date++) {
      const fullDate = new Date(currentYear, currentMonth + 1, date)
      days.push({
        date,
        fullDate,
        isCurrentMonth: false,
        tasks: []
      })
    }

    return days
  }, [currentYear, currentMonth, tasks])

  // 前月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // 次月に移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // タスクの色を取得（期限までの日数に応じて）
  const getTaskColor = (task) => {
    const now = new Date()
    const dueDate = new Date(task.due_date)
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))

    if (task.completed) return 'bg-green-500'
    if (daysUntilDue < 0) return 'bg-red-500' // 期限切れ
    if (daysUntilDue === 0) return 'bg-orange-500' // 今日期限
    if (daysUntilDue <= 3) return 'bg-yellow-500' // 3日以内
    if (daysUntilDue <= 7) return 'bg-blue-500' // 1週間以内
    return 'bg-gray-500' // それ以外
  }

  // タスクの表示テキストを短縮
  const truncateText = (text, maxLength = 10) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // 今日の日付かどうか判定
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-worldEnd-gold mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">カレンダー</h1>
              <p className="text-gray-300">タスクの期限を一目で確認</p>
            </div>
          </div>

          {/* 月ナビゲーション */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="text-center min-w-32">
              <div className="text-2xl font-bold text-white">
                {currentYear}年{monthNames[currentMonth]}
              </div>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* カレンダーグリッド */}
        <div className="glass-effect rounded-lg p-6">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={`text-center font-semibold py-2 ${
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`min-h-24 p-2 border border-gray-600 rounded-lg relative ${
                  day.isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900'
                } ${isToday(day.fullDate) ? 'ring-2 ring-worldEnd-gold' : ''}`}
              >
                {/* 日付 */}
                <div className={`text-sm font-semibold mb-1 ${
                  day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                } ${isToday(day.fullDate) ? 'text-worldEnd-gold' : ''}`}>
                  {day.date}
                </div>

                {/* タスク表示 */}
                <div className="space-y-1">
                  {day.tasks.slice(0, 3).map((task, taskIndex) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-all ${getTaskColor(task)} text-white`}
                      title={task.title}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{truncateText(task.title, 8)}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* 3つ以上のタスクがある場合の表示 */}
                  {day.tasks.length > 3 && (
                    <div className="text-xs text-gray-400 p-1">
                      +{day.tasks.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-6 glass-effect rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">凡例</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-300">完了済み</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-300">期限切れ</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-300">今日期限</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-300">3日以内</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300">1週間以内</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm text-gray-300">その他</span>
            </div>
          </div>
        </div>

        {/* タスク詳細モーダル */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">タスク詳細</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">タイトル</label>
                  <div className="text-white font-medium">{selectedTask.title}</div>
                </div>
                
                {selectedTask.description && (
                  <div>
                    <label className="text-sm text-gray-400">説明</label>
                    <div className="text-gray-300">{selectedTask.description}</div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-gray-400">期限</label>
                  <div className="text-white">
                    {new Date(selectedTask.due_date).toLocaleString('ja-JP')}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">ステータス</label>
                  <div className={`inline-block px-2 py-1 rounded text-sm ${
                    selectedTask.completed ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {selectedTask.completed ? '完了' : '未完了'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-worldEnd-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar