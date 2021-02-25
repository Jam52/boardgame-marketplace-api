require('dotenv').config();
const { Pool } = require('pg');
const connectionString = `postgresql://postgres:${process.env.PGPASSWORD}@localhost:5432/boardgame-db`;

const pool = new Pool({
  connectionString,
});

const queryDate = async (queryId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT date FROM mainQueryDate WHERE id = '${queryId}'`,
    );
    return res.rows;
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
  }
};

const addDateToQuery = async (queryId, date) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO mainQueryDate(id, date) VALUES('${queryId}', '${date.toString()}') ON CONFLICT DO NOTHING`,
    );
  } catch (e) {
    console.log(e);
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
    }, '${game.thumb_url}', E'${game.name.replace(/'/g, "\\'")}')`;
  });

  const query1 = `INSERT INTO "games" (id, categories, mechanics, max_players, min_players, max_playtime, min_playtime, year_published, average_user_rating, thumb_url, name) VALUES ${games} ON CONFLICT DO NOTHING RETURNING *`;
  try {
    const res = await client.query(query1);
    return res.rows;
  } catch (e) {
    console.log(e);
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
    console.log(e);
  }
};

const fetchGamesWithMainQuery = async (query) => {
  const client = await pool.connect();
  const whereClauseArray = buildWhereClauseFromQueries(query);
  try {
    const res = await client.query(
      `SELECT * FROM games JOIN games_categories ON games.id = games_categories.game_id`,
    );
    return res.rows;
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
  }
};

const buildWhereClauseFromQueries = (query) => {
  //queries as key value pairs, filter empty querys
  const queryEntries = Object.entries(query).filter((entry) => entry[1] !== '');
  let whereClauses = [];

  for (const [key, value] of queryEntries) {
    if (key === 'categories' || key === 'mechanics') {
      const valueArr = value.split(',');
      valueArr.forEach((value) =>
        whereClauses.push(`WHERE games_categories.category = '${value}'`),
      );
    } else if (key === 'play_time') {
      whereClauses.push(`WHERE games.min_playtime >= ${value}`);
      whereClauses.push(`WHERE games.max_playtime <= ${value}`);
    } else if (key === 'player_count') {
      whereClauses.push(`WHERE games.min_players >= ${value}`);
      whereClauses.push(`WHERE games.max_players <= ${value}`);
    } else {
      whereClauses.push(`WHERE games.${key} = ${value}`);
    }
  }

  console.log(whereClauses);

  return whereClauses;
};

module.exports = {
  queryDate,
  addGamesToDatabase,
  addDateToQuery,
  fetchGamesWithMainQuery,
  addGamesToCategoryTable,
  buildWhereClauseFromQueries,
};
