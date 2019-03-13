const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const request = require('request')

const config = require('./db');
const PORT = 5000;
// const PORT = process.env.PORT || 5000;
const cors = require('cors');
const UserRouter = require('./routes/UserRouter')
const LocationRouter = require('./routes/LocationRouters')
const BuildingRouter = require('./routes/BuildingRouter')
const SenserRouter = require('./routes/SenserRouter')
const DHTRouter = require('./routes/DHTRouter')
const AuthorizeRouter = require('./routes/AuthorizeRouter')

const DHTModel = require('./model/DHTModel');
const WarnModel = require('./model/WarnSenserModel');
const WarnTempHumidModel = require('./model/WarnTempHumid')
const SenserModel = require('./model/SenserModel')
const AuthorizeModel = require('./model/AuthorizeModel')

//-->> start senser 
var mongojs = require('mongojs')
var Promise = require('promise')
var myiotdb = mongojs('HT_Data')
var dhtdb = mongojs('HT_Data')
var devid, data, datasize, dataset = ''
var t, h, mac, macWarn , massWarn
//<<-- end senser


mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => { console.log('Database is connected') },
    err => { console.log('Can not connect to the database' + err) }
);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)

app.use('/users', UserRouter);
app.use('/locations', LocationRouter);
app.use('/build', BuildingRouter);
app.use('/sensers', SenserRouter);
app.use('/dht', DHTRouter);
app.use('/authorize', AuthorizeRouter)

//-->> control read write senser
app.get('/write/:data', function (req, res) {
    var strParseWriteReq = JSON.stringify(req.params)
    var strWriteReq = JSON.parse(strParseWriteReq)
    data = strWriteReq.data
    writedata(data, res)
})

app.get('/read/:datasize', function (req, res) {
    var strParseReadReq = JSON.stringify(req.params)
    var strReadReq = JSON.parse(strParseReadReq)
    datasize = strReadReq.datasize
    readdata(datasize, res)
})

/* For DHT write */
app.get('/writedht/:t/:h/:mac', function (req, res) {
    var strParseWriteReq = JSON.stringify(req.params)
    var strWriteReq = JSON.parse(strParseWriteReq)
    t = strWriteReq.t
    h = strWriteReq.h
    mac = strWriteReq.mac
    writeDHT(t, h, mac, res)
})

/* For warn Senser */
app.get('/warndht/:mass/:mac', function (req, res) {
    var strParseWriteReq = JSON.stringify(req.params)
    var strWriteReq = JSON.parse(strParseWriteReq)
    massWarn = strWriteReq.mass
    macWarn = strWriteReq.mac
    warnDHT(massWarn, macWarn, res)
})

/* For DHT data read */
app.get('/readdht/:datasize', function (req, res) {
    var strParseReadReq = JSON.stringify(req.params)
    var strReadReq = JSON.parse(strParseReadReq)
    datasize = strReadReq.datasize
    readDHT(datasize, res)
})

app.get('/history', function (req, res) {
    var dhtcollection = dhtdb.collection('dht')
    dhtcollection.find(function (err, dht) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(dht);
        }
    })
})

async function writedata(_data, res) {
    await writeDataToMongo(_data, res)
}

function writeDataToMongo(_savedata, res) {
    return new Promise(function (resolve, reject) {
        var mywritecollection = myiotdb.collection('dataTest')
        mywritecollection.insert({
            data: (_savedata),
            recordTime: new Date().getVarDate().VarDate_typekey()
        }, function (err) {
            if (err) {
                console.log(err)
                res.send(String(err))
            } else {
                console.log('Reccord data ok')
                res.send('Reccord data ok')
            }
        })
    })
}

async function readdata(_datasize, res) {
    await readDataFromMongo(_datasize, res)
}

function readDataFromMongo(_readdatasize, res) {
    return new Promise(function (resolve, reject) {
        var myreadcollection = myiotdb.collection('dataTest')
        myreadcollection.find({}).limit(Number(_readdatasize)).sort({ recordTime: -1 }, function (err, docs) {
            //console.log(JSON.stringify(docs))
            res.jsonp(docs)
        })
    })
}

async function writeDHT(_t, _h, mac, res) {
    await writeDHTtoMongo(_t, _h, mac, res)
}

// function writeDHTtoMongo(_saveT, _saveH, _saveMac, res) {
//     return new Promise(function (resolve, reject) {
//         var dhtwritecollection = dhtdb.collection('dht')
//         dhtwritecollection.insert({
//             t: Number(_saveT),
//             h: Number(_saveH),
//             mac: _saveMac,
//             recordTime: new Date().getTime()
//         }, function (err) {
//             if (err) {
//                 console.log(err)
//                 res.send(String(err))
//             } else {
//                 console.log('record dht data ok')
//                 res.send('record dht data ok')
//             }
//         })
//     })
// }

