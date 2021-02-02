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
    player_count: req.query.player_count,
    play_time: req.query.play_time,
    year_published: req.query.year_published,
  };

  const keyArry = Object.keys(queries);

  for (let i = 0; i < keyArry.length; i++) {
    if (queries[keyArry[i]] !== '') {
      const mainCategory = queries[keyArry[i]].split(',')[0];
      if (cashedData[mainCategory] === undefined) {
        console.log('Fetching');
        const data = await fetchData([keyArry[i]], mainCategory);
        const dataObj = {
          games: data,
          length: data.length,
          mechanics: [],
          categories: [],
        };
        cashedData[mainCategory] = dataObj;
        try {
          res.send(filterData(dataObj, queries));
        } catch (error) {
          console.log(error);
        }

        break;
      } else {
        console.log('returning from cash');
        try {
          res.send(filterData(cashedData[mainCategory], queries));
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
