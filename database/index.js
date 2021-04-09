require('dotenv').config();
const { PG_HOST, PG_USER, PG_PASS, PG_DB, PG_PORT } = process.env;

const connectionString = `postgresql://postgres:${process.env.PGPASSWORD}@localhost:5432/boardgame-db`;

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASS,
    database: PG_DB,
    port: PG_PORT || 5432,
  },
});

//
const queryDate = async (queryId) => {
  try {
    const date = await knex('mainquerydate')
      .select('date')
      .where('id', '=', queryId);
    return date;
  } catch (e) {
    console.log(e);
  }
  return null;
};

const addDateToQuery = async (queryId, date) => {
  console.log('adding date to table');
  console.log(queryId);
  try {
    knex('mainquerydate')
      .insert({ id: queryId, date: date.toString() })
      .then(function (res) {
        return { success: true, message: 'ok' }; // respond back to request
      });
  } catch (e) {
    console.log(e);
  }
};

const addGamesToDatabase = async (games) => {
  console.log('adding game to db');
  const gameData = games.map((game) => {
    return {
      id: game.id,
      categories: game.categories.map((category) => category.id),
      mechanics: game.mechanics.map((mechanics) => mechanics.id),
      max_players: game.max_players,
      min_players: game.min_players,
      max_playtime: game.max_playtime,
      min_playtime: game.min_playtime,
      year_published: game.year_published,
      average_user_rating: game.average_user_rating,
      thumb_url: game.thumb_url,
      name: game.name,
    };
  });

  try {
    const games = await knex('games').insert(gameData);
    return games;
  } catch (e) {
    console.log(e);
  }
};

const addGamesToCategoryTable = async (games) => {
  console.log('Adding games to category table');

  const queryArray = [];
  games.forEach((game) => {
    game.categories.forEach((cat) =>
      queryArray.push({
        game_id: game.id,
        category: cat.id,
        game_name: game.name,
      }),
    );
    game.mechanics.forEach((mech) =>
      queryArray.push({
        game_id: game.id,
        category: mech.id,
        game_name: game.name,
      }),
    );
  });

  console.log(queryArray);
  try {
    const insert = await knex('games_categories').insert(queryArray);
    console.log(insert).catch((e) => {
      return e;
    });
  } catch (e) {
    console.log(e);
  }
};

const fetchGamesWithMainQuery = async (query) => {
  console.log('Fetching from Database');
  let allQuerys = [];

  if (query.categories) {
    allQuerys = allQuerys.concat(query.categories.split(','));
  }
  if (query.mechanics) {
    allQuerys = allQuerys.concat(query.mechanics.split(','));
  }
  try {
    const gameData = await knex('games')
      .select('*')
      .where((builder) => {
        builder.whereIn(
          'id',
          knex('games_categories')
            .select('game_id')
            .whereIn('category', allQuerys)
            .groupBy('game_id')
            .havingRaw('COUNT(category) = ?', allQuerys.length),
        );
        if (query.player_count) {
          builder.andWhere('max_players', '>=', query.player_count);
          builder.andWhere('min_players', '<=', query.player_count);
        }
        if (query.play_time) {
          builder.andWhere('max_playtime', '>=', query.play_time);
          builder.andWhere('min_playtime', '<=', query.play_time);
        }
        if (query.year_published) {
          builder.andWhere('year_published,', query.year_published);
        }
      });

    return gameData;
  } catch (e) {
    console.log(e);
  }
};

// const buildSelectClausesFromQueries = (query) => {
//   const selectListString =
//     'SELECT games.id, games.categories, games.mechanics, games.max_players, games.min_players, games.max_playtime, games.min_playtime, games.year_published, games.average_user_rating, games.thumb_url, games.name, games.category FROM games JOIN games_categories ON games.id = games_categories.game_id';

//   //queries as key value pairs, filter empty querys
//   const queryEntries = Object.entries(query).filter((entry) => entry[1] !== '');

//   let selectClauseArr = [];
//   let sufix = '';
//   let orderBy = 'average_user_rating';
//   let asc = 'DESC';

//   // for each entry build a SELECT / INTERECT clause
//   for (const [key, value] of queryEntries) {
//     if (key === 'categories' || key === 'mechanics') {
//       const valueArr = value.split(',');
//       valueArr.forEach((value) => {
//         selectClauseArr.push(
//           `${sufix}${selectListString} WHERE games_categories.category = '${value}'`,
//         );
//         sufix = 'INTERSECT ';
//       });
//     } else if (key === 'play_time') {
//       selectClauseArr.push(
//         `${sufix}${selectListString} WHERE games.min_playtime <= ${value}`,
//       );
//       selectClauseArr.push(
//         `INTERSECT ${selectListString} WHERE games.max_playtime >= ${value}`,
//       );
//       sufix = 'INTERSECT ';
//     } else if (key === 'player_count') {
//       selectClauseArr.push(
//         `${sufix}${selectListString} WHERE games.min_players <= ${value}`,
//       );
//       selectClauseArr.push(
//         `INTERSECT ${selectListString} WHERE games.max_players >= ${value}`,
//       );
//       sufix = 'INTERSECT ';
//     } else if (key === 'order_by') {
//       orderBy = value;
//     } else if (key === 'asc') {
//       asc = value === 'true' ? 'ASC' : 'DESC';
//     } else if (key === 'year_published') {
//       selectClauseArr.push(
//         `${sufix}${selectListString} WHERE games.year_published = ${value}`,
//       );
//       sufix = 'INTERSECT ';
//     }
//   }
//   selectClauseArr.push(`ORDER BY ${orderBy} ${asc}`);

//   return selectClauseArr;
// };

module.exports = {
  queryDate,
  addGamesToDatabase,
  addDateToQuery,
  fetchGamesWithMainQuery,
  addGamesToCategoryTable,
};
