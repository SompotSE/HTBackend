const express = require('express');
const app = express();
const ImageRouter = express.Router();
const ImageModel = require('../model/ImageModel');

var fs = require('fs');

ImageRouter.route('/up').post(function (req, res) {
    let data = req.body
    let Id_Build = data.Id_Build
    const Id_Map = data.img.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    // fs.writeFile("./uploads/" + name.getSeconds() + "." + "png", base64Data2, "base64", function (err) {
    //     // console.log(err); // writes out file without error, but it's not a valid image
    // });
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

// ImageRouter.route('/show').get(function (req, res) {
//     res.sendFile(__dirname + '/testcode');

// });



module.exports = ImageRouter;