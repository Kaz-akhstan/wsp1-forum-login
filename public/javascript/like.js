const db = require('../../utils/database');
const promisePool = db.promise();
async function likeFunc(id)
{
  alert(id)
  const [rows] = await promisePool.query('UPDATE rj28forum SET likes = likes + 1 WHERE id = ?', [id])
  alert(id)
}