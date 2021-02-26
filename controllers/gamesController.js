let db = require('../database/index');
let dayjs = require('dayjs');
let fetchDataInParallel = require('../services/fetchApiData')
  .fetchDataInParallel;

const fetchGames = async (query) => {
  //get the first "main" query key and value pair
  const mainQuery = Object.entries(query).filter((entry) => entry[1] !== '')[0];
  console.log(mainQuery);
  //check date the main query was last fetched will return [] if null
  const mainQueryDate = await db.queryDate(mainQuery[1].split(',')[0]);

  let isQueryDateOutdated = true;
  if (mainQueryDate.length !== 0) {
    isQueryDateOutdated = dayjs(mainQueryDate[0].date).isBefore(dayjs(), 'day');
  }
  if (isQueryDateOutdated) {
    console.log('Fetching from api');
    //if date is older than 1 day or not yet been fetched add date to mainQueryDate Table
    await db.addDateToQuery(mainQuery[1], dayjs().format('YYYY-MM-DD'));
    //then fetch games
    const games = await fetchDataInParallel(mainQuery[0], mainQuery[1]);

    //then add them to the db category table once in game table
    const addGameToDb = await db.addGamesToDatabase(games);
    if (addGameToDb) {
      db.addGamesToCategoryTable(games);
    }
    //return them from the db
    return await db.fetchGamesWithMainQuery(query);
  } else {
    //if date is not old or empty return data from the db
    const games = await db.fetchGamesWithMainQuery(query);
    return games;
  }
};

module.exports = {
  fetchGames,
};
