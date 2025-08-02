const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/return', async (req, res) => {
  // フロントから送られてくるidは、user_idとして扱う
  const { id } = req.body;

  // IDがボディに含まれていない場合はエラーを返す
  if (!id) {
    return res.status(400).json({ error: 'そのユーザIDは存在しません' });
  }

  try {
    // SQLインジェクションを防ぐため、クエリと値を分離する
    const queryText = 'SELECT task_id, task, deadline, judge FROM task_table WHERE user_id = $1';
    const values = [id];

    // データベースにクエリを送信
    const { rows } = await db.query(queryText, values);

    // クエリ結果（タスクの配列）をJSONとして返す
    // 該当するタスクがなくても、空の配列 [] を返すのが一般的
    res.status(200).json(rows);

  } catch (err) {
    // データベースエラーが発生した場合
    console.error('Database error:', err);
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
});

router.get('/ranking', async (req, res) => {
      try {
    // SQLインジェクションを防ぐため、クエリと値を分離する
    const queryText = 'SELECT id, name, point FROM user_table';

    // データベースにクエリを送信
    const { rows } = await db.query(queryText);

    // クエリ結果（タスクの配列）をJSONとして返す
    // 該当するタスクがなくても、空の配列 [] を返すのが一般的
    res.status(200).json(rows);

  } catch (err) {
    // データベースエラーが発生した場合
    console.error('Database error:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }

});

module.exports = router;