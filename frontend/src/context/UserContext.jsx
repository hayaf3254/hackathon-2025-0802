import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  //createTask as apiCreateTask,
  //completeTask as apiCompleteTask,
  getUserTasks,
  getUserPoints,
  updateUserPoints,
  transformTasksFromBackend
} from '../services/api'

// 空のユーザー状態を返す関数
const getEmptyUser = () => ({
  id: '',
  name: '',
  points: 0,
  isWorldDestroyed: false
})

// localStorageからログイン情報を取得
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('worldend_user')
    if (stored) {
      const userData = JSON.parse(stored)
      return {
        id: userData.id,
        name: userData.name,
        points: userData.points || 0,
        isWorldDestroyed: userData.points < -100
      }
    }
  } catch (error) {
    console.error('Failed to parse stored user data:', error)
    // エラーの場合はlocalStorageをクリア
    localStorage.removeItem('worldend_user')
  }
  // localStorageにデータがない場合は空の状態を返す
  return getEmptyUser()
}

// Helper function to calculate days until due date
function getDaysUntilDue(dueDate) {
  const now = new Date()
  const due = new Date(dueDate)
  const timeDiff = due - now
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

// Helper function to determine world state based on task deadlines
function getWorldState(tasks) {
  if (!tasks || tasks.length === 0) return 'normal'
  
  const activeTasks = tasks.filter(task => !task.completed)
  if (activeTasks.length === 0) return 'normal'
  
  // 期限切れのタスクが1つでもあれば世界は滅亡
  const hasOverdueTasks = activeTasks.some(task => {
    const daysUntilDue = getDaysUntilDue(task.due_date)
    return daysUntilDue < 0
  })
  if (hasOverdueTasks) return 'destroyed'
  
  // 3日以内のタスクがあれば危険状態
  const hasCriticalTasks = activeTasks.some(task => {
    const daysUntilDue = getDaysUntilDue(task.due_date)
    return daysUntilDue >= 0 && daysUntilDue <= 3
  })
  if (hasCriticalTasks) return 'critical'
  
  // 1週間以内のタスクがあれば警告状態
  const hasWarningTasks = activeTasks.some(task => {
    const daysUntilDue = getDaysUntilDue(task.due_date)
    return daysUntilDue > 3 && daysUntilDue <= 7
  })
  if (hasWarningTasks) return 'warning'
  
  // 1週間以上余裕がある場合は平常状態
  return 'normal'
}

// Initial state
const getInitialState = () => {
  const user = getStoredUser()
  const tasks = [] // Empty tasks list
  return {
    user,
    tasks,
    worldState: getWorldState(tasks) // タスクに基づいて世界状態を設定
  }
}

const initialState = getInitialState()

// Action types
export const ActionTypes = {
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  UPDATE_POINTS: 'UPDATE_POINTS',
  SET_WORLD_STATE: 'SET_WORLD_STATE',
  DESTROY_WORLD: 'DESTROY_WORLD',
  RESET_WORLD: 'RESET_WORLD',
  LOGIN_USER: 'LOGIN_USER',
  CREATE_USER: 'CREATE_USER',
  LOGOUT_USER: 'LOGOUT_USER'
}

// Reducer function
function userReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_TASKS:
      const newTasks = action.payload
      return { 
        ...state, 
        tasks: newTasks,
        worldState: getWorldState(newTasks)
      }
    
    case ActionTypes.ADD_TASK:
      const tasksWithNew = [...state.tasks, action.payload]
      return { 
        ...state, 
        tasks: tasksWithNew,
        worldState: getWorldState(tasksWithNew)
      }
    
    case ActionTypes.COMPLETE_TASK:
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? { ...task, completed: true, completed_at: action.payload.completedAt }
          : task
      )
      return { 
        ...state, 
        tasks: updatedTasks,
        worldState: getWorldState(updatedTasks)
      }
    
    case ActionTypes.UPDATE_POINTS:
      const newPoints = state.user.points + action.payload // マイナス値も許可
      return {
        ...state,
        user: {
          ...state.user,
          points: newPoints,
          isWorldDestroyed: state.worldState === 'destroyed'
        }
      }
    
    case ActionTypes.SET_WORLD_STATE:
      return { ...state, worldState: action.payload }
    
    case ActionTypes.DESTROY_WORLD:
      return {
        ...state,
        user: { ...state.user, isWorldDestroyed: true },
        worldState: 'destroyed'
      }
    
    case ActionTypes.RESET_WORLD:
      return {
        ...state,
        user: { ...state.user, points: 0, isWorldDestroyed: false }, // 初期値を0に変更
        worldState: 'normal'
      }
    
    case ActionTypes.LOGIN_USER:
      const loginTasks = action.payload.tasks || []
      const loginWorldState = getWorldState(loginTasks)
      return {
        ...state,
        user: {
          id: action.payload.id,
          name: action.payload.name,
          points: action.payload.points || 0,
          isWorldDestroyed: loginWorldState === 'destroyed'
        },
        tasks: loginTasks,
        worldState: loginWorldState
      }
    
    case ActionTypes.CREATE_USER:
      return {
        ...state,
        user: {
          id: action.payload.id,
          name: action.payload.name,
          points: 0,
          isWorldDestroyed: false
        },
        tasks: [],
        worldState: 'normal'
      }
    
    case ActionTypes.LOGOUT_USER:
      // ログアウト時は完全に空の状態にリセット
      return {
        user: getEmptyUser(),
        tasks: [],
        worldState: 'normal'
      }
    
    default:
      return state
  }
}

