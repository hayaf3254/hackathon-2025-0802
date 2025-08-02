// .envファイルから環境変数を読み込む
require('dotenv').config();

// node-postgres (pg) ライブラリをインポート
const { Pool } = require('pg');

// データベース接続プールの設定
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// アプリケーションの他の部分で使えるように、クエリ関数をエクスポート
module.exports = {
  query: (text, params) => pool.query(text, params),
};