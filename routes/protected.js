var express = require('express');
var router = express.Router();
require('dotenv').load();
var db = require('monk')(process.env.MONGOLAB_URI);
var auctions = db.get('auctions');
var host = db.get('host');
var stripe = require("stripe")(process.env.STRIPE_TEST_SECRET);

router.get('/admin', function (req, res, next) {
  res.render('db/admin');
});

router.post('/admin', function (req, res, next) {
  var edits = req.body;
  host.update({current:'true'}, {
    'name': edits.name,
    'website': edits.website,
    'description': edits.description,
    'image': edits.image,
    'current': 'true'
  });
  res.redirect('/auctions');
});

router.get('/reset', function (req, res, next) {
  auctions.remove({});
  res.redirect('/auctions');
});

router.post('/buy', function (req, res, next) {
  res.redirect('/auctions');
});

router.get('/:id/buy', function (req, res, next) {
  auctions.findOne({_id: req.params.id}, function (err, doc) {
    if (err) res.render('error');
    res.render('stripe/buy', {auctions: doc});
  });
});

module.exports = router;
