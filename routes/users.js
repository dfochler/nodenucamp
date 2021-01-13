const express = require('express');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => { 
  User.register(  //call as static method on user model
      new User({username: req.body.username}), //1st argument
      req.body.password, //2nd argument
      err => { //3rd argument
          if (err) {
              res.statusCode = 500; //internal server error
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err}); //info about err from this property on the err object
          } else {
              passport.authenticate('local')(req, res, () => { //authenticate method calls function
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'Registration Successful!'});
              });
          }
      }
  );
});

//enable passport authentication on this route. handles logging in user(challenging and parsing credentials) and errors
router.post('/login', passport.authenticate('local'), (req, res) => {
  //only need to handle response if successful
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});


router.post('/login', (req, res, next) => {
  if(!req.session.user) { // no session open - look for cookie
      const authHeader = req.headers.authorization;

      if (!authHeader) { // no cookie :(
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }
    
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];
    
      User.findOne({username: username}) //find doc with matching username
      .then(user => {
          if (!user) {
              const err = new Error(`User ${username} does not exist!`);
              err.status = 401;
              return next(err);
          } else if (user.password !== password) {
              const err = new Error('Your password is incorrect!');
              err.status = 401;
              return next(err);
          } else if (user.username === username && user.password === password) {
              req.session.user = 'authenticated'; // used in app.js auth function
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('You are authenticated!')
          }
      })
      .catch(err => next(err));
  } else { //session already being tracked for logged in client
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) { //if session exists
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

module.exports = router;
