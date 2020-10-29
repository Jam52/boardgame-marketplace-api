var express = require('express');
var router = express.Router();
var data = require('./data.json');
const axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', async (req,res) => {
  const category = req.query.category;
  let responseData;
  try {
    responseData = await axios.get(`https://api.boardgameatlas.com/api/search?categories=${category}&limit=30&order_by=average_user_rating&client_id=tvggk76LrE`)
  } catch (error) {
    res.send(error)
  }
  res.send(responseData.data)
})

router.get('/categories', async (req,res) => {
  let responseData;
  try {
    responseData = await axios.get('https://api.boardgameatlas.com/api/game/categories?pretty=true&client_id=tvggk76LrE')
  } catch (error) {
    res.send(error)
  }
  res.send(responseData.data)
})


module.exports = router;
