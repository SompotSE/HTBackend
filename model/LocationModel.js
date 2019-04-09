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
    Id_Admin: {
        type: String,
        required: true
    },
    lat: {
        type: String
    },
    lng: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
        collection: 'locations'
    });

module.exports = mongoose.model('locations', LocationSchema);