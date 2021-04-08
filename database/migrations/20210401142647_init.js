const { default: knex } = require('knex');

exports.up = function (knex) {
  return createMultipleTables(knex)([
    {
      name: 'games',
      schema(gamesTable) {
        gamesTable.string('id').primary();
        gamesTable.specificType('categories', 'text ARRAY');
        gamesTable.specificType('mechanics', 'text ARRAY');
        gamesTable.integer('max_players');
        gamesTable.integer('min_players');
        gamesTable.integer('max_playtime');
        gamesTable.integer('min_playtime');
        gamesTable.integer('year_published');
        gamesTable.string('thumb_url');
        gamesTable.float('average_user_rating');
        gamesTable.string('name');
        gamesTable.timestamps(true, true);
      },
    },
    {
      name: 'games_categories',
      schema(gamesCategoriesTable) {
        gamesCategoriesTable
          .string('game_id')
          .references('id')
          .inTable('games');
        gamesCategoriesTable.string('game_name');
        gamesCategoriesTable.string('category');
        gamesCategoriesTable.primary(['game_id', 'category']);
        gamesCategoriesTable.unique(['game_id', 'category']);
        gamesCategoriesTable.timestamps(true, true);
      },
    },
    {
      name: 'mainquerydate',
      schema(dateTable) {
        dateTable.string('id').primary();
        dateTable.date('date');
        dateTable.timestamps(true, true);
      },
    },
  ]);
};

const createMultipleTables = (knex) => (tables) => {
  const createTables = tables.map(({ name, schema }) => {
    return knex.schema.createTable(name, schema);
  });

  return Promise.all(createTables).catch((e) => {
    const dropTable = tables.map(({ name }) => {
      return knex.schema.dropTableIfExists(name);
    });
    return Promise.all(dropTable).then(() => Promise.reject(e));
  });
};

exports.down = function (knex) {
  return knex.scheme.dropTable('person');
};
