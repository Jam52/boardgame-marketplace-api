const buildSelectClausesFromQueries = require('../index')
  .buildSelectClausesFromQueries;

const mockQuery = {
  categories: 'hBqZ3Ar4RJ,MWoxgHrOJD',
  mechanics: '3te2oybNR4',
  player_count: '3',
  play_time: '15',
  year_published: '2020',
};

const selectListString =
  'SELECT games.id, games.categories, games.mechanics, games.max_players, games.min_players, games.max_playtime, games.min_playtime, games.year_published, games.average_user_rating, games.thumb_url, games.name, games.category FROM games JOIN games_categories ON games.id = games_categories.game_id';

const expectedResultsArr = [
  `${selectListString} WHERE games_categories.category = 'hBqZ3Ar4RJ'`,
  `INTERSECT ${selectListString} WHERE games_categories.category = 'MWoxgHrOJD'`,
  `INTERSECT ${selectListString} WHERE games_categories.category = '3te2oybNR4'`,
  `INTERSECT ${selectListString} WHERE games.min_players >= 3`,
  `INTERSECT ${selectListString} WHERE games.max_players <= 3`,
  `INTERSECT ${selectListString} WHERE games.min_playtime >= 15`,
  `INTERSECT ${selectListString} WHERE games.max_playtime <= 15`,
  `INTERSECT ${selectListString} WHERE games.year_published = 2020`,
];

describe('database helper function', () => {
  test('buildWhereClauseFromQueries returns an array with length equal to queries', () => {
    expect(buildSelectClausesFromQueries(mockQuery)).toHaveLength(8);
  });

  test('buildWhereClauseFromQueries return expected retults array when query list is full', () => {
    expect(buildSelectClausesFromQueries(mockQuery)).toEqual(
      expectedResultsArr,
    );
  });

  test('buildWhereClauseFromQueries return expected retults array when query list is not full', () => {
    const mockQuery = {
      categories: 'hBqZ3Ar4RJ,MWoxgHrOJD',
      mechanics: '',
      player_count: '',
      play_time: '',
      year_published: '',
    };

    expect(buildSelectClausesFromQueries(mockQuery)).toEqual([
      `${selectListString} WHERE games_categories.category = 'hBqZ3Ar4RJ'`,
      `INTERSECT ${selectListString} WHERE games_categories.category = 'MWoxgHrOJD'`,
    ]);
  });
});
