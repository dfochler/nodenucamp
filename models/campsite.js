const mongoose = require('mongoose');//import middleware
const Schema = mongoose.Schema; //short-handing to Schema var


require('mongoose-currency').loadType(mongoose); //Defining schema type for currency
const Currency = mongoose.Types.Currency; //using currency middleware


const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


// Declaring new schema. * Blueprint of documents. Predefine fields of doc. 
const campsiteSchema = new Schema({
        //JSON object is a key/value pair
    name: {
        type: String,
        required: true, //Post request must contain a string for name
        unique: true  //Post request name string can't be same as name of another doc
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    //sub document. commentSchema is being stored as an array because of one-to-many 
    //relationship. Schema will contain many comments. 
    comments: [commentSchema] 
}, {
    timestamps: true //will automatically create or update timestamps.
                        //CreatedAt: and UpdatedAt: field
});

//assign schema to collection for creating new instances 
  //const campsite =  new Campsite({name: '', description: ''})
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;