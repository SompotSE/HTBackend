const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    User_g: {
        type: String,
        // required: true
    },
    Password: {
        type: String,
        // required: true
    },
    Fname: {
        type: String,
        // required: true
    },
    Lname: {
        type: String,
        // required: true
    },
    Address: {
        type: String,
        // required: true
    },
    Phonenumber: {
        type: String,
        // required: true
    },
    Positions: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'users'
});

module.exports = mongoose.model('users', UserSchema);