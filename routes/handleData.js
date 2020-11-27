const axios = require('axios');
const _ = require('lodash');

const fetchData = async (type, query) => {
  console.log('[fetchData]');
  let returnGameData = [];
  let gamesReturned = 100;
  let skipValue = 0;

  for (let i = 0; i < 15; i++) {
    if (gamesReturned < 100) {
      break;
    } else {
      const queryString = `https://api.boardgameatlas.com/api/search?${type}=${query}&limit=100&skip=${skipValue}&client_id=tvggk76LrE`;
      skipValue += 100;
      let gameData;
      try {
        const responseData = await axios.get(queryString);
        gameData = await responseData.data.games;
        gamesReturned = gameData.length;
        returnGameData = returnGameData.concat(await gameData);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return returnGameData;
};

const filterData = (data, queries) => {
  let gameData = _.clone(data);
  console.log(queries);
  let entries = Object.entries(queries);
  entries.forEach((query) => {
    const [key, value] = query;
    if (value !== '') {
      console.log(value);
      if (key === 'mechanics') {
        gameData.games = gameData.games.filter((game) => {
          const ids = game.mechanics.map((obj) => obj.id);
          return String(ids).includes(value);
        });
      }
      if (key === 'categories') {
        gameData.games = gameData.games.filter((game) => {
          const ids = game.categories.map((obj) => obj.id);
          return String(ids).includes(value);
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
  const filteredGames = gameData.games.slice(0, 30);
  gameData.games = filteredGames;
  return gameData;
};

module.exports = {
  fetchData: fetchData,
  filterData: filterData,
};
