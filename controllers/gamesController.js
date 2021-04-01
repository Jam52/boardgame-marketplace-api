let db = require('../database/index');
let dayjs = require('dayjs');
let fetchDataInParallel = require('../services/fetchApiData')
  .fetchDataInParallel;

const fetchGames = async (query) => {
  //get the first "main" query key and value pair
  const mainQuery = Object.entries(query).filter((entry) => entry[1] !== '')[0];
  console.log(mainQuery);

  //check date the main query was last fetched will return [] if null
  const mainQueryId = mainQuery[1].split(',')[0];
  const mainQueryDate = await db.queryDate(mainQueryId);
  console.log('mainQueryDate', mainQueryDate);

  if (mainQueryDate.length === 0) {
    //if date is does not exist
    //then fetch games
    console.log('fetching games');
    const games = await fetchDataInParallel(mainQuery[0], mainQuery[1]);
    db.addDateToQuery(mainQueryId, dayjs().format('YYYY-MM-DD'));
    //then add them to the db category table once in game table
    const addGameToDb = await db.addGamesToDatabase(games);
    if (addGameToDb) {
      db.addGamesToCategoryTable(games);
    }
  }

  //return them from the db
  //   return await db.fetchGamesWithMainQuery(query);
  // } else {
  //   //if date is not old or empty return data from the db
  //   const games = await db.fetchGamesWithMainQuery(query);
  //   return games;
  // }
};

module.exports = {
  fetchGames,
};
