let fetchData = require('./handleData.js').fetchData;
let filterData = require('./handleData.js').filterData;

var express = require('express');
var router = express.Router();
var data = require('./data.json');
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
    order_by: req.query.order_by,
    player_count: req.query.player_count,
    play_time: req.query.play_time,
    year_published: req.query.year_published,
  };

  if (queries.categories !== '') {
    const mainCategory = queries.categories.split(',')[0];
    if (cashedData[mainCategory] === undefined) {
      const data = await fetchData('categories', mainCategory);
      const dataObj = {
        games: data,
        length: data.length,
      };
      cashedData[mainCategory] = dataObj;
      res.send(filterData(dataObj));
    } else {
      res.send(filterData(cashedData[mainCategory]));
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
