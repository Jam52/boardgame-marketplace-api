// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'boardgame-db',
      user: 'postgres',
      password: 'code52more!',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'boardgame_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
