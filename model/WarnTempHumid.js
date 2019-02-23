const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WarnTempHumidSchema = new Schema({
    Message: {
        type: String,
        required: true
    },
    Temp: {
        type: Number,
        required: true
    },
    Humdidity: {
        type: Number,
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
    collection: 'Warm_TempHumid'
});

module.exports = mongoose.model('Warm_TempHumid', WarnTempHumidSchema);