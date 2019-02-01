// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const config = require('./db');
// const User = require('./model/UserModel');
// const app = express();
// const PORT = process.env.PORT || 5000;
// const cors = require('cors');

// mongoose.connect(config.DB, { useNewUrlParser: true }).then(
//     () => { console.log('Database is connected') },
//     err => { console.log('Can not connect to the database' + err) }
// );


// app.use(cors())
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());


// app.get('/', function (req, res) {
//     res.send('hello');
// });

// app.get('/users', function (req, res) {
//     User.find({}, function (err, users) {
//         res.json(users);
//     })
// });

// app.post('/users/login', function (req, res) {
//     var user = req.body.User_g
//     var pass = req.body.Password
//     User.findOne({ User_g: user, Password: pass }, (err, result) => {
//         if (err) { /* handle err */ }

//         if (result) {
//             res.send({ status: "Success", data: result });
//         } else {
//             res.send({ status: "Fail" });
//         }
//     })

// });

// app.listen(PORT, () => {
//     console.log(`Server is running on PORT ${PORT}`);
// });