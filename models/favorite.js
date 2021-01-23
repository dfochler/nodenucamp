const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//set structure for docs in users collection
const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,//stores a reference to a user doc id
        ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,//stores a reference to a campsite doc id
        ref: 'Campsite'
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Favorite', favoriteSchema); //collection will automatically be named favorite 