import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { User, LogIn, UserPlus } from 'lucide-react'

function Login() {
  const { actions } = useUser()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // 既存ユーザーのリスト（後でバックエンドから取得）
  const existingUsers = [
    { id: 'user_001', name: 'ユーザー1', points: 0 },
    { id: 'user_002', name: 'ユーザー2', points: 25 },
    { id: 'user_003', name: 'ユーザー3', points: -30 }
  ]

  const handleLogin = (userId, userName, points = 0) => {
    // ユーザーをログインさせる
    actions.loginUser(userId, userName, points)
    // ログイン情報をlocalStorageに保存
    localStorage.setItem('worldend_user', JSON.stringify({
      id: userId,
      name: userName,
      points: points
    }))
    // React Routerでホーム画面に遷移
    navigate('/home')
  }

  const handleCreateUser = () => {
    if (username.trim()) {
      const newUserId = `user_${Date.now()}`
      actions.createUser(newUserId, username.trim())
      handleLogin(newUserId, username.trim(), 0)
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
        </div>

        <div className="glass-effect rounded-lg p-6">
          {!isCreatingUser ? (
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
                    onClick={() => handleLogin(user.id, user.name, user.points)}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all group"
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
                          user.points < -100 ? 'text-red-500' :
                          user.points < -20 ? 'text-red-400' :
                          user.points < 50 ? 'text-yellow-400' : 'text-worldEnd-gold'
                        }`}>
                          {user.points}pt
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
                className="w-full p-3 bg-worldEnd-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all flex items-center justify-center"
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
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-worldEnd-gold focus:border-transparent"
                    maxLength={20}
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateUser}
                    disabled={!username.trim()}
                    className="flex-1 py-3 bg-worldEnd-gold text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    作成してログイン
                  </button>
                  <button
                    onClick={() => setIsCreatingUser(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    戻る
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-4 text-sm text-gray-400">
          ランキング機能で他のユーザーと競争しよう！
        </div>
      </div>
    </div>
  )
}

export default Login