const express = require('express');
const app = express();
const AuthorizeRouter = express.Router();

const AuthorizeModel = require('../model/AuthorizeModel');

AuthorizeRouter.route('/add').post(function(req, res){
    const authorize = new AuthorizeModel(req.body);
    authorize.save()
    .then(authorize =>{
        res.json('Server added successfully');
    })
    .catch(err =>{
        res.status(400).send("unable to save to database");
    });
});

AuthorizeRouter.route('/authorize_list').get(function(req, res){
    AuthorizeModel.find(function(err, authorize){
        if(err){
            console.log(err);
        }
        else{
            res.json(authorize);
        }
    });
});

AuthorizeRouter.route('/authorize/:id').get(function (req, res) {
    AuthorizeModel.findById(req.params.id, function (err, authorize) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(authorize);
        }
    });
});

AuthorizeRouter.route('/update/:id').post(function(req, res){
    AuthorizeModel.findById(req.params.id, function(err, authorize){
        if(!authorize)
            res.status(404).send("data is not found");
        else
            authorize.Key_Room = req.body.Key_Room;
            authorize.Id_User = req.body.Id_User

            authorize.save().then(authorize => {
                res.json('Updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

AuthorizeRouter.route('/Removeauthorize/:id').post(function (req, res) {
    AuthorizeModel.findByIdAndDelete(req.params.id, function (err, Key_Room) {
        if (err) {
            res.send(err);
        } else {
            res.json("Authorize has been Deleted")
            console.log('send it')
        }
    });
});

module.exports = AuthorizeRouter;