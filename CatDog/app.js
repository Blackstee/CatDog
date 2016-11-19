"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const mongodb = require('promised-mongo');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
var routes = require('./routes/index');
var users = require('./routes/users');


var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboyBodyParser({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}))
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/users', users);
/*
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
  if(err) throw err;
    var users = db.collection('catdogusers');

users.insert({ nickname: "autor", password: "autor"}, function(err, docs) {

users.count(function(err, count) {
console.log(format("count = %s", count));
});
});

users.find().toArray(function(err, results) {
console.dir(results);

db.close();
});
});*/

const url = 'mongodb://localhost:27017/test';
const db = mongodb(url);

let sessionSecret = "jahdgalsdg^&(*&^%  _Asds)";


passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	console.log("deserializeUser id: " + id);
	db.users.findOne({ _id: mongodb.ObjectId(id) })
		.then(user => {
			if(user) {
				done(null, user);
			} else {
				done("No user", null);
			}
		})
		.catch(err => done(err, null));
});

passport.use(new LocalStrategy((username, password, done) => {
	  console.log("Local: " + username + " : " + password);
	  db.users.findOne({
			  username: username,
			  passwordHash: hash(password)
		  })
		  	.then(user => {
				console.log(user);
				if (user) {
					done(null, user);
				} else {
					done(null, false);
				}
			})
			.catch(err => {
				console.log(err);
				done(err, null);
			});
}));

const salt = 'sid_fhKJG-=-*&8734';

function hash(pass) {
	return crypto.createHash('md5').update(pass + salt).digest("hex");
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/*var mongoose = require('mongoose'),
    User = require('./user-model');

var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});
/*
// create a user a new user
var testUser = new User({
    username: 'jmar2',
    password: 'Password2'
});

// save user to database
testUser.save(function(err) {
    if (err) throw err;
    User.getAuthenticated('jmar2', 'Password3', function(err, user, reason) {
        if (err) throw err;
        //success
        if (user) {
            console.log('login success');
            return;
        }

        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
            case reasons.PASSWORD_INCORRECT:
                console.log ('failed! Try again');
                break;
            case reasons.MAX_ATTEMPTS:
                console.log ('too much attempts');
                break;
        }
    });
});

*/
app.post('/register', (req, res) => {
	let username = req.body.username;
	let pass = req.body.pass;
	let pass2 = req.body.pass2;
	if (!username || !pass || (pass !== pass2)) res.status(400).end('not ok');
	else {
		db.User.findOne({ username: username})
			.then(User => {
				if (User) res.status(200).end('user exists');
				else {
					return db.sers.insert({
						username: username,
						password: crypto.createHash('md5').update(pass + salt).digest("hex")
					});
				}
			})
			.then(() => res.redirect('/profile'))
			.catch(err => res.status(500).end(err));
	}
});


module.exports = app;
