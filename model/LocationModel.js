const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    Name_Lo: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'locations'
});

module.exports = mongoose.model('locations', LocationSchema);