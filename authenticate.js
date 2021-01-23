//same level as app.js

const passport = require('passport');//middleware for algo strategies
const LocalStrategy = require('passport-local').Strategy;//constructor from passport local library
const User = require('./models/user');//already has access to passport local mongoose plugin
const JwtStrategy = require('passport-jwt').Strategy;//jwt strategy constructor from jwt library
const ExtractJwt = require('passport-jwt').ExtractJwt;//helper methods, extract from request object
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config.js');//file in folder

//add specific strategy plugin (local) to passport implementation. 
//                        new instance with verify callback function. checks if user exists, password matches in the locally stored info 
exports.local = passport.use(new LocalStrategy(User.authenticate()));//user.authenticate method from user schema plm plugin

//determines which data of the user object should be stored in session
passport.serializeUser(User.serializeUser());
//Corresponds to the key of the users object to retrieve the whole data object
passport.deserializeUser(User.deserializeUser());//error handler

//tokens - 3 part string(header, payload, signature)
/*export get token method - function that receives an object (user) 
that will contain an id for a user doc*/
exports.getToken = function(user) { 
    //and return token with..
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});//user objectId, key from config module, 1 hr expiration
};

//options used to configure the jwt strategy for passport
const opts = {}; //json object for jwt strategy options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//server requesting to be sent token as a bearer token in header
//req => req.cookies.cookiejwt; //method of extract object- specifies how to be extracted,
opts.secretOrKey = config.secretKey;//supply jwt strategy with key(config module) used to sign

//export strategy
exports.jwtPassport = 
passport.use(
    new JwtStrategy( //instance of jwt strategy as argument
        opts, //1st argument- object with config options
        //2nd argument -verified callback function 
        (jwt_payload, done) => { //object literal containing decoded jwt payload,
                                // done- passport error first callback- accepts (error, user, info)
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
            //searches users collection for user doc with matching id to id in jwt payload object
                if (err) {
                    //done callback is function written in passport-jwt module
                    return done(err, false);//no user found, sends error to done callback
                } else if (user) { 
                            // (no err, user doc) 
                    return done(null, user); //done callback will access and load info from user doc to request object
                } else {
                    return done(null, false);//(no err, no user found)
                }
            });
        }
    )
);



//export function to verify incoming request is from authenticated user
//creates a shortcut to use in other modules for authentication
exports.verifyUser = passport.authenticate('jwt', {session: false});//(jwt strategy, option to not use sessions)


/*export function to verify if user is an admin. Execute after verifyUser in routing
methods to access user property (req.user.admin) provided by passport in 
verifyUser req object*/
exports.verifyAdmin = function(req, res, next) {
    console.log(req.user);
    if (!req.user.admin) {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    } else {
        return next();
    };
};


exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);