function writeDHTtoMongo(_saveT, _saveH, _saveMac, res) {
    return new Promise(function (resolve, reject) {
        //var dhtwritecollection = dhtdb.collection('dht')
        SenserModel.find(function (err, senser) {
            if (err) {
                console.log(err);
            }
            else {
                if(_saveT != 404 && _saveH != 404)
                {
                var massT, massH
                for (let i = 0; i < senser.length; i++) {
                    if (_saveMac === senser[i].Macaddress) {
                        if (_saveT < senser[i].Temp_Low) {
                            massT = "อุณหภูมิตำกว่าค่าที่กำหนด"
                            const warn = {
                                Message: massT,
                                Temp: _saveT,
                                Humdidity: _saveH,
                                Id_MAC: _saveMac
                            }
                            const WarnTH = new WarnTempHumidModel(warn);
                            WarnTH.save()
                                .then(TH => {
                                    console.log('warn dht')
                                })
                                .catch(err => {
                                    console.log(err)
                                });
                            NotiLine(massT)  
                        }
                        else if (_saveT > senser[i].Temp_Hight) {
                            massT = "อุณหภูมิสูงกว่าค่าที่กำหนด"
                            const warn = {
                                Message: massT,
                                Temp: _saveT,
                                Humdidity: _saveH,
                                Id_MAC: _saveMac
                            }
                            const WarnTH = new WarnTempHumidModel(warn);
                            WarnTH.save()
                                .then(TH => {
                                    console.log('warn dht')
                                })
                                .catch(err => {
                                    console.log(err)
                                });
                            NotiLine(massT)  
                        }

                        if (_saveH < senser[i].Humdi_Low) {
                            massH = "ความชื้นตำกว่าค่าที่กำหนด"
                            const warn = {
                                Message: massH,
                                Temp: _saveT,
                                Humdidity: _saveH,
                                Id_MAC: _saveMac
                            }
                            const WarnTH = new WarnTempHumidModel(warn);
                            WarnTH.save()
                                .then(TH => {
                                    console.log('warn dht')
                                })
                                .catch(err => {
                                    console.log(err)
                                });
                            NotiLine(massH)                              
                        }
                        else if (_saveH > senser[i].Humdi_Hight) {
                            massH = "ความชื้นสูงกว่าค่าที่กำหนด"
                            const warn = {
                                Message: massH,
                                Temp: _saveT,
                                Humdidity: _saveH,
                                Id_MAC: _saveMac
                            }
                            const WarnTH = new WarnTempHumidModel(warn);
                            WarnTH.save()
                                .then(TH => {
                                    console.log('warn dht')
                                })
                                .catch(err => {
                                    console.log(err)
                                });
                            NotiLine(massH)  
                        }
                    }
                }
            }
            }
        });
        const data = {
            t: Number(_saveT),
            h: Number(_saveH),
            mac: _saveMac
        }
        const DHT = new DHTModel(data);
        DHT.save()
            .then(DHT => {
                console.log('record dht data ok')
                res.send('record dht data ok')
            })
            .catch(err => {
                console.log(err)
                res.send(String(err))
            });
    })
}

async function warnDHT(massWarn, macWarn, res) {
    await warnDHTtoMongo(massWarn, macWarn, res)
}

function warnDHTtoMongo(_savemassWarn, _savemacWarn, res) {
    return new Promise(function (resolve, reject) {
            var _Message = ("ไม่สามารถรับค่าจากเซนเซอร์ได้")
            if(_savemassWarn === "ConnectSenser")
            {
                _Message = ("สามารถรับค่าจากเซนเซอร์ได้")
            } else if(_savemassWarn === "NoConnectSenser")
            {
                _Message = ("ไม่สามารถรับค่าจากเซนเซอร์ได้")
            }
            const data = {
                Message: _Message,
                Id_MAC: _savemacWarn
            }
            const Warn = new WarnModel(data);
            Warn.save()
                .then(Warn => {
                    console.log('record warn data ok')
                    res.send('record warn data ok')
                })
                .catch(err => {
                    console.log(err)
                    res.send(String(err))
                });
            NotiLine(_Message)  
    })
}


async function readDHT(_datasize, res) {
    await readDHTFromMongo(_datasize, res)
}

function readDHTFromMongo(_readdatasize, res) {
    return new Promise(function (resolve, reject) {
        var dhtcollection = dhtdb.collection('dht')
        dhtcollection.find({}).limit(Number(_readdatasize)).sort({ recordTime: -1 }, function (err, docs) {
            //console.log(JSON.stringify(docs))
            res.jsonp(docs)
        })
    })
}

async function NotiLine(Mass, res) {
    await sentNotiLine(Mass, res)
}

function sentNotiLine(Mass, res) {
    return new Promise(function (resolve, reject) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {+dZVFQMjY/q3tQEFG29T1/UXoG8dZDe2XcK05icq7jBQzyw/VV9Qlri3g4RSo7Kpw+4ji1Ws0QatykTVOCyW7m53XsWqcrcPWf+z8tosm197HtwaO1xCrCzSyB+/H8xTalQLr1uCtO1xfl+ggoIEPAdB04t89/1O/w1cDnyilFU=}'
        }
    
         let body = JSON.stringify({
            to:  'U3cc788b06af83710155d31f53d94d0c9', 
            messages: [{
                type: 'text',
                text: Mass
            }]
        })
    
        request.post({
            url: 'https://api.line.me/v2/bot/message/push ',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    })
}

app.get('/history', function (req, res) {
    var dhtcollection = dhtdb.collection('dht')
    dhtcollection.find(function (err, dht) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(dht);
        }
    })
})

app.get('/WarnTempHumid', function (req, res) {
    WarnTempHumidModel.find(function (err, WarnTH) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(WarnTH);
        }
    })
})

app.get('/WarnSenser', function (req, res) {
    WarnModel.find(function (err, WarnSenser) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(WarnSenser);
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});