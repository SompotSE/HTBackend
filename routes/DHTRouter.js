const express = require('express');
const app = express();
const DHTRouter = express.Router();

const DHTModel = require('../model/DHTModel');


DHTRouter.route('/dht_list').get(function(req, res){
    DHTModel.find(function(err, senser){
        if(err){
            console.log(err);
        }
        else{
            res.json(senser);
        }
    });
});

DHTRouter.route('/dht_list/:id').get(function (req, res) {
    DHTModel.findById(req.params.id, function (err, dht) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(senser);
        }
    });
});




module.exports = DHTRouter;