// 段階的ポイント制の計算関数
function calculateTaskPoints(dueDate, completedAt) {
  const due = new Date(dueDate)
  const completed = new Date(completedAt)
  const daysDiff = Math.ceil((due - completed) / (1000 * 60 * 60 * 24))
  
  if (daysDiff >= 7) return 10  // 1週間前まで
  if (daysDiff >= 3) return 5   // 3日前まで  
  if (daysDiff >= 1) return 3   // 前日まで
  if (daysDiff >= 0) return 1   // 当日
  return -50 // 期限切れ
}



// Create context
const UserContext = createContext()

// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState)

  // Actions
  const actions = {
    setTasks: (tasks) => dispatch({ type: ActionTypes.SET_TASKS, payload: tasks }),
    
    // addTask: async (task) => {
    //   try {
    //     // APIでタスクを作成
    //     await apiCreateTask(state.user.id, task.title, task.due_date)
    //     // ローカル状態も更新
    //     dispatch({ type: ActionTypes.ADD_TASK, payload: task })
    //     console.log('Task created:', task.title)
    //   } catch (error) {
    //     console.error('Failed to create task:', error)
    //     // エラーの場合もローカル状態は更新（オフライン対応）
    //     dispatch({ type: ActionTypes.ADD_TASK, payload: task })
    //   }
    // },
    
    completeTask: async (taskId, completedAt = new Date().toISOString()) => {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        try {
          // APIでタスクを完了に更新
          await apiCompleteTask(taskId)
          
          // ポイント計算
          const points = calculateTaskPoints(task.due_date, completedAt)
          
          // ローカル状態を更新
          dispatch({
            type: ActionTypes.COMPLETE_TASK,
            payload: { taskId, completedAt }
          })
          
          // ポイントをAPIで更新
          const newPoints = state.user.points + points
          await updateUserPoints(state.user.id, newPoints)
          dispatch({ type: ActionTypes.UPDATE_POINTS, payload: points })
          
          // localStorageも更新
          const currentUser = JSON.parse(localStorage.getItem('worldend_user') || '{}')
          if (currentUser.id) {
            localStorage.setItem('worldend_user', JSON.stringify({
              ...currentUser,
              points: newPoints
            }))
          }
          
          console.log('Task completed:', task.title, `+${points}pt`)
        } catch (error) {
          console.error('Failed to complete task:', error)
          // エラーの場合もローカルで処理（オフライン対応）
          const points = calculateTaskPoints(task.due_date, completedAt)
          dispatch({
            type: ActionTypes.COMPLETE_TASK,
            payload: { taskId, completedAt }
          })
          dispatch({ type: ActionTypes.UPDATE_POINTS, payload: points })
        }
      }
    },
    
    failTask: async () => {
      try {
        // ペナルティポイント
        const penalty = -50
        const newPoints = state.user.points + penalty
        
        // APIでポイントを更新
        await updateUserPoints(state.user.id, newPoints)
        dispatch({ type: ActionTypes.UPDATE_POINTS, payload: penalty })
        
        // localStorageも更新
        const currentUser = JSON.parse(localStorage.getItem('worldend_user') || '{}')
        if (currentUser.id) {
          localStorage.setItem('worldend_user', JSON.stringify({
            ...currentUser,
            points: newPoints
          }))
        }
        
        console.log('Task failed: -50pt penalty applied')
      } catch (error) {
        console.error('Failed to update points for task failure:', error)
        // エラーの場合もローカルで処理
        dispatch({ type: ActionTypes.UPDATE_POINTS, payload: -50 })
      }
    },
    
    updatePoints: async (pointChange) => {
      try {
        const newPoints = state.user.points + pointChange
        
        // APIでポイントを更新
        await updateUserPoints(state.user.id, newPoints)
        dispatch({ type: ActionTypes.UPDATE_POINTS, payload: pointChange })
        
        // localStorageも更新
        const currentUser = JSON.parse(localStorage.getItem('worldend_user') || '{}')
        if (currentUser.id) {
          localStorage.setItem('worldend_user', JSON.stringify({
            ...currentUser,
            points: newPoints
          }))
        }
      } catch (error) {
        console.error('Failed to update points:', error)
        // エラーの場合もローカルで処理
        dispatch({ type: ActionTypes.UPDATE_POINTS, payload: pointChange })
      }
    },
    
    // APIからユーザーデータを読み込む
