const _ = require('lodash');

const buildReturnObjData = (games, queries) => {
  let gameObj = {
    games: games,
    length: null,
    mechanics: [],
    categories: [],
    max_players: null,
    min_players: null,
  };

  gameObj.mechanics = returnRemainingLabels(
    'mechanics',
    queries.mechanics,
    gameObj.games,
  );

  gameObj.categories = returnRemainingLabels(
    'categories',
    queries.categories,
    gameObj.games,
  );

  gameObj.max_players = Math.max(
    ...gameObj.games.map((game) => game.max_players),
  );
  gameObj.min_players = Math.min(
    ...gameObj.games.map((game) => game.min_players),
  );
  gameObj.length = gameObj.games.length;
  const filteredGames = gameObj.games.slice(0, 30);
  gameObj.games = filteredGames;
  return gameObj;
};

// const mainTypeFilter = (key, values, games) => {
//   const filteredGames = games.filter((game) => {
//     return values
//       .split(',')
//       .every((value) => JSON.stringify(game[key]).includes(value));
//   });
//   return filteredGames;
// };

const returnRemainingLabels = (label, usedTerms, gameData) => {
  return [
    ...new Set(
      [
        ...gameData.map((game) => {
          return game[label].map((item) => item);
        }),
      ].reduce((arr, total) => total.concat(arr), []),
    ),
  ].filter((label) => {
    return ![...usedTerms.split(',')].includes(label);
  });
};

module.exports = {
  buildReturnObjData,
};
