var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var auctions = db.get('auctions');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/auctions', function(req, res, next) {
  auctions.find({}, function (err, docs) {
    if (err) res.render('error');
    res.render('db/auctions', {auctions: docs, title: 'Current Auctions', id: req.session.id});
  });
});

router.get('/addauction', function(req, res, next) {
  res.render('db/addauction');
});

router.post('/addauction', function(req, res, next) {
  var newAuction = req.body;
  auctions.insert(newAuction, function (err, doc) {
    if (err) res.render('error');
    res.redirect('/auctions');
  });
});

router.get('/:id', function (req, res, next) {
  auctions.findOne({_id: req.params.id}, function (err, doc) {
    if (err) res.render('error');
    res.render('db/show', {auctions: doc});
  });
});

module.exports = router;