loadUserData: async (userId) => {
  try {
    const numericId = typeof userId === 'string' && userId.startsWith('user_')
      ? parseInt(userId.split('_')[1], 10)
      : userId

    const [tasks, points] = await Promise.all([
      getUserTasks(numericId),
      getUserPoints(numericId)
    ])

        
        // バックエンド形式をフロントエンド形式に変換
        const transformedTasks = transformTasksFromBackend(tasks)
        
        // 状態を更新
        dispatch({ type: ActionTypes.SET_TASKS, payload: transformedTasks })
        dispatch({ type: ActionTypes.UPDATE_POINTS, payload: points - state.user.points })
        
        console.log(`Loaded user data: ${transformedTasks.length} tasks, ${points} points`)
        return { tasks: transformedTasks, points }
      } catch (error) {
        console.error('Failed to load user data:', error)
        throw error
      }
    },
    
    destroyWorld: () => dispatch({ type: ActionTypes.DESTROY_WORLD }),
    
    resetWorld: () => dispatch({ type: ActionTypes.RESET_WORLD }),
    
    loginUser: async (id, name, points = 0, tasks = []) => {
      try {
        console.log('UserContext: ログイン処理開始:', { id, name, points, tasksCount: tasks.length })
        
        // ローカル状態を更新
        dispatch({
          type: ActionTypes.LOGIN_USER,
          payload: { id, name, points, tasks }
        })
        
        console.log('UserContext: ログイン処理完了')
        return { success: true }
      } catch (error) {
        console.error('UserContext: ログイン処理エラー:', error)
        throw error
      }
    },
    
    createUser: (id, name) => {
      dispatch({
        type: ActionTypes.CREATE_USER,
        payload: { id, name }
      })
    },
    
    logoutUser: () => {
      try {
        console.log('UserContext: ログアウト処理開始')
        dispatch({ type: ActionTypes.LOGOUT_USER })
        console.log('UserContext: ログアウト処理完了')
      } catch (error) {
        console.error('UserContext: ログアウト処理エラー:', error)
        // エラーが起きてもログアウトは実行
        dispatch({ type: ActionTypes.LOGOUT_USER })
      }
    }
  }

  // World background images based on world state
  const getWorldBackground = () => {
    switch (state.worldState) {
      case 'normal':
        return 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'
      case 'warning':
        return 'bg-gradient-to-br from-orange-900 via-red-900 to-purple-900'
      case 'critical':
        return 'bg-gradient-to-br from-red-900 via-gray-900 to-black'
      case 'destroyed':
        return 'bg-gradient-to-br from-black via-gray-900 to-red-900'
      default:
        return 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'
    }
  }

  return (
    <UserContext.Provider value={{
      ...state,
      actions,
      getWorldBackground
    }}>
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use context
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 