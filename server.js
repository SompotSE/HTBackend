const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const config = require('./db');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const UserRouter = require('./routes/UserRouter')
const LocationRouter = require('./routes/LocationRouters')
const BuildingRouter = require('./routes/BuildingRouter')
const SenserRouter = require('./routes/SenserRouter')

mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },
    err => { console.log('Can not connect to the database'+ err)}
);

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/users', UserRouter);
app.use('/locations', LocationRouter);
app.use('/build', BuildingRouter);
app.use('/sensers', SenserRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});