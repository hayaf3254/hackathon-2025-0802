// server.js
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

// ===========================================
// CORS の設定（全許可）
// ===========================================
// cors() ミドルウェアを使用することで、すべてのオリジンからのリクエストを許可します。
// 本番環境ではセキュリティ上の理由から、許可するオリジンを限定することを強く推奨します。
app.use(cors());

// ===========================================
// ミドルウェア
// ===========================================
// JSON リクエストボディをパースするためのミドルウェア
app.use(express.json());
// URLエンコードされたリクエストボディをパースするためのミドルウェア
app.use(express.urlencoded({ extended: true }));

// ===========================================
// ルーティング
// ===========================================

// ルートパス ('/') への GET リクエストに対するハンドラ
app.get('/', (req, res) => {
  res.send('Node.js API is running!');
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`CORS is enabled for all origins.`);
});