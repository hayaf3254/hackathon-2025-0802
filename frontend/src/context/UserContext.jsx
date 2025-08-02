import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  user: {
    id: 'user_001',
    points: 100,
    isWorldDestroyed: false
  },
  tasks: [], // Empty tasks list
  worldState: 'normal' // normal, warning, critical, destroyed
}

// Action types
export const ActionTypes = {
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  UPDATE_POINTS: 'UPDATE_POINTS',
  SET_WORLD_STATE: 'SET_WORLD_STATE',
  DESTROY_WORLD: 'DESTROY_WORLD',
  RESET_WORLD: 'RESET_WORLD'
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
      const newPoints = Math.max(0, state.user.points + action.payload)
      const isDestroyed = newPoints === 0
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
        user: { ...state.user, points: 100, isWorldDestroyed: false },
        worldState: 'normal'
      }
    
    default:
      return state
  }
}

// Helper function to determine world state based on points
function getWorldState(points) {
  if (points === 0) return 'destroyed'
  if (points <= 20) return 'critical'
  if (points <= 50) return 'warning'
  return 'normal'
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
      dispatch({
        type: ActionTypes.COMPLETE_TASK,
        payload: { taskId, completedAt }
      })
      // Award points for completion
      dispatch({ type: ActionTypes.UPDATE_POINTS, payload: 5 })
    },
    
    failTask: () => {
      // Deduct points for failed task
      dispatch({ type: ActionTypes.UPDATE_POINTS, payload: -10 })
    },
    
    updatePoints: (pointChange) => {
      dispatch({ type: ActionTypes.UPDATE_POINTS, payload: pointChange })
    },
    
    destroyWorld: () => dispatch({ type: ActionTypes.DESTROY_WORLD }),
    
    resetWorld: () => dispatch({ type: ActionTypes.RESET_WORLD })
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