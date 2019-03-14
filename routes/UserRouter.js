const express = require('express');
const app = express();
const UserRouter = express.Router();


const UserModel = require('../model/UserModel');


UserRouter.route('/add').post(function (req, res) {
    const user = new UserModel(req.body);
    user.save()
        .then(user => {
            res.json('Server added successfully');
            //console.log(res);
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

UserRouter.route('/user_list').get(function (req, res) {
    UserModel.find(function (err, user) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(user);
        }
    });
});

UserRouter.route('/login').post(function (req, res) {
    var user = req.body.User_g
    var pass = req.body.Password 
    UserModel.findOne({ User_g: user, Password: pass }, (err, result) => {
        if (err) { /* handle err */ }

        if (result) {
            res.send({ status: "Success", data: result });
        } else {
            res.send({ status: "Fail" });
        }
    })

});

module.exports = UserRouter;
