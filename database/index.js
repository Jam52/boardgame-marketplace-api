require('dotenv').config();

const { Pool, Client } = require('pg');
const connectionString = `postgresql://postgres:${process.env.PGPASSWORD}@localhost:5432/boardgame-db`;

const client = new Client({
  connectionString,
});

const pool = new Pool({
  connectionString,
});

const queryDate = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT date FROM test WHERE id = 1');
    return res.rows;
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
  }
};

const updateDate = async (date) => {
  const client = await pool.connect();
  console.log(date.toString());
  try {
    const res = await client.query(
      `UPDATE test SET date = '${date.toString()}' WHERE id = 1`,
    );
    return res.rows;
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
  }
};

module.exports = {
  queryDate,
  updateDate,
};
