const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DHTSchema = new Schema({
    t: {
        type: Number,
        required: true
    },
    h: {
        type: Number,
        required: true
    },
    mac: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
},{
    collection: 'dht'
});

module.exports = mongoose.model('dht', DHTSchema);