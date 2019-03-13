const express = require('express');
const app = express();
const LocationRouter = express.Router();

const LocationModel = require('../model/LocationModel');
const BuildingModel = require('../model/BuildingModel');
const SenserModel = require('../model/SenserModel');
const AuthorizeModel = require('../model/AuthorizeModel');

LocationRouter.route('/add').post(function (req, res) {
    const loca = new LocationModel(req.body);
    loca.save()
        .then(loca => {
            res.json('Server added successfully');
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

LocationRouter.route('/location_list').get(function (req, res) {
    LocationModel.find(function (err, loca) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(loca);
        }
    });
});

LocationRouter.route('/location/:id').get(function (req, res) {
    LocationModel.findById(req.params.id, function (err, loca) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(loca);
        }
    });
});

LocationRouter.route('/update/:id').post(function (req, res) {
    LocationModel.findById(req.params.id, function (err, location) {
        if (!location)
            res.status(404).send("data is not found");
        else
            location.Name_Lo = req.body.Name_Lo;
        location.Address = req.body.Address;

        location.save().then(location => {
            res.json('Updated!');
        })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

LocationRouter.route('/Removelocation/:id').post(function (req, res) {
    LocationModel.findByIdAndDelete(req.params.id, function (err, loca) {
        if (err) {
            res.send(err);
        } else {
            BuildingModel.find(function (err, build) {
                if (err) {
                    console.log(err);
                }
                else {
                    for (let i = 0; i < build.length; i++) 
                    {
                        var id_loca = build[i].Id_Loca;
                        if (id_loca === req.params.id) 
                        {
                            BuildingModel.findByIdAndDelete(build[i]._id, function(err, build1){
                                if (err) {
                                    res.send(err);
                                }
                                else
                                {
                                    SenserModel.find(function (err, senser){
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            for(let z = 0; z < senser.length; z++)
                                            {
                                                var id_build = senser[z].Id_Build;
                                                // console.log(id_build)
                                                // console.log(build[i]._id)
                                                if(id_build == build[i]._id)
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
                                                                    for(let y = 0 ; y < authorize.length; y++)
                                                                    {
                                                                        var key = authorize[y].Key_Room;
                                                                        if(key == senser[z].Key_Room)
                                                                        {
                                                                            AuthorizeModel.findByIdAndDelete(authorize[y]._id, function(err, authorize1){
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
                                    console.log('Delete building in this location')
                                }
                            });
                        }
                    }
                    
                }
            });
            res.json("Location has been Deleted")
            console.log('send it')
        }
    });
});

module.exports = LocationRouter;
