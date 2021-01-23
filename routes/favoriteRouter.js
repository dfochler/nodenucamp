const express = require('express');
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router(); 

favoriteRouter.route('/') 
//Mongoose methods will always return a promise *daisy chain then catch methods
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))//preflight request. http options method
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {//.get is read only, doesn't change serverside=doesn't need verify
    
   //Query DB and return documents as objects 
    Favorite.find()
    .populate('user')
    .populate('campsites')   
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);//closes after data sent to client in response stream
    })
    .catch(err => next(err));//passes err to built in express handling
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne()
    .then(favorite => {
            if (favorite)  {
                req.body.forEach( campsite => {
                    if (!favorite.campsites.includes(campsite._id)){
                        favorite.campsites.push(campsite);
                    }})
                    favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            } else if (!favorite) {
                    Favorite.create({
                        user: req.user,
                        campsites: req.body
                    })
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                    })
                .catch(err => next(err));
            }  
    })
    .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOneAndDelete()
    .then(favorite => {
            if (favorite)  {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
});


favoriteRouter.route('/:campsiteId') //URL parameter
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne()
    .then(favorite => {
        
        if (favorite && !favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else if (favorite && favorite.campsites.includes(req.params.campsiteId)) {
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is already a favorite!')
        } else if (!favorite){
            Favorite.create({
                user: req.user,
                campsites: req.body
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
                })
                .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
    


.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOne()
    .then(favorite => {
            if (favorite)  {
                let i = favorite.campsites.indexOf(req.params.campsiteId);
                favorite.campsites.splice(i,1);
                favorite.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;