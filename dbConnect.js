const mongoose = require('mongoose');
require('dotenv').config();

async function dbConnect() {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Successfully conntected to MongoDB Atlas');
    }).catch(err => {
        console.log('Unable to connect to MongoDB Atlas')
        console.error(err);
    });
}

module.exports = dbConnect;
