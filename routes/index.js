var express = require('express');
var router = express.Router();
var auths = require('../bin/authenticated');

/* GET home page. */
router.get('/', auths('ADMIN', 'VIEWER'), function (req, res, next) {
  res.render('index', { title: 'Temp Monitor' });
});

module.exports = router;
