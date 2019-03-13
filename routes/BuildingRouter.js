const express = require('express');
const app = express();
const BuildingRouter = express.Router();

const BuildingModel = require('../model/BuildingModel');
const SenserModel = require('../model/SenserModel');
const AuthorizeModel = require('../model/AuthorizeModel');

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

BuildingRouter.route('/build/:id').get(function (req, res) {
    BuildingModel.findById(req.params.id, function (err, build) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(build);
        }
    });
});

BuildingRouter.route('/update/:id').post(function(req, res){
    BuildingModel.findById(req.params.id, function(err, build){
        if(!build)
            res.status(404).send("data is not found");
        else
            build.Name_Build = req.body.Name_Build;

            build.save().then(build => {
                res.json('Updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

BuildingRouter.route('/Removebuild/:id').post(function (req, res) {
    BuildingModel.findByIdAndDelete(req.params.id, function (err, build) {
        if (err) {
            res.send(err);
        } else {
            SenserModel.find(function (err, senser){
                if (err) {
                    console.log(err);
                }
                else {
                    for(let z = 0; z < senser.length; z++)
                    {
                        var id_build = senser[z].Id_Build;
                        // console.log(id_build)
                        if(id_build == req.params.id)
                        {
                            // console.log(senser[z]._id)
                            SenserModel.findByIdAndDelete(senser[z]._id, function(err, senser1){
                                if (err) {
                                    res.send(err);
                                }
                                else
                                {
                                    AuthorizeModel.find(function (err, authorize){
                                        if(err){
                                            console.log(err);
                                        }
                                        else {
                                            for(let i = 0 ; i < authorize.length; i++)
                                            {
                                                var key = authorize[i].Key_Room;
                                                if(key == senser[z].Key_Room)
                                                {
                                                    AuthorizeModel.findByIdAndDelete(authorize[i]._id, function(err, authorize1){
                                                        if (err) {
                                                            res.send(err);
                                                        }
                                                        else
                                                        {
                                                            console.log('Delete Authorize in this building')
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    console.log('Delete Senser in this building')
                                }
                            });
                        }
                    }
                }
            });
            res.json("Build has been Deleted")
            console.log('send it')
        }
    });
});

module.exports = BuildingRouter;