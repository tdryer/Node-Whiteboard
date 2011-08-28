////////////////////////////////////////
// Simple MongoDB Wrapper             //
// Written to use with MongoHQ.com    //
// By Jamund Ferguson                 //
// April 9, 2011
////////////////////////////////////////

var mongodb = require('mongodb'),
    db;

// inititalize the db
exports.init = function(options) {

    db = new mongodb.Db(options.name, new mongodb.Server(options.host, options.port, {auto_reconnect:true}), {});
    
    db.open(function(err, p_client) {
        if (typeof options.user !== 'string' || typeof options.pass !== 'string') return;
        db.authenticate(options.user, options.pass, function(err) {
            if (err) console.log(err);
        });
    });

    return this;
}

// register a collection for use
exports.collection = function(collection) {
    db.collection(collection, function(err, col) {
       exports[collection] = col;
    });
}

// convenient access to make ObjectIDs
exports.ObjectID = mongodb.BSONPure.ObjectID;

// convenient access to the native driver
exports.db = db;