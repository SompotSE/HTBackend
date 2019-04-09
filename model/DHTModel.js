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
    pm1: {
        type: Number,
        required: true
    },
    pm2: {
        type: Number,
        required: true
    },
    pm4: {
        type: Number,
        required: true
    },
    pm10: {
        type: Number,
        required: true
    },
    nc0: {
        type: Number,
        required: true
    },
    nc1: {
        type: Number,
        required: true
    },
    nc2: {
        type: Number,
        required: true
    },
    nc4: {
        type: Number,
        required: true
    },
    nc10: {
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