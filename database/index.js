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

  try {
    res = await client.query(query);
  } catch (e) {
    console.log(e);
  }
};

const fetchGamesWithMainQuery = async (query) => {
  const client = await pool.connect();

  const query1 = buildSelectClausesFromQueries(query);

  try {
    const res = await client.query(query1.join(' '));

    return res.rows;
  } catch (e) {
    console.log(e);
  } finally {
    client.release();
  }
};

const buildSelectClausesFromQueries = (query) => {
  const selectListString =
    'SELECT games.id, games.categories, games.mechanics, games.max_players, games.min_players, games.max_playtime, games.min_playtime, games.year_published, games.average_user_rating, games.thumb_url, games.name, games.category FROM games JOIN games_categories ON games.id = games_categories.game_id';

  //queries as key value pairs, filter empty querys
  const queryEntries = Object.entries(query).filter((entry) => entry[1] !== '');

  let selectClauseArr = [];
  let sufix = '';

  // for each entry build a SELECT / INTERECT clause
  for (const [key, value] of queryEntries) {
    if (key === 'categories' || key === 'mechanics') {
      const valueArr = value.split(',');
      valueArr.forEach((value) => {
        selectClauseArr.push(
          `${sufix}${selectListString} WHERE games_categories.category = '${value}'`,
        );
        sufix = 'INTERSECT ';
      });
    } else if (key === 'play_time') {
      selectClauseArr.push(
        `${sufix}${selectListString} WHERE games.min_playtime >= ${value}`,
      );
      selectClauseArr.push(
        `${sufix}${selectListString} WHERE games.max_playtime <= ${value}`,
      );
      sufix = 'INTERSECT ';
    } else if (key === 'player_count') {
      selectClauseArr.push(
        `${sufix}${selectListString} WHERE games.min_players >= ${value}`,
      );
      selectClauseArr.push(
        `${sufix}${selectListString} WHERE games.max_players <= ${value}`,
      );
      sufix = 'INTERSECT ';
    } else {
      selectClauseArr.push(
        `${sufix}${selectListString} WHERE games.${key} = ${value}`,
      );
      sufix = 'INTERSECT ';
    }
  }

  return selectClauseArr;
};

module.exports = {
  queryDate,
  addGamesToDatabase,
  addDateToQuery,
  fetchGamesWithMainQuery,
  addGamesToCategoryTable,
  buildSelectClausesFromQueries,
};
