var express = require('express');
var path = require('path');
require('dotenv').load();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var db = require('monk')(process.env.MONGOLAB_URI);
var profiles = db.get('users');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var passport = require('passport');

var FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var protect = require('./routes/protected');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('trust proxy', 1);
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  secret: process.env.FACEBOOK_APP_SECRET
}));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.session());

var protectRoute = function (req, res, next) {
  if (req.cookies.session) {
    next();
  } else {
    res.redirect('/login');
  }
};

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.HOST + "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos'],
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    profiles.findOne({ id: profile.id }, function (err, doc, next) {
      if (doc) {
        return done(err, doc);
      } else {
        profiles.insert(profile);
        return done(err, profile);
      }
    },
    function (err, user) {
      return done(err, user);
    });
  }
));

app.get('/auth/facebook', passport.authenticate('facebook', function (req, res) {}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/auctions'}),
  function (req, res) {
    console.log('REQ = ', req.body);
    console.log('RES = ', res);
    res.redirect('/auctions');
  }
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use('/', routes);
app.use('/', protectRoute, protect); //ADD BACK protectRoute MIDDLEWARE BEFORE DEPLOY
app.use('/', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
