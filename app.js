//---Importing middleware----------------------------
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);//first class function- 2nd function return value called immediately

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
const url = 'mongodb://localhost:27017/nucampsite';
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

//setting middleware
app.use(session({
  name: 'session-id',
  secret: '1234-5654-7654',
  saveUninitialized: false,//won't save sessions without updates
  resave: false,// keep session marked as active 
  store: new FileStore() // object to save info on servers hard disk
}));

app.use('/', indexRouter); //placing before allows unregister/not logged in user to access
app.use('/users', usersRouter);

//authentication before next middleware 
function auth(req, res, next) {
  console.log(req.session);
  
  if (!req.session.user) { //generating cookie for use in session will be handled by middleware
          const err = new Error('You are not authenticated!');
          err.status = 401;
          return next(err);
    } else {
        if (req.session.user === 'authenticated') { // set in user router when logging in
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);

//first of middleware functions sending back to client -- authenticate prior
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
