const _ = require('lodash');

const filterDataWithQueries = (games, queries) => {
  let gameObj = {
    games: games,
    length: null,
    mechanics: [],
    categories: [],
    max_players: null,
    min_players: null,
  };
  let entries = Object.entries(queries);
  entries.forEach((query) => {
    const [key, value] = query;
    if (value !== '') {
      if (key === 'mechanics' || key === 'categories') {
        gameObj.games = mainTypeFilter(key, value, gameObj.games);
      }
      if (key === 'player_count') {
        gameObj.games = gameObj.games.filter((game) => {
          return game.min_players <= value && game.max_players >= value;
        });
      }
      if (key === 'play_time') {
        gameObj.games = gameObj.games.filter((game) => {
          return game.min_playtime <= value && game.max_playtime >= value;
        });
      }
      if (key === 'year_published') {
        gameObj.games = gameObj.games.filter((game) => {
          return game.year_published === value;
        });
      }
    }
  });

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

const mainTypeFilter = (type, values, games) => {
  const filteredGames = games.filter((game) => {
    const valuesFilteredByType = values.split(',').filter((value) => {
      return game[type].includes(value);
    });
    return valuesFilteredByType.length === values.split(',').length;
  });
  return filteredGames;
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
  filterDataWithQueries,
};
