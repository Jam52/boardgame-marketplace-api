const axios = require('axios');

const fetchData = async (type, query) => {
  console.log('[fetchData]');
  let returnGameData = [];

  async function requestData(currentSkip) {
    const queryString = `https://api.boardgameatlas.com/api/search?${type}=${query}&limit=100&skip=${currentSkip}&client_id=tvggk76LrE`;
    let nextSkip = currentSkip + 100;
    let gameData;
    try {
      const responseData = await axios.get(queryString);
      gameData = await responseData.data.games;
      returnGameData = returnGameData.concat(await gameData);
    } catch (error) {
      console.log(error);
    }
    if (gameData.length === 100) {
      requestData(nextSkip);
    }
  }
  await requestData(0);
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
