var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'MGA  Compliance Portal - Random Systems International', header: 'Dashboard' });
});

module.exports = router;
