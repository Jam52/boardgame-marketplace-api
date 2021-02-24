require('dotenv').config();
const { Pool, Client } = require('pg');
const pgp = require('pg-promise')();
const connectionString = `postgresql://postgres:${process.env.PGPASSWORD}@localhost:5432/boardgame-db`;
const db = pgp(connectionString);

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
  db.none(
    'INSERT INTO mainQueryDate(id, date) VALUES($1,$2) ON CONFLICT DO NOTHING',
    [queryId, date.toString()],
  ).then(() => {
    console.log('Date Added');
  });
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
    }, '${game.thumb_url}', E'${game.name.replace(/'/g, "\\'")}')`;
  });

  const query1 = `INSERT INTO "games" (id, categories, mechanics, max_players, min_players, max_playtime, min_playtime, year_published, average_user_rating, thumb_url, name) VALUES ${games} ON CONFLICT DO NOTHING RETURNING *`;
  try {
    const res = await client.query(query1);
    return res.rows;
  } catch (e) {
    console.log('ERROR IN addGamesToDataBase', e);
  } finally {
    client.release();
  }
};

const addGamesToCategoryTable = async (games) => {
  const client = await pool.connect();
  const queryArray = [];
  games.forEach((game) => {
    game.categories.forEach((cat) =>
      queryArray.push(`('${game.id}', '${cat.id}')`),
    );
    game.mechanics.forEach((mech) =>
      queryArray.push(`('${game.id}', '${mech.id}')`),
    );
  });

  const query = `INSERT INTO games_categories (game_id, category) VALUES ${queryArray} ON CONFLICT DO NOTHING`;
  console.log(query);
  try {
    res = await client.query(query);
  } catch (e) {
    console.log('ERROR IN addGamesToCategoryTable', e);
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
  addGamesToCategoryTable,
};
