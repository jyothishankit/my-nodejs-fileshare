// //const assert = require('assert');
// const client = require('mongodb').MongoClient;
// const config = require('../config');

// let _db;

// function initDb(callback){
//     if(_db){
//         console.warn("Trying to call initDb again!");
//         return callback(null,_db);
//     }
//     console.log("Hello, World!");
//     client.connect("mongodb://localhost:27017/node-yobam-db-yo",{useNewUrlParser:true,useUnifiedTopology:true},"", connected);
//     function connected(err, db){
//         if(err){
//             return callback(err);
//         }
//         console.log("DB initialized - connected to: mongodb node-yobam- database");
//         _db=db;
//         return callback(null,_db);
//     }
// }

// function getDb(){
//     assert.ok(_db,"Db has not been initialized. Please called init first.");
//     return _db;
// }

// module.exports = {
//     getDb, initDb
// };

var MongoClient = require('mongodb').MongoClient;
var Grid = require('mongodb').Grid;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/node-yobam-db-yo", function(err, db) {
  if(err) return console.dir(err);

  var grid = new Grid(db, 'fs');
  var buffer = new Buffer("Hello world");
  grid.put(buffer, {metadata:{category:'text'}, content_type: 'text'}, function(err, fileInfo) {
    if(!err) {
      console.log("Finished writing file to Mongo");
    }
  });
});

