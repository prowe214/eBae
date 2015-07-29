var express = require('express');
var router = express.Router();
require('dotenv').load();
var db = require('monk')(process.env.MONGOLAB_URI);
var auctions = db.get('auctions');
var host = db.get('host');
var stripe = require("stripe")(process.env.STRIPE_TEST_SECRET);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/styleguide', function (req, res, next) {
  res.render('static/styleguide');
});

router.get('/admin', function (req, res, next) {
  res.render('db/admin');
});

router.post('/admin', function (req, res, next) {
  var edits = req.body;
  // host.insert(edits, function (err, doc) {
  //   if (err) {
  //     res.render('error');
  //   } else {
  //   res.redirect('/auctions');
  //   }
  // });
  host.update({current:'true'}, {
    'name': edits.name,
    'website': edits.website,
    'description': edits.description,
    'image': edits.image,
    'current': 'true'
  });
  res.redirect('/auctions');
});

router.get('/auctions', function(req, res, next) {
  auctions.find({}, function (err, docs) {
    if (err) res.render('error');
    host.find({}, function (err, doc) {
      if (err) res.render('error');
      res.render('db/auctions', {auctions: docs, host: doc, title: 'Current Auctions', id: req.session.id});
    })
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
  req.session = null;
  res.redirect('/');
});

router.get('/:id/buy', function (req, res, next) {
  auctions.findOne({_id: req.params.id}, function (err, doc) {
    if (err) res.render('error');
    res.render('stripe/buy', {auctions: doc});
  });
});

router.post('/buy', function (req, res, next) {
  res.redirect('/auctions', {thankyou: true});
});

router.get('/:id', function (req, res, next) {
  auctions.findOne({_id: req.params.id}, function (err, doc) {
    if (err) res.render('error');
    res.render('db/show', {auctions: doc});
  });
});

module.exports = router;
