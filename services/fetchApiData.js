const axios = require('axios');

const fetchWithSearchQueries = async (type, query, skipValue) => {
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

const fetchDataInParallel = async (type, query) => {
  let returnGameData = [];
  let gamesReturned = 300;
  let skipValue = 0;

  for (let i = 0; i < 3; i++) {
    if (gamesReturned < 300) {
      break;
    } else {
      let batchGameData = [];
      for (let i = 0; i < 3; i++) {
        batchGameData.push(
          fetchWithSearchQueries(type, query, 100 * i + skipValue),
        );
      }

      await Promise.all(batchGameData).then((allGameData) => {
        skipValue += 300;
        let finisehdBatchData = [];
        allGameData.forEach((dataSet) => {
          if (dataSet.length > 0) {
            finisehdBatchData = finisehdBatchData.concat(dataSet);
          }
        });

        gamesReturned = finisehdBatchData.length;
        console.log('GamesFetched:', gamesReturned);
        returnGameData = returnGameData.concat(finisehdBatchData);
      });
    }
  }
  console.log('Total games returned:', returnGameData.length);
  return returnGameData;
};

module.exports = {
  fetchDataInParallel,
};
