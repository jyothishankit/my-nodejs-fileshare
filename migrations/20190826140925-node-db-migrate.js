'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db,callback) {
  db.createTable('user_pass',{
    user_id:{
      type:'string',
      primaryKey: true
    },
    password:{
      type:'string'
    }
  },function(err){
    if(err)
      callback(err);
    return callback();
  });
  db.createTable('senderReceiverFilepath',{
    sender:{
      type:'string'
    },
    receiver:{
      type:'string'
    },
    fileName:{
      type:'string'
    },
    filePath:{
      type:'string'
    }
  },function(err){
    if(err)
      callback(err);
    return callback();
  });
  db.createTable('userLastTime',{
    user:{
      type:'string'
    },
    lastTime:{
      type:'date'
    }
  },function(err){
    if(err)
      callback(err);
    return callback();
  });
};

exports.down = function(db,callback) {
  db.dropTable('user_pass',callback);
  db.senderReceiverFilepath('user_pass',callback);
};

exports._meta = {
  "version": 1
};
