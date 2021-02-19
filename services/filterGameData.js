const _ = require('lodash');

const filterDataWithQueries = (data, queries) => {
  let gameData = _.clone(data);
  let entries = Object.entries(queries);
  entries.forEach((query) => {
    const [key, value] = query;
    if (value !== '') {
      if (key === 'mechanics' || key === 'categories') {
        gameData.games = mainTypeFilter(key, value, gameData.games);
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

  gameData.max_players = Math.max(
    ...gameData.games.map((game) => game.max_players),
  );
  gameData.min_players = Math.min(
    ...gameData.games.map((game) => game.min_players),
  );

  const filteredGames = gameData.games.slice(0, 30);
  gameData.games = filteredGames;
  return gameData;
};

const mainTypeFilter = (type, value, games) => {
  return games.filter((game) => {
    const ids = game[type].map((obj) => obj.id);
    return (
      [...value.split(',')].filter((value) => ids.includes(value)).length ===
      [...value.split(',')].length
    );
  });
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
    return ![...usedTerms.split(',')].includes(label);
  });
};

module.exports = {
  filterDataWithQueries,
};
