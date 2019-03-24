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
const LocationModel = require('./model/LocationModel');
const BuildingModel = require('./model/BuildingModel');
const UserModel = require('./model/UserModel')

//-->> start senser 
var mongojs = require('mongojs')
var Promise = require('promise')
var myiotdb = mongojs('HT_Data')
var dhtdb = mongojs('HT_Data')
var devid, data, datasize, dataset = ''
var t, h, mac, macWarn, massWarn
var show = [], show_num = 0;
var show1 = [], show_num1 = 0;
// var id_line = [], line_num = 0;
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
                if (_saveT != 404 && _saveH != 404) {
                    var massT = "Null", massH = "Null"
                    for (let i = 0; i < senser.length; i++) {
                        if (_saveMac === senser[i].Macaddress) {
                            if (_saveT < senser[i].Temp_Low) {
                                massT = "อุณหภูมิต่ำกว่าค่าที่กำหนด"
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
                                //NotiLine(massT)
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
                                //NotiLine(massT)
                            }

                            if (_saveH < senser[i].Humdi_Low) {
                                massH = "ความชื้นต่ำกว่าค่าที่กำหนด"
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
                                //NotiLine(massH)
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
                                //NotiLine(massH)
                            }
                        }
                    }

                    show1 = [];
                    show_num1 = 0;
                    SenserModel.find(function (err, senser) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            for (let i = 0; i < senser.length; i++) {
                                BuildingModel.find(function (err, build) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        for (let y = 0; y < build.length; y++) {
                                            // console.log(senser[i].Id_Build)
                                            // console.log(build[y]._id)
                                            if (senser[i].Id_Build == build[y]._id) {
                                                LocationModel.find(function (err, loca) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                        //console.log(build[y].Id_Loca)
                                                        for (let z = 0; z < loca.length; z++) {
                                                            if (build[y].Id_Loca == loca[z]._id) {
                                                                if (_saveMac == senser[i].Macaddress) {
                                                                    show1[show_num1] = {
                                                                        Name_Lo: loca[z].Name_Lo,
                                                                        Name_Build: build[y].Name_Build,
                                                                        Position: senser[i].Position,
                                                                        Temp_Low: senser[i].Temp_Low,
                                                                        Temp_Hight: senser[i].Temp_Hight,
                                                                        Humdi_Low: senser[i].Humdi_Low,
                                                                        Humdi_Hight: senser[i].Humdi_Hight,
                                                                        Macaddress: senser[i].Macaddress,
                                                                        Key_Room: senser[i].Key_Room
                                                                    }
                                                                    show_num1 = show_num1 + 1;
                                                                    // console.log(show_num)
                                                                    // console.log(show[0].Key_Room)
                                                                    AuthorizeModel.find(function (err, authorize) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                        else {
                                                                            for (let a = 0; a < authorize.length; a++) {
                                                                                if (show1[0].Key_Room == authorize[a].Key_Room) {
                                                                                    UserModel.find(function (err, user) {
                                                                                        if (err) {
                                                                                            console.log(err);
                                                                                        }
                                                                                        else {
                                                                                            
                                                                                            for (let b = 0; b < user.length; b++) {
                                                                                                if (authorize[a].Id_User == user[b]._id) {
                                                                                                    if(massT == "อุณหภูมิต่ำกว่าค่าที่กำหนด" || massT == "อุณหภูมิสูงกว่าค่าที่กำหนด")
                                                                                                    {
                                                                                                        //
                                                                                                        NotiLineTemp(user[b].Id_line, show1[0].Name_Lo, show1[0].Name_Build, show1[0].Position, show1[0].Temp_Hight, show1[0].Temp_Low, _saveT,  massT)
                                                                                                    } 
                                                                                                    if(massH == "ความชื้นต่ำกว่าค่าที่กำหนด" || massH == "ความชื้นสูงกว่าค่าที่กำหนด")
                                                                                                    {
                                                                                                        NotiLineHumi(user[b].Id_line, show1[0].Name_Lo, show1[0].Name_Build, show1[0].Position, show1[0].Humdi_Hight, show1[0].Humdi_Low, _saveH,  massH)
                                                                                                    }
                                                                                                    // console.log(massT)
                                                                                                    // console.log(massH)
                                                                                                    // id_line[line_num] = user[b].id_line
                                                                                                    // line_num = line_num + 1
                                                                                                    //console.log(user[b].Id_line)
                                                                                                    //NotiLineSenser(user[b].Id_line, show1[0].Name_Lo, show1[0].Name_Build, show1[0].Position, _Message)
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
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
        if (_savemassWarn === "ConnectSenser") {
            _Message = ("สามารถรับค่าจากเซนเซอร์ได้")
        } else if (_savemassWarn === "NoConnectSenser") {
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

        show = [];
        show_num = 0;
        SenserModel.find(function (err, senser) {
            if (err) {
                console.log(err);
            }
            else {
                for (let i = 0; i < senser.length; i++) {
                    BuildingModel.find(function (err, build) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            for (let y = 0; y < build.length; y++) {
                                // console.log(senser[i].Id_Build)
                                // console.log(build[y]._id)
                                if (senser[i].Id_Build == build[y]._id) {
                                    LocationModel.find(function (err, loca) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            //console.log(build[y].Id_Loca)
                                            for (let z = 0; z < loca.length; z++) {
                                                if (build[y].Id_Loca == loca[z]._id) {
                                                    if (_savemacWarn == senser[i].Macaddress) {
                                                        show[show_num] = {
                                                            Name_Lo: loca[z].Name_Lo,
                                                            Name_Build: build[y].Name_Build,
                                                            Position: senser[i].Position,
                                                            Temp_Low: senser[i].Temp_Low,
                                                            Temp_Hight: senser[i].Temp_Hight,
                                                            Humdi_Low: senser[i].Humdi_Low,
                                                            Humdi_Hight: senser[i].Humdi_Hight,
                                                            Macaddress: senser[i].Macaddress,
                                                            Key_Room: senser[i].Key_Room
                                                        }
                                                        show_num = show_num + 1;
                                                        // console.log(show_num)
                                                        // console.log(show[0].Key_Room)
                                                        id_line = [];
                                                        line_num = 0;
                                                        AuthorizeModel.find(function (err, authorize) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            else {
                                                                for (let a = 0; a < authorize.length; a++) {
                                                                    if (show[0].Key_Room == authorize[a].Key_Room) {
                                                                        UserModel.find(function (err, user) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            }
                                                                            else {
                                                                                for (let b = 0; b < user.length; b++) {
                                                                                    if (authorize[a].Id_User == user[b]._id) {
                                                                                        // id_line[line_num] = user[b].id_line
                                                                                        // line_num = line_num + 1
                                                                                        //console.log(user[b].Id_line)
                                                                                        NotiLineSenser(user[b].Id_line, show[0].Name_Lo, show[0].Name_Build, show[0].Position, _Message)
                                                                                    }
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
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

async function NotiLineSenser(_id, loca, build, position, Mass, res) {
    await sentNotiLineSenser(_id, loca, build, position, Mass, res)
}

function sentNotiLineSenser(_id, loca, build, position, Mass, res) {
    //console.log(_id)
    return new Promise(function (resolve, reject) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {+dZVFQMjY/q3tQEFG29T1/UXoG8dZDe2XcK05icq7jBQzyw/VV9Qlri3g4RSo7Kpw+4ji1Ws0QatykTVOCyW7m53XsWqcrcPWf+z8tosm197HtwaO1xCrCzSyB+/H8xTalQLr1uCtO1xfl+ggoIEPAdB04t89/1O/w1cDnyilFU=}'
        }

        let body = JSON.stringify({
            to: _id,
            messages: [
                {
                    type: 'text',
                    text: 'สถานที่ : ' + loca
                        + '\nอาคาร : ' + build
                        + '\nตำแหน่งที่ติดตั้ง : ' + position
                        + '\nการแจ้งเตือน : ' + Mass
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

async function NotiLineTemp(_id, loca, build, position, max_t, min_t, temp, Mass, res) {
    await sentNotiLineTemp(_id, loca, build, position, max_t, min_t, temp, Mass, res)
}

function sentNotiLineTemp(_id, loca, build, position, max_t, min_t, temp, Mass, res) {
    //console.log(_id)
    return new Promise(function (resolve, reject) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {+dZVFQMjY/q3tQEFG29T1/UXoG8dZDe2XcK05icq7jBQzyw/VV9Qlri3g4RSo7Kpw+4ji1Ws0QatykTVOCyW7m53XsWqcrcPWf+z8tosm197HtwaO1xCrCzSyB+/H8xTalQLr1uCtO1xfl+ggoIEPAdB04t89/1O/w1cDnyilFU=}'
        }

        let body = JSON.stringify({
            to: _id,
            messages: [
                {
                    type: 'text',
                    text: 'สถานที่ : ' + loca
                        + '\nอาคาร : ' + build
                        + '\nตำแหน่งที่ติดตั้ง : ' + position
                        + '\nอุณหภูมิที่ตั้งค่าไว้ : อุณหภูมิสูงสุด ' + max_t + ' อุณหภูมิต่ำสุด ' + min_t
                        + '\nอุณหภูมิที่วัดได้ : ' + temp
                        + '\nการแจ้งเตือน : ' + Mass
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

async function NotiLineHumi(_id, loca, build, position, max_h, min_h, humi, Mass, res) {
    await sentNotiLineHumi(_id, loca, build, position, max_h, min_h, humi, Mass, res)
}

function sentNotiLineHumi(_id, loca, build, position, max_h, min_h, humi, Mass, res) {
    //console.log(_id)
    return new Promise(function (resolve, reject) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {+dZVFQMjY/q3tQEFG29T1/UXoG8dZDe2XcK05icq7jBQzyw/VV9Qlri3g4RSo7Kpw+4ji1Ws0QatykTVOCyW7m53XsWqcrcPWf+z8tosm197HtwaO1xCrCzSyB+/H8xTalQLr1uCtO1xfl+ggoIEPAdB04t89/1O/w1cDnyilFU=}'
        }

        let body = JSON.stringify({
            to: _id,
            messages: [
                {
                    type: 'text',
                    text: 'สถานที่ : ' + loca
                        + '\nอาคาร : ' + build
                        + '\nตำแหน่งที่ติดตั้ง : ' + position
                        + '\nความชื้นที่ตั้งค่าไว้ : ความชื้นสูงสุด ' + max_h + ' ความชื้นต่ำสุด ' + min_h
                        + '\nความชื้นที่วัดได้ : ' + humi
                        + '\nการแจ้งเตือน : ' + Mass
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