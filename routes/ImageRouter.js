const express = require('express');
const app = express();
const ImageRouter = express.Router();
const ImageModel = require('../model/ImageModel');
const SenserModel = require('../model/SenserModel');
const AuthorizeModel = require('../model/AuthorizeModel');

var fs = require('fs');

ImageRouter.route('/up').post(function (req, res) {
    let data = req.body
    let name = new Date()
    let Id_Build = data.Id_Build
    // const Id_Map = data.img.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const Id_Map = data.img
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

ImageRouter.route('/picmap/:idmap').get(function (req, res) {
    ImageModel.findById(req.params.idmap, function (err, image) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(image);
        }
    });
});

ImageRouter.route('/Removemap/:id').post(function (req, res){
    ImageModel.findByIdAndDelete(req.params.id, function (err, map){
        if(err){
            res.send(err);
        } else {
            SenserModel.find(function (err, senser){
                if (err) {
                    console.log(err);
                }
                else {
                    for(let z = 0; z < senser.length; z++)
                    {
                        var id_map = senser[z].Id_Map;
                        // console.log(id_build)
                        if(id_map == req.params.id)
                        {
                            // console.log(senser[z]._id)
                            SenserModel.findByIdAndDelete(senser[z]._id, function(err, senser1){
                                if (err) {
                                    res.send(err);
                                }
                                else
                                {
                                    AuthorizeModel.find(function (err, authorize){
                                        if(err){
                                            console.log(err);
                                        }
                                        else {
                                            for(let i = 0 ; i < authorize.length; i++)
                                            {
                                                var key = authorize[i].Key_Room;
                                                if(key == senser[z].Key_Room)
                                                {
                                                    AuthorizeModel.findByIdAndDelete(authorize[i]._id, function(err, authorize1){
                                                        if (err) {
                                                            res.send(err);
                                                        }
                                                        else
                                                        {
                                                            console.log('Delete Authorize in this Map')
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    console.log('Delete Senser in this Map')
                                }
                            });
                        }
                    }
                }
            });
            res.json("Map has been Deleted")
            console.log('send it')
        }
    });
});



module.exports = ImageRouter;