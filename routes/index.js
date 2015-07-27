var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var auctions = db.get('auctions');
var stripe = require("stripe")(process.env.STRIPE_TEST_SECRET);

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
    // stripe.charges.create({
    //   amount: doc.currentbid,
    //   currency: 'usd',
    //   customer: req.session.id,
    //   }, function (err, charge) {
    //     if (err) {
    //       res.render('error');
    //     } else {
    //       res.render('thankyou');
    //     }
    //   }
    // );
  });
});

function stripeResponseHandler(status, response) {
  var form = req.body;

  if (response.error) {
    // Show the errors on the form
    res.redirect('/:id/buy', {errors: response.error});
  } else {
    // response contains id and card, which contains additional card details
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    
  }
}

router.post('/buy', function (req, res, next) {
  var form = req.body;
  Stripe.card.createToken(form, stripeResponseHandler);

});

router.get('/:id', function (req, res, next) {
  auctions.findOne({_id: req.params.id}, function (err, doc) {
    if (err) res.render('error');
    res.render('db/show', {auctions: doc});
  });
});

module.exports = router;
