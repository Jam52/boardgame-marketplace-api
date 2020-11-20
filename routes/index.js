var express = require('express');
var router = express.Router();
var data = require('./data.json');
const axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', async (req, res) => {
  const {
    categories,
    mechanics,
    order_by,
    player_count,
    play_time,
    year_published,
  } = req.query;

  const queryString = `https://api.boardgameatlas.com/api/search?categories=${categories}&limit=30&order_by=${order_by}&mechanics=${mechanics}&max_players=${player_count}&min_playtime=${play_time}&client_id=tvggk76LrE`;

  try {
    const responseData = await axios.get(queryString);
    res.send(responseData.data);
  } catch (error) {
    res.send(error);
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
