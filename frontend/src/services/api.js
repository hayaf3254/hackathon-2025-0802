// API Base URL
const API_BASE_URL = 'http://localhost:3000'



const toNumericId = (userId) => {
  if (typeof userId === 'string' && userId.startsWith('user_')) {
    const numeric = parseInt(userId.split('_')[1], 10);
    console.log('[toNumericId] Converted', userId, '→', numeric);
    return numeric;
  }
  console.log('[toNumericId] Already numeric:', userId);
  return userId;
};

// API Error Handler
const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (parseError) {
      // JSON解析に失敗した場合はデフォルトメッセージを使用
      console.warn('Failed to parse error response:', parseError)
    }
    
    const error = new Error(errorMessage)
    error.status = response.status
    error.statusText = response.statusText
    throw error
  }
  return response
}

// Generic API Request Function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  console.log(`API Request: ${config.method || 'GET'} ${url}`, {
    body: config.body ? JSON.parse(config.body) : undefined
  })

  try {
    const response = await fetch(url, config)
    await handleApiError(response)
    const result = await response.json()
    console.log(`API Response (${endpoint}):`, result)
    return result
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, {
      url,
      method: config.method || 'GET',
      error: error.message,
      status: error.status,
      statusText: error.statusText
    })
    
    // より詳細なエラー情報を含む新しいエラーを作成
    const detailedError = new Error(`API Request Failed: ${error.message}`)
    detailedError.originalError = error
    detailedError.endpoint = endpoint
    detailedError.method = config.method || 'GET'
    detailedError.status = error.status
    
    throw detailedError
  }
}

// ================================
// Task API Functions
// ================================

/**
 * タスクを作成する
 * @param {string} userId - ユーザーID
 * @param {string} task - タスク内容
 * @param {string} deadline - 期限 (datetime)
 * @returns {Promise} API Response
 */
// export const createTask = async (userId, task, deadline) => {
//   return apiRequest('/api/tasks', {
//     method: 'POST',
//     body: JSON.stringify({
//       id: userId,
//       todo: task,
//       deadline: deadline
//     })
//   })
// }

/**
 * タスクを完了にする
//  * @param {string} taskId - タスクID
//  * @returns {Promise} API Response
//  */
// export const completeTask = async (taskId) => {
//   return apiRequest('/api/tasks/complete', {
//     method: 'PUT',
//     body: JSON.stringify({
//       task_id: taskId
//     })
//   })
// }

/**
 * ユーザーのタスク一覧を取得する
 * @param {string} userId - ユーザーID
 * @returns {Promise<Array>} タスク一覧 [{task_id, task, deadline, judge}, ...]
 */
export const getUserTasks = async (userId) => {
  return apiRequest('/api/return', {
    method: 'POST',
    body: JSON.stringify({
      id: toNumericId(userId)
    })
  })
}

// ================================
// User Management API Functions  
// ================================

/**
 * ユーザー一覧を取得する
 * @returns {Promise<Array>} ユーザー一覧 [{id, name, point}, ...]
 */
export const getAllUsers = async () => {
  return apiRequest('/api/users', {
    method: 'GET'
  })
}

/**
 * 新しいユーザーを作成する
 * @param {string} userId - ユーザーID
 * @param {string} name - ユーザー名
 * @param {string} password - パスワード（オプション）
 * @returns {Promise} API Response
 */
export const createUser = async (userId, name, password = '') => {
  console.log('Creating user:', { userId, name, hasPassword: !!password })
  
  try {
    const result = await apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        id: toNumericId(userId),
        name: name,
        password: password
      })
    })
    
    console.log('User creation successful:', result)
    return result
  } catch (error) {
    console.error('User creation failed:', {
      userId,
      name,
      error: error.message,
      status: error.status
    })
    
    // エラーにより詳細な情報を追加
    const enhancedError = new Error(`ユーザー作成に失敗しました: ${error.message}`)
    enhancedError.originalError = error
    enhancedError.userId = userId
    enhancedError.userName = name
    
    throw enhancedError
  }
}

/**
 * ユーザー情報を取得する
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object>} ユーザー情報 {id, name, point}
 */
export const getUserInfo = async (userId) => {
  return apiRequest('/api/users/info', {
    method: 'POST',
    body: JSON.stringify({
      id: userId
    })
  })  
}

// ================================
// User/Point API Functions
// ================================

/**
 * ユーザーのポイントを取得する
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getUserPoints = async (userId) => {
  const res = await apiRequest('/api/getPoint', {
    method: 'POST',
    body: JSON.stringify({ id: toNumericId(userId) })
  })
  // 配列形式で返ってくるので1件目からpointを取り出す
  return Array.isArray(res) ? res[0]?.point ?? 0 : 0
}


/**
 * ユーザーのポイントを更新する
 * @param {string} userId
 * @param {number} newPoints
 * @returns {Promise<object>}
 */
export const updateUserPoints = async (userId, newPoints) => {
  return apiRequest('/api/updatePoint', {
    method: 'PUT',
    body: JSON.stringify({
      id: String(toNumericId(userId)),    // 念のため文字列に
      point: String(newPoints)
    })
  })
}

// ================================
// Utility Functions
// ================================

/**
 * タスクデータをフロントエンド形式に変換
 * @param {Object} backendTask - バックエンドからのタスクデータ
 * @returns {Object} フロントエンド用タスクデータ
 */
export const transformTaskFromBackend = (backendTask) => {
  return {
    id: backendTask.task_id,             // ← task_id → id
    title: backendTask.task,             // ← task → title
    due_date: backendTask.deadline,      // ← deadline → due_date
    completed: backendTask.judge         // ← judge → completed
    // completed_at は使わない・渡さない
  }
}
/**
 * 複数のタスクデータを変換
 * @param {Array} backendTasks - バックエンドからのタスクデータ配列
 * @returns {Array} フロントエンド用タスクデータ配列
 */
export const transformTasksFromBackend = (backendTasks) => {
  return backendTasks.map(transformTaskFromBackend)
}

// ================================
// Development/Testing Functions
// ================================

/**
 * API接続テスト
 * @returns {Promise} Test Result
 */
export const testApiConnection = async () => {
  try {
    const response = await apiRequest('/test-db')
    console.log('API Connection Test:', response)
    return response
  } catch (error) {
    console.error('API Connection Failed:', error)
    throw error
  }
}