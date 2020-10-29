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
    responseData = await axios.get(`https://api.boardgameatlas.com/api/search?client_id=tvggk76LrE&categories=${category}&limit=30&order_by=average_user_rating`)
  } catch (error) {
    console.log(error);
    responseData = error
    res.send(responseData)
  }
  res.send(responseData.data)
})


module.exports = router;
