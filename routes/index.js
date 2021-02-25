let filterData = require('../services/filterData.js');
let gamesController = require('../controllers/gamesController');

var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET game data based on queries passed */
router.get('/search', async (req, res) => {
  const queries = {
    categories: req.query.categories,
    mechanics: req.query.mechanics,
    player_count: req.query.player_count,
    play_time: req.query.play_time,
    year_published: req.query.year_published,
  };

  //fetch games from gamesController
  const games = await gamesController.fetchGames(queries);
  console.log(games.length);
  //filter games and send
  const addOverallQueryInfoToReturnData = filterData.buildReturnObjData(
    games,
    queries,
  );
  console.log(addOverallQueryInfoToReturnData.length);
  res.send(addOverallQueryInfoToReturnData);
});

/* GET list of mechanics */
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

/* GET list of categories */
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
