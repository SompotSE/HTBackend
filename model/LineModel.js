const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LineModel = new Schema({
    IdLine: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'line'
});

module.exports = mongoose.model('line', LineModel);