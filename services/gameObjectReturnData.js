const { add } = require('lodash');
const _ = require('lodash');

const buildReturnObjData = (games, queries) => {
  //set up game data obj
  let gameObj = {
    games: games,
    length: null,
    mechanics: [],
    categories: [],
    max_players: 1000,
    min_players: 0,
    min_playtime: 0,
    max_playtime: 1000,
  };

  //add mechanic lables
  gameObj.mechanics = returnRemainingLabels(
    'mechanics',
    queries.mechanics,
    gameObj.games,
  );

  //add category labels
  gameObj.categories = returnRemainingLabels(
    'categories',
    queries.categories,
    gameObj.games,
  );

  //add min/max data to game obj
  const minMaxArr = [
    'max_players',
    'min_players',
    'max_playtime',
    'min_playtime',
  ];
  minMaxArr.forEach((label) => {
    gameObj[label] = Math[label.split('_')[0]](
      ...gameObj.games.map((game) => game[label]),
    );
  });

  //add num of games to game obj
  gameObj.length = gameObj.games.length;

  let skipStart = Number(queries.skipValue);
  let skipEnd = Number(skipStart) + 30;
  const filteredGames = gameObj.games.slice(skipStart, skipEnd);
  gameObj.games = filteredGames;
  return gameObj;
};

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
