const express = require('express');
const app = express();
const ImageRouter = express.Router();
const ImageModel = require('../model/ImageModel');
const fs = require("fs")

ImageRouter.route('/add').post(function (req, res) {

    let data = req.body

    console.log(data.image.length)
    var base64Data = data.image.replace(/^data:image\/png;base64,/, "");

    fs.writeFile("out.jpg", base64Data, 'base64', function (err) {
        console.log(err);
    });

    // const image = new ImageModel(req.body);
    // image.save()
    //     .then(image => {
    //         res.json('Server added successfully');
    //         // console.log(image);
    //     })
    //     .catch(err => {
    //         res.status(400).send("unable to save to database");
    //     });
});




module.exports = ImageRouter;