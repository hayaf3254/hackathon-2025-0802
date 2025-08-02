import { useEffect, useRef } from 'react'
import { useUser } from '../context/UserContext'

/**
 * タスクの期限切れを監視し、自動的にポイントを減らすカスタムフック
 */
export function useTaskMonitor() {
  const { tasks, actions } = useUser()
  const checkedTasksRef = useRef(new Set())

  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date()
      
      tasks.forEach(task => {
        // 未完了かつ期限切れかつまだチェックしていないタスク
        if (
          !task.completed && 
          new Date(task.due_date) < now && 
          !checkedTasksRef.current.has(task.id)
        ) {
          // ポイントを減らす
          actions.failTask()
          
          // このタスクをチェック済みとしてマーク
          checkedTasksRef.current.add(task.id)
          
          console.log(`Task "${task.title}" is overdue. -10 points deducted.`)
        }
      })
    }

    // 初回チェック
    checkOverdueTasks()

    // 1分ごとにチェック
    const interval = setInterval(checkOverdueTasks, 60000)

    return () => clearInterval(interval)
  }, [tasks, actions])

  // タスクが完了した時にチェック済みリストから除外
  useEffect(() => {
    const completedTaskIds = tasks
      .filter(task => task.completed)
      .map(task => task.id)
    
    completedTaskIds.forEach(id => {
      checkedTasksRef.current.delete(id)
    })
  }, [tasks])
} 