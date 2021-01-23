const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

//multer has default values for configs to handle file uploads if these are left out
//customize multer methods
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //cb=callback
        cb(null, 'public/images'); //no error, path to save file to
    },
    filename: (req, file, cb) => { 
        cb(null, file.originalname) // name file on server same as name on client side instead of random number string
    }
});

const imageFileFilter = (req, file, cb) => {
    //regex ex to filter file types allowed for upload
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false); //false tells multer to reject
    }
    cb(null, true); //no error, accept file
};

//call multer function with custom config options to allow uploads
const upload = multer({ storage: storage, fileFilter: imageFileFilter});


const uploadRouter = express.Router();
const cors = require('./cors');

//config router to handle requests
uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
//add multer middleware with upload const created. expecting single upload of a file with input fields name of imageFile
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;
