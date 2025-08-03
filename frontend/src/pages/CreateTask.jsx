import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Upload, Camera, Type, Calendar, Clock, Plus, Loader } from 'lucide-react'
import Tesseract from 'tesseract.js'

function CreateTask() {
  const navigate = useNavigate()
  const { actions } = useUser()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    dueTime: ''
  })
  
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle image upload and OCR processing
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Display uploaded image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)

    setIsOcrProcessing(true)
    setOcrProgress(0)

    try {
      const result = await Tesseract.recognize(
        file,
        'jpn+eng', // Japanese and English
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100))
            }
          }
        }
      )

      // Extract text and set as task title
      const extractedText = result.data.text.trim()
      if (extractedText) {
        setFormData(prev => ({
          ...prev,
          title: prev.title ? `${prev.title}\n${extractedText}` : extractedText
        }))
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      alert('画像からのテキスト抽出に失敗しました。手動でタスクを入力してください。')
    } finally {
      setIsOcrProcessing(false)
      setOcrProgress(0)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('タスク名を入力してください')
      return
    }
    
    if (!formData.dueDate) {
      alert('締切日を選択してください')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Combine date and time
      const dueDateTime = formData.dueTime 
        ? `${formData.dueDate}T${formData.dueTime}:00`
        : `${formData.dueDate}T23:59:00`

      // Create task data for both API and local state
      const newTask = {
        id: `task_${Date.now()}`, // 一時的なID（APIからの応答で更新される）
        title: formData.title.trim(),
        due_date: dueDateTime,
        completed: false,
        created_at: new Date().toISOString()
      }

      // API経由でタスクを作成（UserContextのaddTaskがAPIを呼び出す）
      await actions.addTask(newTask)
      
      // Clean up
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage)
      }
      
      // Success message and navigation
      console.log('タスクが正常に作成されました:', newTask.title)
      navigate('/home')
      
    } catch (error) {
      console.error('タスクの作成に失敗しました:', error)
      alert('タスクの作成に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-effect rounded-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Plus className="h-8 w-8 text-worldEnd-gold" />
          <h1 className="text-3xl font-bold text-white text-shadow">
            新しいタスクを作成
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title Input */}
          <div>
            <label className="flex items-center space-x-2 text-white font-semibold mb-2">
              <Type className="h-5 w-5" />
              <span>タスク名</span>
            </label>
            <textarea
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="タスクの内容を入力してください..."
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-worldEnd-gold focus:outline-none resize-vertical min-h-[100px]"
              required
            />
          </div>

          {/* Image Upload for OCR */}
          <div>
            <label className="flex items-center space-x-2 text-white font-semibold mb-2">
              <Camera className="h-5 w-5" />
              <span>画像からテキストを読み取り（OCR）</span>
            </label>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-worldEnd-gold transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-worldEnd-gold hover:text-yellow-400 underline"
                  >
                    別の画像を選択
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer py-8"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    クリックして画像をアップロード
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG、PNG、GIF形式に対応
                  </p>
                </div>
              )}

              {isOcrProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-worldEnd-gold">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>テキスト解析中...</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-worldEnd-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">{ocrProgress}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Due Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-white font-semibold mb-2">
                <Calendar className="h-5 w-5" />
                <span>締切日</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={getMinDate()}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-worldEnd-gold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-white font-semibold mb-2">
                <Clock className="h-5 w-5" />
                <span>締切時間（省略可）</span>
              </label>
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-worldEnd-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex-1 btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isOcrProcessing || isSubmitting}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOcrProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>OCR処理中...</span>
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>作成中...</span>
                </div>
              ) : (
                '📝 タスクを追加'
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500">
          <h3 className="text-blue-300 font-semibold mb-2">💡 使い方のヒント</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• 画像から手書きや印刷されたテキストを自動で読み取れます</li>
            <li>• 締切時間を指定しない場合、その日の23:59に設定されます</li>
            <li>• ポイント制：期限1週間前まで+10pt、3日前まで+5pt、前日まで+3pt、当日+1pt、期限切れ-50pt</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CreateTask 