# 🌍 WorldEnd タスク管理アプリ

> ゲーム要素を取り入れた革新的なタスク管理アプリ  
> タスクを完了しなければ世界が滅亡します！

![WorldEnd App](https://img.shields.io/badge/Version-1.0.0-blue) ![React](https://img.shields.io/badge/React-19.1.0-61dafb) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4.0-38bdf8)

## 🎮 特徴

- **ゲーミフィケーション**: タスク完了でポイント獲得、失敗で世界が危機に
- **OCR機能**: 画像からテキストを自動抽出してタスク作成
- **美しいUI**: ダークファンタジー風のレスポンシブデザイン
- **世界の変化**: ポイントに応じて背景とアイコンが変化

## 🚀 クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/hayaf3254/hackathon-2025-0802.git
cd worldend-task-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173/` にアクセス

## 📊 ポイントシステム

| アクション | ポイント変化 |
|-----------|-------------|
| タスク完了 | **+5pt** |
| 期限切れ | **-10pt** |
| 世界滅亡 | **0pt到達時** |

## 🎯 世界の状態

- 🌍 **平和** (100-51pt): 正常状態
- 🌎 **警告** (50-21pt): 注意が必要  
- 🔥 **危機** (20-1pt): 危険状態
- 💀 **滅亡** (0pt): 世界終了

## 📖 詳細ドキュメント

完全な設計書・使い方は [DESIGN_DOCUMENT.md](./DESIGN_DOCUMENT.md) をご覧ください。

## 🛠️ 技術スタック

- **Frontend**: React 19.1.0 + Vite
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM
- **OCR**: Tesseract.js
- **State**: Context API

## 👥 開発チーム

- **濱野**: フロントエンド（メイン）
- **葉山**: バックエンド ＆ GitHub管理
- **中野**: バックエンド（サポート）
- **斎藤**: React.jsサブフロント

## 📝 ライセンス

MIT License

---

**⚠️ 警告**: このアプリを使用する際は、実際に世界が滅亡する心配はありませんが、タスクの締切は守りましょう！
