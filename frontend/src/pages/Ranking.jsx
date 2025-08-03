import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { Trophy, Medal, Award, User, TrendingUp, Star, Crown } from 'lucide-react'

function Ranking() {
  const { user } = useUser()
  const [rankingData, setRankingData] = useState([])
  const [loading, setLoading] = useState(true)

  // サンプルデータ（後でAPIから取得）
  useEffect(() => {
    const fetchRankingData = async () => {
      setLoading(true)
      // 実際の実装ではAPIを呼び出す
      setTimeout(() => {
        const sampleData = [
          { id: '2', name: 'マスター太郎', points: 150, rank: 1, tasksCompleted: 25, worldState: 'normal' },
          { id: '5', name: 'タスクハンター花子', points: 89, rank: 2, tasksCompleted: 18, worldState: 'normal' },
          { id: '3', name: 'がんばる三郎', points: 45, rank: 3, tasksCompleted: 12, worldState: 'warning' },
          { id: '1', name: user.name || user.id, points: user.points, rank: 4, tasksCompleted: 8, worldState: user.worldState },
          { id: '4', name: 'のんびり四郎', points: -25, rank: 5, tasksCompleted: 5, worldState: 'critical' },
          { id: '6', name: '初心者五郎', points: -80, rank: 6, tasksCompleted: 2, worldState: 'critical' },
        ]
        setRankingData(sampleData)
        setLoading(false)
      }, 1000)
    }

    fetchRankingData()
  }, [user])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-400" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />
      default:
        return <span className="text-2xl font-bold text-gray-500">#{rank}</span>
    }
  }

  const getPointsColor = (points) => {
    if (points < -100) return 'text-red-500'
    if (points < -20) return 'text-red-400'
    if (points < 50) return 'text-yellow-400'
    return 'text-worldEnd-gold'
  }

  const getWorldStateText = (worldState) => {
    switch (worldState) {
      case 'normal': return '平和'
      case 'warning': return '警告'
      case 'critical': return '危険'
      case 'destroyed': return '滅亡'
      default: return '不明'
    }
  }

  const getWorldStateColor = (worldState) => {
    switch (worldState) {
      case 'normal': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      case 'destroyed': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-worldEnd-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">ランキングを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-worldEnd-gold mr-3" />
            <h1 className="text-4xl font-bold text-white">ランキング</h1>
          </div>
          <p className="text-gray-300 text-lg">
            タスク管理の達人たちが織りなす世界救済戦争！
          </p>
        </div>

        {/* 個人統計 */}
        <div className="glass-effect rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="h-6 w-6 mr-2" />
            あなたの成績
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-worldEnd-gold mb-1">
                #{rankingData.find(u => u.id === user.id)?.rank || '?'}
              </div>
              <div className="text-sm text-gray-400">現在の順位</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${getPointsColor(user.points)}`}>
                {user.points}pt
              </div>
              <div className="text-sm text-gray-400">総ポイント</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {rankingData.find(u => u.id === user.id)?.tasksCompleted || 0}
              </div>
              <div className="text-sm text-gray-400">完了タスク</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold mb-1 ${getWorldStateColor(user.worldState)}`}>
                {getWorldStateText(user.worldState)}
              </div>
              <div className="text-sm text-gray-400">世界状態</div>
            </div>
          </div>
        </div>

        {/* ランキングリスト */}
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            全体ランキング
          </h2>
          
          <div className="space-y-4">
            {rankingData.map((userRank, index) => (
              <div
                key={userRank.id}
                className={`p-4 rounded-lg border transition-all ${
                  userRank.id === user.id
                    ? 'bg-worldEnd-gold bg-opacity-10 border-worldEnd-gold'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* ランクアイコン */}
                    <div className="flex-shrink-0 w-16 text-center">
                      {getRankIcon(userRank.rank)}
                    </div>
                    
                    {/* ユーザー情報 */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-semibold ${
                          userRank.id === user.id ? 'text-worldEnd-gold' : 'text-white'
                        }`}>
                          {userRank.name}
                        </h3>
                        {userRank.id === user.id && (
                          <Star className="h-5 w-5 text-worldEnd-gold" />
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        完了タスク: {userRank.tasksCompleted}件 | 
                        世界状態: <span className={getWorldStateColor(userRank.worldState)}>
                          {getWorldStateText(userRank.worldState)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ポイント */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPointsColor(userRank.points)}`}>
                      {userRank.points}pt
                    </div>
                    {userRank.rank <= 3 && (
                      <div className="text-xs text-gray-400 mt-1">
                        🏆 上位入賞者
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-worldEnd-gold mb-2">
              {Math.max(...rankingData.map(u => u.points))}pt
            </div>
            <div className="text-sm text-gray-400">最高ポイント</div>
          </div>
          
          <div className="glass-effect rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {Math.round(rankingData.reduce((sum, u) => sum + u.points, 0) / rankingData.length)}pt
            </div>
            <div className="text-sm text-gray-400">平均ポイント</div>
          </div>
          
          <div className="glass-effect rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {rankingData.filter(u => u.worldState === 'normal').length}
            </div>
            <div className="text-sm text-gray-400">平和な世界</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking