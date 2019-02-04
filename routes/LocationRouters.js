const express = require('express');
const app = express();
const LocationRouter = express.Router();

const LocationModel = require('../model/LocationModel');

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

LocationRouter.route('/Removelocation').post(function (req, res, _id) {
    LocationModel.findOneAndDelete(_id, function (err, loca) {
        if (err) {
            res.send(err);
        } else {
            res.json("Location has been Deleted")
            console.log('send it')
        }
    });
});

module.exports = LocationRouter;
