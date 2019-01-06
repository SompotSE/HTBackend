const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BuildingSchema = new Schema({
    Name_Build: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'building'
});

module.exports = mongoose.model('building', BuildingSchema);