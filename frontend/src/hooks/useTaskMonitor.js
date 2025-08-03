import { useEffect, useRef } from 'react'
import { useUser } from '../context/UserContext'

/**
 * タスクの期限を監視し、期限ベースの世界状態を管理するカスタムフック  
 */
export function useTaskMonitor() {
  const { tasks, actions, worldState, user } = useUser()
  const checkedTasksRef = useRef(new Set())

  useEffect(() => {
    // ログインしていない場合は何もしない
    if (!user.id) {
      return
    }

    const checkOverdueTasks = () => {
      const now = new Date()
      
      tasks.forEach(task => {
        // 未完了かつ期限切れかつまだチェックしていないタスク
        if (
          !task.completed && 
          new Date(task.due_date) < now && 
          !checkedTasksRef.current.has(task.id)
        ) {
          // ポイントを減らす（既存の機能を保持）
          actions.failTask()
          
          // このタスクをチェック済みとしてマーク
          checkedTasksRef.current.add(task.id)
          
          console.log(`Task "${task.title}" is overdue. -50 points deducted. World state: ${worldState}`)
        }
      })
    }

    // 初回チェック
    checkOverdueTasks()

    // 1分ごとにチェック
    const interval = setInterval(checkOverdueTasks, 60000)

    return () => clearInterval(interval)
  }, [tasks, actions, worldState, user.id])

  // タスクが完了した時にチェック済みリストから除外
  useEffect(() => {
    const completedTaskIds = tasks
      .filter(task => task.completed)
      .map(task => task.id)
    
    completedTaskIds.forEach(id => {
      checkedTasksRef.current.delete(id)
    })
  }, [tasks])

  // 世界状態の変化をログに記録（デバッグ用）
  useEffect(() => {
    console.log(`World state changed to: ${worldState}`)
  }, [worldState])
} 