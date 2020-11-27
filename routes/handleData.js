const axios = require('axios');

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

const filterData = (data) => {
  const filteredGames = data.games.slice(0, 30);
  data.games = filteredGames;
  return data;
};

module.exports = {
  fetchData: fetchData,
  filterData: filterData,
};
