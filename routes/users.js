const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* Verify an admin user to allow retrieval of users listing at /users endpoint */
router
.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find() //find all user docs
    .then(users => { // and send them in response
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    })
    .catch(err => next(err));
})

//allow anyone to access /users/signup endpoint
router.post('/signup', cors.corsWithOptions, (req, res) => { 
  User.register(  //call as static method on user model-passport local mongoose
      new User({username: req.body.username}), //1st argument
      req.body.password, //2nd argument
      (err, user) => { //3rd argument- doesn't return a promise so use callback
          if (err) {
              res.statusCode = 500; //internal server error
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err}); //info about err from this property on the err object
          } else { //add names to user doc, if sent
            if (req.body.firstname) {
              user.firstname = req.body.firstname;
              }
              if (req.body.lastname) {
                  user.lastname = req.body.lastname;
              }
              user.save(err => {//save to database
                  if (err) {
                      res.statusCode = 500;
                      res.setHeader('Content-Type', 'application/json');
                      res.json({err: err});//err prop of err object
                      return;
                  }
                  //authenticate method calls function. set here as the second param
                  passport.authenticate('local')(req, res, () => { 
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.json({success: true, status: 'Registration Successful!'});
                  });
              });
          }
      }
  );
});

//enable passport authentication on this route. handles logging in user(challenging and parsing credentials) and errors
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  //only need to handle response if successful
  //issue token to user with method from auth module, pass object containing payload
  const token = authenticate.getToken({_id: req.user._id}); //then add token prop to response object for client
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.cookie("cookiejwt", token, {httpOnly: true, secure: true}); //send cookie with jwt to client
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
}); //token will now be in header of subsequent request from client

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
    res.clearCookie('cookiejwt');
    res.redirect('/');
  });
  
  module.exports = router;


/* authenticating with sessions or cookies
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
    res.clearCookie('cookiejwt');
    res.redirect('/')
    /*if (req.session) { //if session exists
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});*/





