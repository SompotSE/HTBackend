const express = require('express');
const app = express();
const LocationRouter = express.Router();

const LocationModel = require('../model/LocationModel');
const BuildingModel = require('../model/BuildingModel');
const ImageModel = require('../model/ImageModel');
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
        location.lat = req.body.lat;
        location.lng = req.body.lng;

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
                    for (let i = 0; i < build.length; i++) {
                        var id_loca = build[i].Id_Loca;
                        if (id_loca === req.params.id) {
                            BuildingModel.findByIdAndDelete(build[i]._id, function (err, build1) {
                                if (err) {
                                    res.send(err);
                                } else {
                                    ImageModel.find(function (err, image) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            for (let x = 0; x < image.length; x++) {
                                                var id_build = image[x].Id_Build;
                                                if (id_build == build[i]._id) {
                                                    ImageModel.findByIdAndDelete(image[x]._id, function (err, image1) {
                                                        if (err) {
                                                            res.send(err);
                                                        }
                                                        else {
                                                            SenserModel.find(function (err, senser) {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                                else {
                                                                    for (let z = 0; z < senser.length; z++) {
                                                                        var id_map = senser[z].Id_Map;
                                                                        if (id_map == image[x]._id) {
                                                                            SenserModel.findByIdAndDelete(senser[z]._id, function (err, senser1) {
                                                                                if (err) {
                                                                                    res.send(err);
                                                                                }
                                                                                else {
                                                                                    AuthorizeModel.find(function (err, authorize) {
                                                                                        if (err) {
                                                                                            console.log(err);
                                                                                        }
                                                                                        else {
                                                                                            for (let y = 0; y < authorize.length; y++) {
                                                                                                var key = authorize[y].Key_Room;
                                                                                                if (key == senser[z].Key_Room) {
                                                                                                    AuthorizeModel.findByIdAndDelete(authorize[y]._id, function (err, authorize1) {
                                                                                                        if (err) {
                                                                                                            res.send(err);
                                                                                                        }
                                                                                                        else {
                                                                                                            console.log('Delete Authorize in this Location')
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                    console.log('Delete Senser in this Location')
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                            console.log('Delete Map in this Location')
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    console.log('Delete Build in this Location')
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
