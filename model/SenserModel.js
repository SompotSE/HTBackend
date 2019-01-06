const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SenserSchema = new Schema({
    Position: {
        type: String,
        required: true
    },
    Macaddress: {
        type: String,
        required: true
    },
    Temp_Low: {
        type: Number,
        required: true
    },
    Temp_Hight: {
        type: Number,
        required: true
    },
    Humdi_Low: {
        type: Number,
        required: true
    },
    Humdi_Hight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'sensers'
});

module.exports = mongoose.model('sensers', SenserSchema);