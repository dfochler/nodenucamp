//---Importing middleware----------------------------
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require('passport');
const config = require('./config'); //file made in folder


//----Import routers from working directory-------------
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var campsiteRouter = require('./routes/campsiteRouter');
var promotionRouter = require('./routes/promotionRouter');
var partnerRouter = require('./routes/partnerRouter');

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



// view engine setup/static files. This is front-end client
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('1234-5654-7654')); using cookie with session can cause errors


//tell express to use passport
app.use(passport.initialize());


app.use('/', indexRouter); //placing before auth middleware allows unregister/not logged in user to access
app.use('/users', usersRouter);


app.use(express.static(path.join(__dirname, 'public')));


//---URLs starting endpoints
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

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
