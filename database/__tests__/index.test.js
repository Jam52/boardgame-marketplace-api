const buildWhereClauseFromQueries = require('../index')
  .buildWhereClauseFromQueries;

const mockQuery = {
  categories: 'hBqZ3Ar4RJ,MWoxgHrOJD',
  mechanics: '3te2oybNR4',
  player_count: '3',
  play_time: '15',
  year_published: '2020',
};

const expectedResults = [
  "WHERE games_categories.category = 'hBqZ3Ar4RJ'",
  "WHERE games_categories.category = 'MWoxgHrOJD'",
  "WHERE games_categories.category = '3te2oybNR4'",
  'WHERE games.min_players >= 3',
  'WHERE games.max_players <= 3',
  'WHERE games.min_playtime >= 15',
  'WHERE games.max_playtime <= 15',
  'WHERE games.year_published = 2020',
];

describe('database helper function', () => {
  test('buildWhereClauseFromQueries returns an array with length equal to queries', () => {
    expect(buildWhereClauseFromQueries(mockQuery)).toHaveLength(
      expectedResults.length,
    );
  });

  test('buildWhereClauseFromQueries return expected retults array', () => {
    expect(buildWhereClauseFromQueries(mockQuery)).toEqual(expectedResults);
  });
});
