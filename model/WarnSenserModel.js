const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WarnSenserSchema = new Schema({
    Message: {
        type: String,
        required: true
    },
    Id_MAC: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'warm_serser'
});

module.exports = mongoose.model('warm_serser', WarnSenserSchema);