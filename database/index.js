require('dotenv').config();
const format = require('pg-format');
const { Pool, Client } = require('pg');

const connectionString = `postgresql://postgres:${process.env.PGPASSWORD}@localhost:5432/boardgame-db`;

const client = new Client({
  connectionString,
});

const pool = new Pool({
  connectionString,
});

const queryDate = async (queryId) => {
  const client = await pool.connect();
  console.log(queryId);
  try {
    const res = await client.query(
      `SELECT date FROM mainQueryDate WHERE id = '${queryId}'`,
    );

    return res.rows;
  } catch (e) {
    console.log('ERROR IN QUERYDATE', e);
    return undefined;
  } finally {
    client.release();
  }
};

const addDateToQuery = async (queryId, date) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO mainQueryDate(id, date) 
      VALUES ('${queryId}', '${date.toString()}') ON CONFLICT DO NOTHING`,
    );
    return res.rows;
  } catch (e) {
    console.log('ERROR IN addDateToQuery', e);
    return undefined;
  } finally {
    client.release();
  }
};

const addGamesToDatabase = async (games) => {
  const client = await pool.connect();
  games = games.map((game) => {
    return `('${game.id}', ARRAY [${game.categories.map(
      (category) => "'" + category.id + "'",
    )}]::VARCHAR[], ARRAY [${game.mechanics.map(
      (category) => "'" + category.id + "'",
    )}]::VARCHAR[], ${game.max_players}, ${game.min_players}, ${
      game.max_playtime
    }, ${game.min_playtime}, ${game.year_published}, ${
      game.average_user_rating
    }, '${game.thumb_url}', '${game.name.replace("'", '"')}')`;
  });

  const query1 = `INSERT INTO games (id, categories, mechanics, max_players, min_players, max_playtime, min_playtime, year_published, average_user_rating, thumb_url, name) VALUES ${games} RETURNING *`;
  console.log(query1);
  try {
    const res = await client.query(query1);
    return res.rows;
  } catch (e) {
    console.log('ERROR IN addGamesToDataBase', e);
  } finally {
    client.release();
  }
};

const fetchGamesWithMainQuery = async (query) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM games`);
    return res.rows;
  } catch (e) {
    console.log('ERROR IN fetchGamesWithMainQuery', e);
  } finally {
    client.release();
  }
};

module.exports = {
  queryDate,
  addGamesToDatabase,
  addDateToQuery,
  fetchGamesWithMainQuery,
};
