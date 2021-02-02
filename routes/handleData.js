const axios = require('axios');
const _ = require('lodash');

const fetchData = async (type, query) => {
  let returnGameData = [];
  let gamesReturned = 300;
  let skipValue = 0;

  for (let i = 0; i < 6; i++) {
    if (gamesReturned < 300) {
      break;
    } else {
      let batchGameData = [];
      for (let i = 0; i < 3; i++) {
        batchGameData.push(loadData(type, query, 100 * i + skipValue));
      }
      skipValue += 300;
      await Promise.all(batchGameData).then((allGameData) => {
        let finisehdBatchData = [];
        allGameData.forEach((dataSet) => {
          finisehdBatchData = finisehdBatchData.concat(dataSet);
        });

        gamesReturned = finisehdBatchData.length;
        returnGameData = returnGameData.concat(finisehdBatchData);
      });
    }
  }
  return returnGameData;
};

const loadData = async (type, query, skipValue) => {
  const queryString = `https://api.boardgameatlas.com/api/search?${type}=${query}&limit=100&skip=${skipValue}&client_id=tvggk76LrE`;
  let gameData;
  try {
    const responseData = await axios.get(queryString);
    gameData = await responseData.data.games;
    return await gameData;
  } catch (error) {
    console.log(error);
  }
};

const filterData = (data, queries) => {
  let gameData = _.clone(data);
  let entries = Object.entries(queries);
  console.log(queries);
  entries.forEach((query) => {
    const [key, value] = query;
    if (value !== '') {
      console.log(value);
      if (key === 'mechanics') {
        gameData.games = gameData.games.filter((game) => {
          const ids = game.mechanics.map((obj) => obj.id);
          return (
            [...value.split(',')].filter((value) => ids.includes(value))
              .length === [...value.split(',')].length
          );
        });
      }
      if (key === 'categories') {
        gameData.games = gameData.games.filter((game) => {
          const ids = game.categories.map((obj) => obj.id);
          return (
            [...value.split(',')].filter((value) => ids.includes(value))
              .length === [...value.split(',')].length
          );
        });
      }
      if (key === 'player_count') {
        gameData.games = gameData.games.filter((game) => {
          return game.min_players <= value && game.max_players >= value;
        });
      }
      if (key === 'play_time') {
        gameData.games = gameData.games.filter((game) => {
          return game.min_playtime <= value && game.max_playtime >= value;
        });
      }
      if (key === 'year_published') {
        gameData.games = gameData.games.filter((game) => {
          return game.year_published === value;
        });
      }
    }
  });

  gameData.mechanics = returnRemainingLabels(
    'mechanics',
    queries.mechanics,
    gameData,
  );

  gameData.categories = returnRemainingLabels(
    'categories',
    queries.categories,
    gameData,
  );

  const filteredGames = gameData.games.slice(0, 30);
  gameData.games = filteredGames;
  return gameData;
};

const returnRemainingLabels = (label, usedTerms, gameData) => {
  return [
    ...new Set(
      [
        ...gameData.games.map((game) => {
          return game[label].map((item) => item.id);
        }),
      ].reduce((arr, total) => total.concat(arr), []),
    ),
  ].filter((label) => {
    console.log([...usedTerms.split(',')].includes(label), label);
    return ![...usedTerms.split(',')].includes(label);
  });
};

module.exports = {
  fetchData: fetchData,
  filterData: filterData,
};
