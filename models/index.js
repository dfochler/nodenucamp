const mongoose = require('mongoose');
const Campsite = require('./models/campsite');
const Partner = require('./models/partner');
const Promotion = require('./models/promotion');


const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

connect.then(() => {

    console.log('Connected correctly to server');

    Campsite.create({
        name: 'React Lake Campground',
        description: 'test'
    })
    .then(campsite => {
        console.log(campsite);
        
        return Campsite.findByIdAndUpdate(campsite._id, {
            $set: { description: 'Updated Test Document' }
        }, {
            new: true
        });
    })
    .then(campsite => {
        console.log(campsite);

        campsite.comments.push({
            rating: 5,
            text: 'What a magnificent view!',
            author: 'Tinus Lorvaldes'
        });

        return campsite.save();
    })
    .then(campsite => {
        console.log(campsite);
        return Campsite.deleteMany();
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch(err => {
        console.log(err);
        mongoose.connection.close();
    });

});
    connect.then(() => {

    Partner.create(   {
        "name": "Mongo Fly Shop",
        "image": "images/mongo-logo.png",
        "featured": false,
        "description": "Need a new fishing pole, a tacklebox, or flies of all kinds? Stop by Mongo Fly Shop."
      })
    .then(partner => {
        console.log(partner);
        
        return Partner.findByIdAndUpdate(partner._id, {
            $set: { description: 'Updated Test Document' }
        }, {
            new: true
        });
    })
    .then(partner => {
        console.log(partner);
        return Partner.deleteMany();
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch(err => {
        console.log(err);
        mongoose.connection.close();
    });
});

    connect.then(() => {

    Promotion.create({
        "name": "Mountain Adventure",
        "image": "images/breadcrumb-trail.jpg",
        "featured": true,
        "cost": 1299,
        "description": "Book a 5-day mountain trek with a seasoned outdoor guide! Fly fishing equipment and lessons provided."
      })
    .then(promotion => {
        console.log(promotion);
        
        return Promotion.findByIdAndUpdate(promotion._id, {
            $set: { description: 'Updated Test Document' }
        }, {
            new: true
        });
    })
    .then(promotion => {
        console.log(promotion);
        return Promotion.deleteMany();
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch(err => {
        console.log(err);
        mongoose.connection.close();
    });
});
