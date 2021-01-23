//---Importing middleware----------------------------
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser')
var logger = require('morgan');
const passport = require('passport');
const config = require('./config'); //file made in folder


//----Import routers from working directory-------------
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var campsiteRouter = require('./routes/campsiteRouter');
var promotionRouter = require('./routes/promotionRouter');
var partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');

//-----Using express middleware framework-----
var app = express();

//---Structure for DB and querying the DB, all http verb requests
const mongoose = require('mongoose');

//----Database----
const url = config.mongoUrl;//set up in config file
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);


/* redirect traffic from http to https*/
app.all('*', (req, res, next) => { //*wildcard for every path
  if (req.secure) { //checks for property given when already https
    return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
      //301-permanent redirect.
  }
});

// view engine setup/static files. This is front-end client
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); //using cookie with session can cause errors


//tell express to use passport
app.use(passport.initialize());


app.use('/', indexRouter); //placing before auth middleware allows unregister/not logged in user to access
app.use('/users', usersRouter);


app.use(express.static(path.join(__dirname, 'public')));


//---URLs starting endpoints
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
