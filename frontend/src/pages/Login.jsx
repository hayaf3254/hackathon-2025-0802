import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { User, LogIn, UserPlus, Loader } from 'lucide-react'
import { getAllUsers, createUser as apiCreateUser, testApiConnection } from '../services/api'

function Login() {
  const { actions } = useUser()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [existingUsers, setExistingUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState('unknown') // 'connected', 'disconnected', 'unknown'

  // APIから既存ユーザー一覧を取得とAPI接続テスト
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true)
      setError(null)
      
      // まずAPI接続テストを実行
      try {
        console.log('API接続テストを実行中...')
        await testApiConnection()
        setApiStatus('connected')
        console.log('API接続テスト成功')
        
        // API接続が成功した場合、ユーザー一覧を取得
        try {
          const users = await getAllUsers()
          setExistingUsers(users)
          console.log('ユーザー一覧取得成功:', users.length, 'users')
        } catch (usersError) {
          console.warn('ユーザー一覧取得に失敗:', usersError.message)
          setError('ユーザー一覧の取得に失敗しました')
          // API接続はOKだがユーザー一覧が取得できない場合
          setExistingUsers([])
        }
        
      } catch (connectionError) {
        console.warn('API接続に失敗:', connectionError.message)
        setApiStatus('disconnected')
        console.log('オフラインモードで動作します')
        
        // API接続に失敗した場合はフォールバック用のサンプルデータ
        setExistingUsers([
          { id: '1', name: 'ユーザー1', point: 0 },
          { id: '2', name: 'ユーザー2', point: 25 },
          { id: '3', name: 'ユーザー3', point: -30 }
        ])
        
        // API接続失敗時のメッセージ（エラーではなく情報として）
        console.info('オフラインモード: サンプルユーザーでログインできます')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleLogin = async (userId, userName, points = 0) => {
    setIsLoading(true)
    setError(null)
    
    console.log('ログイン開始:', { userId, userName, points })
    
    try {
      // APIからデータを取得を試行（新規作成時は空のタスクでローカルログイン）
      let tasks = []
      let userPoints = points
      
      if (points === 0) {
        // 新規ユーザー作成からのログインの場合はAPIスキップ
        console.log('新規ユーザーのログイン、APIスキップ')
      } else {
        // 既存ユーザーのログインの場合はAPI取得を試行
        try {
          console.log('APIからユーザーデータ取得を試行中...')
          const userData = await actions.loadUserData(userId)
          tasks = userData.tasks || []
          userPoints = userData.points || points
          console.log('API経由でユーザーデータ取得成功')
        } catch (apiError) {
          console.warn('API取得に失敗、ローカルデータでログイン継続:', apiError.message)
          // API失敗時はローカルデータまたはデフォルト値を使用
        }
      }
      
      // ローカル状態でログイン処理
      await actions.loginUser(userId, userName, userPoints, tasks)
      
      // ログイン情報をlocalStorageに保存
      localStorage.setItem('worldend_user', JSON.stringify({
        id: userId,
        name: userName,
        points: userPoints
      }))
      
      console.log('ログイン成功:', { userName, points: userPoints, tasksCount: tasks.length })
      
      // React Routerでホーム画面に遷移
      navigate('/home')
    } catch (error) {
      console.error('ログインに失敗:', error)
      setError('ログインに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!username.trim()) {
      setError('ユーザー名を入力してください')
      return
    }

    setIsLoading(true)
    setError(null)
    
    const newUserId = `user_${Date.now()}`
    const trimmedUsername = username.trim()
    
    console.log('ユーザー作成開始:', { newUserId, username: trimmedUsername })
    
    try {
      // まずAPIでの作成を試行
      console.log('APIでのユーザー作成を試行中...')
      await apiCreateUser(newUserId, trimmedUsername)
      console.log('API経由でのユーザー作成成功')
      
      // APIが成功した場合のローカル状態更新
      actions.createUser(newUserId, trimmedUsername)
      
      // 作成後すぐにログイン
      console.log('作成したユーザーでログイン中...')
      await handleLogin(newUserId, trimmedUsername, 0)
      
    } catch (apiError) {
      console.warn('API経由でのユーザー作成に失敗、ローカル作成にフォールバック:', {
        error: apiError.message,
        status: apiError.status
      })
      
      // APIが失敗してもローカルでユーザー作成を継続（オフライン対応）
      try {
        console.log('ローカルでのユーザー作成を実行中...')
        
        // ローカル状態を更新
        actions.createUser(newUserId, trimmedUsername)
        
        // localStorageにも保存
        localStorage.setItem('worldend_user', JSON.stringify({
          id: newUserId,
          name: trimmedUsername,
          points: 0
        }))
        
        console.log('ローカルユーザー作成成功:', { newUserId, username: trimmedUsername })
        
        // 作成後すぐにログイン処理（APIなしでローカルのみ）
        await actions.loginUser(newUserId, trimmedUsername, 0, [])
        
        console.log('ローカルログイン成功、ホーム画面に遷移')
        navigate('/home')
        
        // 成功メッセージを表示（API接続の問題を通知）
        console.info('ユーザー作成完了（オフラインモード）')
        
      } catch (localError) {
        console.error('ローカルユーザー作成も失敗:', localError)
        setError('ユーザーの作成に失敗しました。ページを再読み込みして再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌍 WorldEnd Task Manager
          </h1>
          <p className="text-gray-300">
            タスク管理でランキングを競おう！
          </p>
          
          {/* API接続状況の表示 */}
          {apiStatus !== 'unknown' && (
            <div className={`mt-4 px-3 py-1 rounded-full text-xs inline-flex items-center space-x-2 ${
              apiStatus === 'connected' 
                ? 'bg-green-900 bg-opacity-50 text-green-300 border border-green-500' 
                : 'bg-yellow-900 bg-opacity-50 text-yellow-300 border border-yellow-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <span>
                {apiStatus === 'connected' ? 'オンライン' : 'オフラインモード'}
              </span>
            </div>
          )}
        </div>

        <div className="glass-effect rounded-lg p-6">
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
              <details className="mt-2">
                <summary className="text-red-400 text-xs cursor-pointer hover:text-red-300">
                  トラブルシューティング
                </summary>
                <div className="text-red-200 text-xs mt-1 space-y-1">
                  <p>• バックエンドサーバーが起動していない可能性があります</p>
                  <p>• ネットワーク接続を確認してください</p>
                  <p>• ページを再読み込みして再度お試しください</p>
                  <p>• 問題が続く場合は開発者にお問い合わせください</p>
                </div>
              </details>
            </div>
          )}

          {/* ローディング表示 */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader className="h-12 w-12 text-worldEnd-gold mx-auto mb-4 animate-spin" />
              <p className="text-white">処理中...</p>
            </div>
          ) : !isCreatingUser ? (
            <>
              {/* 既存ユーザーでログイン */}
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <LogIn className="h-5 w-5 mr-2" />
                ユーザー選択
              </h2>
              
              <div className="space-y-3 mb-6">
                {existingUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user.id, user.name, user.point || 0)}
                    disabled={isLoading}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-8 w-8 text-worldEnd-gold mr-3" />
                        <div className="text-left">
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-sm text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          (user.point || 0) < -100 ? 'text-red-500' :
                          (user.point || 0) < -20 ? 'text-red-400' :
                          (user.point || 0) < 50 ? 'text-yellow-400' : 'text-worldEnd-gold'
                        }`}>
                          {user.point || 0}pt
                        </div>
                        <div className="text-xs text-gray-500">ポイント</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 新規ユーザー作成ボタン */}
              <button
                onClick={() => setIsCreatingUser(true)}
                disabled={isLoading}
                className="w-full p-3 bg-worldEnd-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                新しいユーザーを作成
              </button>
            </>
          ) : (
            <>
              {/* 新規ユーザー作成 */}
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                新規ユーザー作成
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ユーザー名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ユーザー名を入力"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-worldEnd-gold focus:border-transparent disabled:opacity-50"
                    maxLength={20}
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateUser}
                    disabled={!username.trim() || isLoading}
                    className="flex-1 py-3 bg-worldEnd-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    作成してログイン
                  </button>
                  <button
                    onClick={() => setIsCreatingUser(false)}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                  >
                    戻る
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-4 text-sm text-gray-400">
          {apiStatus === 'connected' 
            ? 'ランキング機能で他のユーザーと競争しよう！'
            : 'オフラインモードでもタスク管理が利用できます！'
          }
        </div>
      </div>
    </div>
  )
}

export default Login