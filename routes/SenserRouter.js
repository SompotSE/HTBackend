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

SenserRouter.route('/senser/:id').get(function (req, res) {
    SenserModel.findById(req.params.id, function (err, senser) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(senser);
        }
    });
});

SenserRouter.route('/update/:id').post(function(req, res){
    SenserModel.findById(req.params.id, function(err, senser){
        if(!senser)
            res.status(404).send("data is not found");
        else
            senser.Position = req.body.Position;
            senser.Macaddress = req.body.Macaddress;
            senser.Temp_Low = req.body.Temp_Low;
            senser.Temp_Hight = req.body.Temp_Hight;
            senser.Humdi_Low = req.body.Humdi_Low;
            senser.Humdi_Hight = req.body.Humdi_Hight;

            senser.save().then(senser => {
                res.json('Updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

SenserRouter.route('/Removesenser/:id').post(function (req, res) {
    SenserModel.findByIdAndDelete(req.params.id, function (err, senser) {
        if (err) {
            res.send(err);
        } else {
            res.json("Senser has been Deleted")
            console.log('send it')
        }
    });
});

module.exports = SenserRouter;