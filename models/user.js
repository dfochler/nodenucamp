const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');//handles username and password fields, hashing, and salting
const Schema = mongoose.Schema;

//set structure for docs in users collection
const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);//also provides additional authentication methods 

module.exports = mongoose.model('User', userSchema); //collection will automatically be named user 