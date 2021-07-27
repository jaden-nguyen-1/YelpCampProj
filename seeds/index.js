const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const getDescriptorOrPlace = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++){
        const getPrice = Math.floor(Math.random() * 50);
        const random1000 = Math.floor(Math.random() * 1000);
        const newCamp = new Campground({
            author: '60fe2e97c26e1bd070064549',
            title: `${getDescriptorOrPlace(descriptors)} ${getDescriptorOrPlace(places)}`,
            price: getPrice,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore nostrum repellendus optio ab quis reiciendis eum minus eaque eligendi. Commodi aut temporibus soluta quod sed voluptate in eum. Numquam, eaque?',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dvqsqjzb8/image/upload/v1627297165/YelpCamp/sik49gyxmxjnhmnywzi1.jpg',
                  filename: 'YelpCamp/sik49gyxmxjnhmnywzi1'
                },
                {
                  url: 'https://res.cloudinary.com/dvqsqjzb8/image/upload/v1627297165/YelpCamp/ex3ufi3kdnuph2l2xenw.jpg',
                  filename: 'YelpCamp/ex3ufi3kdnuph2l2xenw'
                }
              ]
        })
        await newCamp.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
});



