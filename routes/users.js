var express = require('express');
var router = express.Router();
require('dotenv').load();
var db = require('monk')(process.env.MONGOLAB_URI);
var auctions = db.get('auctions');
var host = db.get('host');
var stripe = require("stripe")(process.env.STRIPE_TEST_SECRET);

router.get('/:id', function (req, res, next) {
  auctions.findOne({_id: req.params.id}, function (err, doc) {
    if (err) res.render('error');
    res.render('db/show', {auctions: doc});
  });
});


module.exports = router;
