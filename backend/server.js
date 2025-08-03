// server.js
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
const db = require('./db');
const apiRouter= require('./api/api');


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

// データベース接続テスト用のルート
app.get('/test-db', async (req, res) => {
  try {
    // db.queryを使って、現在の時刻を取得するSQLを実行
    const result = await db.query('SELECT NOW()');
    // 成功したら、取得した時刻をレスポンスとして返す
    res.status(200).json({
      message: 'Database connection successful!',
      time: result.rows[0].now,
    });
  } catch (err) {
    // エラーが発生したら、500エラーとエラーメッセージを返す
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

app.use('/api', apiRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`CORS is enabled for all origins.`);
});