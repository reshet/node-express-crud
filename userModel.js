const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: [true, 'User with this email already exists']
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        unique: false,
        select: false
    }
});

module.exports = mongoose.model.Users || mongoose.model('Users', UserSchema);