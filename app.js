var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session")
var MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contactsRouter = require('./routes/contacts');
var loginRouter = require('./routes/login');
var settingsRouter = require('./routes/settings');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// Schemas
var User = require('./schemas/user');

function createApp(db) {
  var app = express();

  // Create login middleware
  passport.use(new LocalStrategy(
    function (username, password, done) {
      User.authenticate(username, password, done);
    }
  ));

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(logger('dev'));
  app.use(express.static("public"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: '[[@>$pS*N$5Q_~=7kS4!:Jc:5p28xu',
    name: '_HiDpo',
    rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 14400000
    },
    store: new MongoStore({
      mongooseConnection: db
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Global vars
  app.use(function (req, res, next) {

    res.locals.currentUser = req.user;
    res.locals.current_url = req.path;

    next();
  });

  // Routes
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/settings', settingsRouter);
  app.use('/contacts', contactsRouter);
  app.use(loginRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      if (err) {
        done(err);
      } else {
        var userBean = {
          roles: user.roles,
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        done(err, userBean);
      }
    });
  });

  return app;
}

module.exports = createApp;