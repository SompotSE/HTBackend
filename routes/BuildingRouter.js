const express = require('express');
const app = express();
const BuildingRouter = express.Router();

const BuildingModel = require('../model/BuildingModel');

BuildingRouter.route('/add').post(function(req, res){
    const build = new BuildingModel(req.body);
    build.save()
    .then(build =>{
        res.json('Server added successfully');
    })
    .catch(err =>{
        res.status(400).send("unable to save to database");
    });
});

BuildingRouter.route('/build_list').get(function(req, res){
    BuildingModel.find(function(err, build){
        if(err){
            console.log(err);
        }
        else{
            res.json(build);
        }
    });
});

module.exports = BuildingRouter;