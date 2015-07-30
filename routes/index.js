var express = require('express');
var router = express.Router();
require('dotenv').load();
var db = require('monk')(process.env.MONGOLAB_URI);
var auctions = db.get('auctions');
var host = db.get('host');
var stripe = require("stripe")(process.env.STRIPE_TEST_SECRET);

/* GET home page. */
router.get('/', function(req, res, next) {
  auctions.find({}, function (err, docs) {
    if (err) res.render('error');
    host.find({}, function (err, doc) {
      if (err) res.render('error');
      res.render('db/auctions', {auctions: docs, host: doc, title: 'Current Auctions', id: req.session.id});
    });
  });
});

router.get('/login', function (req, res, next) {
  res.render('index');
});

router.get('/styleguide', function (req, res, next) {
  res.render('static/styleguide');
});

router.get('/reset', function (req, res, next) {
  auctions.remove({});
  res.redirect('/auctions');
});

router.get('/auctions', function(req, res, next) {
  auctions.find({}, function (err, docs) {
    if (err) res.render('error');
    host.find({}, function (err, doc) {
      if (err) res.render('error');
      res.render('db/auctions', {auctions: docs, host: doc, title: 'Current Auctions', id: req.session.id});
    });
  });
});

router.get('/addauction', function(req, res, next) {
  console.log(req.session.id);
  res.render('db/addauction', {title: 'Add an Auction', id: req.session.id});
});

router.post('/addauction', function(req, res, next) {
  var newAuction = req.body;
  auctions.insert(newAuction, function (err, doc) {
    if (err) res.render('error');
    res.redirect('/auctions');
  });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/auctions');
});

module.exports = router;
