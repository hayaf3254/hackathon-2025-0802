const express = require('express');
const router = express.Router();
const db = require('../db');
const { error } = require('console');

router.post('/return', async (req, res) => {
  // フロントから送られてくるidは、user_idとして扱う
  const { id } = req.body;
  console.log('受け取ったID:', id, typeof id);
    if (typeof id !== 'number') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

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

router.post('/getPoint', async (req, res) => {
  const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ユーザIDがないです' });
    }
    try{
        const queryText = 'SELECT point FROM user_table WHERE id = $1';
        const values = [id];

        // データベースにクエリを送信
        const { rows } = await db.query(queryText, values);

        res.status(200).json(rows);


    }
    catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'データベースエラー' });
    }

});

router.put('/updatePoint', async (req, res) => {

    const { id, point } = req.body;
  
    if (!id) {
        return res.status(400).json({ error: 'ユーザIDがないです' });
    }
    if (!point) {
        return res.status(400).json({ error: 'ユーザのpointが存在しないです' });
    }
    try{
        const queryText = 'UPDATE user_table SET point=$2 WHERE id = $1;';
        const values = [id, point];

        // データベースにクエリを送信
        const result = await db.query(queryText, values);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'ポイントが正常に更新されました', updatedId: id });
        } else {
            // idが存在しないなど、何も更新されなかった場合
            res.status(404).json({ error: '指定されたユーザーが見つかりませんでした。' });
        }


    }
    catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'データベースエラー' });
    }

});

router.get('/users', async (req, res) => {
  const users = await db.query('SELECT id, name, point FROM user_table');
  res.json(users.rows);
})

router.post('/users', async (req, res) => {
  const { id, name, password } = req.body;
  const point = 0;
  await db.query('INSERT INTO user_table (id, name, password, point) VALUES ($1, $2, $3, $4)', [id, name, password, point]);
  res.json({ message: 'User created' });
})

router.post('/judge', async (req, res) => {
  const { task_id } = req.body;

  if (!task_id) {
    return res.status(400).json({ error: 'task_id is required' });
  }

  try {
    const queryText = 'UPDATE task_table SET judge = TRUE WHERE task_id = $1 RETURNING *;';
    const values = [task_id];

    const result = await db.query(queryText, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task judged successfully', updatedTask: result.rows[0] });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST /api/add-task

router.post('/add-task', async (req, res) => {
  const { id, todo, deadline } = req.body;

  // バリデーション
  if (!id || !todo || !deadline) {
    return res.status(400).json({ error: 'id, todo, and deadline are required' });
  }

  try {
    const queryText = `
      INSERT INTO task_table (user_id, task, deadline, judge)
      VALUES ($1, $2, $3, FALSE)
      RETURNING *;
    `;
    const values = [id, todo, deadline];

    const result = await db.query(queryText, values);

    res.status(201).json({
      message: 'Task added successfully',
      newTask: result.rows[0]
    });
  } catch (err) {
    console.error('Error inserting task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;