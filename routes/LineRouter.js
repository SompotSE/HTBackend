const express = require('express');
const app = express();
const LineRouter = express.Router();

const LineModel = require('../model/LineModel');

LineRouter.route('/add').post(function(req, res){
    const line = new LineModel(req.body);
    line.save()
    .then(line =>{
        res.json('Server added successfully');
    })
    .catch(err =>{
        res.status(400).send("unable to save to database");
    });
});

LineRouter.route('/line_list').get(function(req, res){
    LineModel.find(function(err, line){
        if(err){
            console.log(err);
        }
        else{
            res.json(line);
        }
    });
});

LineRouter.route('/line/:id').get(function (req, res) {
    LineModel.findById(req.params.id, function (err, line) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(line);
        }
    });
});

LineRouter.route('/update/:id').post(function(req, res){
    LineModel.findById(req.params.id, function(err, line){
        if(!line)
            res.status(404).send("data is not found");
        else
            line.IdLine = req.body.IdLine;
            senser.save().then(line => {
                res.json('Updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

LineRouter.route('/Removelineid/:id').post(function (req, res) {
    LineModel.findByIdAndDelete(req.params.id, function (err, line) {
        if (err) {
            res.send(err);
        } else {
            res.json("Line has been Deleted")
            console.log('send it')
        }
    });
});

module.exports = LineRouter;