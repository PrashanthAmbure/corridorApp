var express = require('express');
var router = express.Router();
var mongo = require('./mongo-db/index.js');
var JSONStream = require('JSONStream');
var ObjectId = require('mongodb').ObjectID;
var getSetObject = function(data, cname) {
    var obj = {};
    var objupdated = false;
    var map = {
        appstore: ['name', 'category', 'src', 'srcLg', 'infotext', 'href', 'desc'],
        letsbuild: [
            'name', 
            'src', 
            'status', 
            'effort', 
            'percentageOfCompletion', 
            'category', 
            'href',
            'division',
            'shortDesc',
            'longDesc',
            'techDetails',
            'vedioLink',
            'minimumBid',
            'team',
            'proposedTeam'
        ],
        globals: ['name', 'type', 'value']
    };

    for (var len = map[cname].length - 1; len >= 0; len--) {
        var key = map[cname][len];
        if (data[key]) {
            objupdated = true;
            obj[key] = data[key];
        }
    }
    if (objupdated) {
        return obj;
    } else {
        return false;
    }
};

router.get('/collection', function(req, res, next) {
    var query = req.query;
    mongo.connect({
        callback: function(err, db) {
            if (err) {
                console.log({
                    'error': '_error_mongo'
                });
                return;
            }
            var cursor = mongo.find({
                db: db,
                collectionName: query.cname
            });
            cursor.stream().pipe(JSONStream.stringify()).pipe(res);
        }
    });
});
router.get('/deletedoc', function(req, res, next) {
    var query = req.query;
    mongo.connect({
        callback: function(err, db) {
            if (err) {
                console.log({
                    'error': '_error_mongo'
                });
                return;
            }
            var collection = db.collection(query.cname);
            collection.remove({
                _id: new ObjectId(query._id)
            }, function(err, count) {
                if (err) {
                    console.log({
                        'error': '_error_mongo'
                    });
                    return;
                }
                res.json('');
                db.close();
            });
        }
    });
});
router.get('/getdocument', function(req, res, next) {
    var query = req.query;
    mongo.connect({
        callback: function(err, db) {
            if (err) {
                console.log({
                    'error': '_error_mongo'
                });
                return;
            }
            var collection = db.collection(query.cname);
            collection.findOne({
                _id: new ObjectId(query._id)
            }, function(err, doc) {
                if (err) {
                    console.log({
                        'error': '_error_mongo'
                    });
                    return;
                }
                res.json(doc);
                db.close();
            });
        }
    });
});
router.post('/update', function(req, res, next) {
    var data = req.body.data;
    var cname = req.body.cname;
    var id = req.body._id;
    var setObj = getSetObject(data, cname);
    if (!setObj) {
        res.json('');
        return;
    }
    mongo.connect({
        callback: function(err, db) {
            if (err) {
                console.log({
                    'error': '_error_mongo'
                });
                return;
            }
            var collection = db.collection(cname);
            setObj.lastUpdated = +new Date();
            collection.update({
                _id: new ObjectId(id)
            }, {
                $set: setObj
            }, function(err, doc) {
                if (err) {
                    console.log({
                        'error': '_error_mongo'
                    });
                    return;
                }
                res.json('');
                db.close();
            });
        }
    });
});
router.post('/adddocument', function(req, res, next) {
    var data = req.body.data;
    var cname = req.body.cname;
    var setObj = getSetObject(data, cname);
    mongo.connect({
        callback: function(err, db) {
            if (err) {
                console.log({
                    'error': '_error_mongo'
                });
                return;
            }
            var collection = db.collection(cname);
            setObj.createdAt = +new Date();
            collection.insert(setObj, function(err, doc) {
                if (err) {
                    console.log({
                        'error': '_error_mongo'
                    });
                    return;
                }
                res.json('');
                db.close();
            });
        }
    });
});



router.post('/signin', function(req, res, next) {
    var data = req.body.data;
    var adminUser = {
        email: 'admin',
        password: 'admin' 
    };

    if( data.email === adminUser.email && data.password === adminUser.password ) {
        res.json( {
            user: adminUser
        } );
    } 
    else {
        res.statusCode = 400;
        res.json( {
            type: 'error',
            code: '_invalid_credeintials'
        } );
    }
});
module.exports = router;
