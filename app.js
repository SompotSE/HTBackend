const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./db');
const User = require('./model/UserModel');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },
    err => { console.log('Can not connect to the database'+ err)}
);

app.use(passport.initialize());
require('./passport')(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('hello');
});

app.get('/users', function(req, res){
    User.find({}, function(err, users){
        res.json(users);
        console.log('Test get user');
    })
});

app.post('/users', function(req, res){
    User.create({
        User_g: req.body.User_g,
        Password: req.body.Password,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        Address: req.body.Address,
        Phonenumber: req.body.Phonenumber
    }),
    console.log('test');
    //res.send(User);
});

app.get('/users/:id', (req, res) => {
    User.findOne({ _id: req.params.id })
        .then(response => res.status(200).json(response))
        .catch(error => console.error(error));
});

app.delete('/users/:id', (req, res) => {
    User.findOne({ _id: req.params.id })
        .then(response => res.status(200).json(response.delete(req.params.id)))
        .catch(error => console.error(error));
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});