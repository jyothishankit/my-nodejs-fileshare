var http = require('http');
var fs = require('fs');
var express = require('express');
var app = require('express')();
var path = require('path');
// var Db = require('mongodb').Db;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
// var initDb = require("./db").initDb;
// var getDb = require("./db").getDb;
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/node-yobam-db-yo',{useNewUrlParser:true});
ObjectId = require('mongodb').ObjectID;
var multer = require('multer');
var upload = multer({dest:__dirname+'/../client/public/'});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, './../client/public')));
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const Schema = mongoose.Schema;
const UserPassword = new Schema({
	username: String,
	password: String
});
const senderReceiverFilepathSchema = new Schema({
	sender: String,
	receiver: String,
	fileName: String,
	filePath: String
});

const UserPasswords = mongoose.model('userpasstable', UserPassword, 'userpasstable');
const senderReceiverFilepath = mongoose.model('senderReceiverFilepath', senderReceiverFilepathSchema, 'senderReceiverFilepath');

passport.serializeUser(function(user, cb) {
	console.log("Serialize");
	cb(null, user.id);
});
  
passport.deserializeUser(function(id, cb) {
	console.log("Deserialize");
	UserPasswords.findOne(ObjectId(id), function(err, user) {
		cb(err, user);
	});
});  

// initDb(function(err){
// 	app.listen(3000,function(err){
// 		if(err){
// 			throw err;
// 		}
// 		console.log("Server Up and running on port "+3000);
// 	});
// });

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserPasswords.findOne({
        username: username
      }, function(err, user) {
        if (err) {
		  console.log("####");
          return done(err);
		}
		
		if (!user) {
		  console.log("No User");
          return done(null, false);
        }

		console.log(user.username + " is the username");
        if (user.password != password) {
		  console.log("Incorrect password, correct password is " +user.password + " and input is "+password);	
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

function updateUserTableTime(user,currTime){
	
}

// console.log(typeof initDb);
app.set('view engine','ejs');
//helps render ejs files right away

app.get('/',function(req,res){  
	if(req.user){
		res.redirect('/home');
	}else{
	res.render(__dirname + '/../client/login.ejs');
	}
});

app.get('/home',function(req,res){
	if(req.user){
		var currentTime = new Date();
		updateUserTableTime(req.user.username,currentTime);
		var username = req.body.username;
		var password = req.body.password;
		//req.session.username = username;
		console.log(username+" is the username");
		console.log(password+" is the password");

		//perform db query
		senderReceiverFilepath.find({receiver:req.user.username},function(err,result) {
			if(err){
				res.render(__dirname + '/../client/home.ejs',{username:username,filesReceivedResults:""});
			}
			else {
				res.render(__dirname + '/../client/home.ejs',{username:username,filesReceivedResults:result});
			}	
		});
	}
	else{
		res.send("User not currently logged in");
	}
});

app.post('/home',passport.authenticate('local', { failureRedirect: '/error' }),function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	//req.session.username = username;
	console.log(username+" is the username");
	console.log(password+" is the password");
	senderReceiverFilepath.find({receiver:req.user.username},function(err,result) {
		if(err){
			return res.render(__dirname + '/../client/home.ejs',{username:username,filesReceivedResults:""});
		}
		else{
			return res.render(__dirname + '/../client/home.ejs',{username:username,filesReceivedResults:result});
		}
	});
});

app.get('/listofusers',function(req,res){
	// if(typeof req.session.username!=undefined && req.session.username!=null) {   
	// 	console.log("User logged in and hence can view");
	// 	res.render(__dirname + '/../client/userlist.ejs');
	// }
	if(req.user) {   
		console.log("User logged in and hence can view all users on the list");
		UserPasswords.find({},function(err,result) {
			if(err){
				res.sendStatus(500);
			}
			else if(result){
				res.render(__dirname + '/../client/userList.ejs',{user:result});
			}else{
				res.sendStatus(500);
			}	
		});
    }
	else{
		console.log("User is not logged in");
		res.send("You are not currently logged into yobam");
	}
});

app.get('/uploadToUser',function(req,res){
	if(req.user) {   
		console.log("User logged in and hence can upload to users");
		console.log(req.query.uploadUser);
		res.render(__dirname + '/../client/uploadToUser.ejs',{param:req.query});
    }
	else{
		console.log("User is not logged in");
		res.send("You are not currently logged into yobam");
	}
});

app.post('/getFile',function(req,res){
	if(req.user){

	}
});
app.post('/send',upload.single('fileToUpload'),function(req,res){
	if(req.user) {   
		console.log("User logged in and hence can view confirmation of decline of sending to users");
		_fileName = req.file.originalname;
		_filePath = "./public/"+req.file.filename;
		console.log(req.file);
		var date = new Date();
		var timestamp = date.getTime();
		console.log(req);
		console.log(timestamp);
		var senderReceiverFilepathObject = new senderReceiverFilepath({
			sender: req.user.username,
			receiver: req.body.uploadUser,
			fileName: _fileName,
			filePath: _filePath
		});
		senderReceiverFilepathObject.save({},(err,ress)=>{
			if(err){
				console.log(err);
				return res.send("Upload To User Failed Please Retry");
			}
			console.log(ress);
			res.render(__dirname + '/../client/sendConfirm.ejs',{sender:req.user.username,receiver:req.body.uploadUser});
		});
    }
	else{
		console.log("User is not logged in");
		res.send("You are not currently logged into yobam");
	}
});

app.listen(3000,()=>{console.log("Listening on port 3000")});