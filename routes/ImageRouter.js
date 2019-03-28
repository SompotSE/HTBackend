const express = require('express');
const app = express();
const ImageRouter = express.Router();
const ImageModel = require('../model/ImageModel');

var fs = require('fs');

ImageRouter.route('/up').post(function (req, res) {
    let data = req.body
    let name = new Date()
    let Id_Build = data.Id_Build
    const Id_Map = data.img.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFile("./uploads/" + name.getTime() + "." + "png", Id_Map, "base64", function (err) {
        // console.log(err); // writes out file without error, but it's not a valid image
    });
    console.log(Id_Map.length);

    const image = new ImageModel({ Id_Map, Id_Build });
    image.save()
        .then(image => {
            res.json('Server added Map successfully');
            //console.log(res);
        })
    // res.send("ok");
    // console.log(data.img)
});

ImageRouter.route('/picmap_list').get(function(req, res){
    ImageModel.find(function(err, image){
        if(err){
            console.log(err);
        }
        else{
            res.json(image);
        }
    });
});

ImageRouter.route('/picmap/:id').get(function (req, res) {
    ImageModel.findById(req.params.id, function (err, image) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(image);
        }
    });
});



module.exports = ImageRouter;