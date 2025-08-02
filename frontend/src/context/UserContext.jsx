import React, { createContext, useContext, useReducer, useEffect } from 'react'

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
  }
  return {
    id: 'user_001',
    points: 0,
    isWorldDestroyed: false
  }
}

// Helper function to determine world state based on points (define early)
function getWorldState(points) {
  if (points < -100) return 'destroyed'
  if (points < -20) return 'critical'
  if (points < 50) return 'warning'
  return 'normal'
}

// Initial state
const getInitialState = () => {
  const user = getStoredUser()
  return {
    user,
    tasks: [], // Empty tasks list
    worldState: getWorldState(user.points) // ユーザーのポイントに基づいて世界状態を設定
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
      return { ...state, tasks: action.payload }
    
    case ActionTypes.ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload] }
    
    case ActionTypes.COMPLETE_TASK:
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? { ...task, completed: true, completed_at: action.payload.completedAt }
          : task
      )
      return { ...state, tasks: updatedTasks }
    
    case ActionTypes.UPDATE_POINTS:
      const newPoints = state.user.points + action.payload // マイナス値も許可
      const isDestroyed = newPoints < -100
      return {
        ...state,
        user: {
          ...state.user,
          points: newPoints,
          isWorldDestroyed: isDestroyed
        },
        worldState: getWorldState(newPoints)
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
      return {
        ...state,
        user: {
          id: action.payload.id,
          name: action.payload.name,
          points: action.payload.points || 0,
          isWorldDestroyed: false
        },
        tasks: action.payload.tasks || [],
        worldState: getWorldState(action.payload.points || 0)
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
      return {
        ...initialState
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
    
    addTask: (task) => dispatch({ type: ActionTypes.ADD_TASK, payload: task }),
    
    completeTask: (taskId, completedAt = new Date().toISOString()) => {
      // タスクを見つけて段階的ポイント制でポイントを計算
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        const points = calculateTaskPoints(task.due_date, completedAt)
        dispatch({
          type: ActionTypes.COMPLETE_TASK,
          payload: { taskId, completedAt }
        })
        dispatch({ type: ActionTypes.UPDATE_POINTS, payload: points })
        
        // localStorageも更新
        const currentUser = JSON.parse(localStorage.getItem('worldend_user') || '{}')
        if (currentUser.id) {
          const newPoints = currentUser.points + points
          localStorage.setItem('worldend_user', JSON.stringify({
            ...currentUser,
            points: newPoints
          }))
        }
      }
    },
    
    failTask: () => {
      // 期限切れのペナルティを-50ポイントに変更
      dispatch({ type: ActionTypes.UPDATE_POINTS, payload: -50 })
      
      // localStorageも更新
      const currentUser = JSON.parse(localStorage.getItem('worldend_user') || '{}')
      if (currentUser.id) {
        const newPoints = currentUser.points - 50
        localStorage.setItem('worldend_user', JSON.stringify({
          ...currentUser,
          points: newPoints
        }))
      }
    },
    
    updatePoints: (pointChange) => {
      dispatch({ type: ActionTypes.UPDATE_POINTS, payload: pointChange })
      // localStorageも更新
      const currentUser = JSON.parse(localStorage.getItem('worldend_user') || '{}')
      if (currentUser.id) {
        const newPoints = currentUser.points + pointChange
        localStorage.setItem('worldend_user', JSON.stringify({
          ...currentUser,
          points: newPoints
        }))
      }
    },
    
    destroyWorld: () => dispatch({ type: ActionTypes.DESTROY_WORLD }),
    
    resetWorld: () => dispatch({ type: ActionTypes.RESET_WORLD }),
    
    loginUser: (id, name, points = 0, tasks = []) => {
      dispatch({
        type: ActionTypes.LOGIN_USER,
        payload: { id, name, points, tasks }
      })
    },
    
    createUser: (id, name) => {
      dispatch({
        type: ActionTypes.CREATE_USER,
        payload: { id, name }
      })
    },
    
    logoutUser: () => dispatch({ type: ActionTypes.LOGOUT_USER })
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