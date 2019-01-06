const express = require('express');
const app = express();
const SenserRouter = express.Router();

const SenserModel = require('../model/SenserModel');

SenserRouter.route('/add').post(function(req, res){
    const senser = new SenserModel(req.body);
    senser.save()
    .then(senser =>{
        res.json('Server added successfully');
    })
    .catch(err =>{
        res.status(400).send("unable to save to database");
    });
});

SenserRouter.route('/senser_list').get(function(req, res){
    SenserModel.find(function(err, senser){
        if(err){
            console.log(err);
        }
        else{
            res.json(senser);
        }
    });
});

module.exports = SenserRouter;