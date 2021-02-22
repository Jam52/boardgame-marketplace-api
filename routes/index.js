let fetchDataInParallel = require('../services/fetchApiData')
  .fetchDataInParallel;
let filterData = require('../services/filterData.js');
let db = require('../database/index');
let dayjs = require('dayjs');

var express = require('express');
var router = express.Router();
const axios = require('axios');

let cashedData = {};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', async (req, res) => {
  const queries = {
    categories: req.query.categories,
    mechanics: req.query.mechanics,
    player_count: req.query.player_count,
    play_time: req.query.play_time,
    year_published: req.query.year_published,
  };

  const keyArry = Object.keys(queries);

  for (let i = 0; i < keyArry.length; i++) {
    if (queries[keyArry[i]] !== '') {
      const mainCategory = queries[keyArry[i]].split(',')[0];
      const dateOfLastQueryCall = await db.queryDate(mainCategory);
      console.log(dateOfLastQueryCall);

      if (
        dateOfLastQueryCall.length === 0 ||
        dayjs(dateOfLastQueryCall.date).isBefore(dayjs(), 'day')
      ) {
        console.log('Fetching');
        const games = await fetchDataInParallel([keyArry[i]], mainCategory);
        db.addDateToQuery(mainCategory, dayjs().format('YYYY-MM-DD'));
        const returnedGamesFromBd = await db.addGamesToDatabase(games);
        const filteredGames = filterData.filterDataWithQueries(
          returnedGamesFromBd,
          queries,
        );

        try {
          res.send(filteredGames);
        } catch (error) {
          console.log(error);
        }

        break;
      } else {
        console.log('returning from cash');
        try {
          const cachesGames = await db.fetchGamesWithMainQuery(
            mainCategory,
            queries,
          );
          res.send(filterData.filterDataWithQueries(cachesGames, queries));
        } catch (error) {
          console.log(error);
        }

        break;
      }
    }
  }
});

router.get('/mechanics', async (req, res) => {
  try {
    const responseData = await axios.get(
      'https://api.boardgameatlas.com/api/game/mechanics?client_id=tvggk76LrE',
    );
    res.send(responseData.data);
  } catch (error) {
    res.send(error);
  }
});

router.get('/categories', async (req, res) => {
  try {
    const responseData = await axios.get(
      'https://api.boardgameatlas.com/api/game/categories?client_id=tvggk76LrE',
    );
    res.send(responseData.data);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
