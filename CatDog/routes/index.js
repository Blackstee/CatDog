"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var router = express.Router();
var User = require ('./user');
/* GET home page. */
router.get('/', function(req, res, next) {
	const user = req.session.user;
	res.render('index', { user: user });
});

router.get('/register', (req, res) => res.render("register", { user: req.user }));

router.get('/tologin', (req, res) => res.render ("login"));

router.get('/login', (req, res) => res.render("users_login"));

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');

	return res.status(200).send();
});

router.get('/register-error', (req, res) => res.end("Register error"));

router.post('/login', function (req, res){
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function (err, user){
    if (err){
      console.log(err);
      return res.status(500).send();
    }
    if (!user) {
      return res.status(404).send();
    }
    user.comparePassword(password, function(err, isMatch) {
        if (isMatch && isMatch == true){
          req.session.user = user;
          return res.status(200).send();
        } else {
          return res.status(401).send();
        }
        res.redirect('/');
    });
  })
});

router.get('/dashboard', function(req, res){
  if (!req.session.user){
    return res.status(401).send();
  }
  return res.status(200).send("Welcooome");
})

router.post('/upload_avatar',
	(req, res) => {
		let avaObj = req.files.avatar;
		let username = req.user.username;
		let base64String = avaObj.data.toString('base64');
		User.findOne({ username: username})
			.then(user => {
				if (user) {
					return User.findAndModify({
					    query: { username: username },
					    update: { $set: { avatar: base64String } },
					    new: false
					});
				}
				else {
					res.status(400).end('user not exists');
				}
			})
			.then(() => res.redirect('/'))
			.catch(err => res.status(500).end(err));
	});

router.post('/register', function(req, res){
  var username = req.body.username;
  var password = req.body.pass;
  var password2 = req.body.pass2;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  console.log(username);
		if (!username || !password || password !== password2) {
			res.redirect('/register-error');
		}
  User.findOne({ username: username})
			.then(x => {
				if (x) {
					res.end("Such username exists " + JSON.stringify(x));
				} else {
  var newuser = new User ();
  newuser.username = username;
  newuser.password = password;
  newuser.firstname = firstname;
  newuser.lastname = lastname;
  newuser.save(function(err, savedUser){
    if (err){
      console.log(err);
      return res.status(500).send();
    }
    return res.status(200).send();
  })
}
})
})

router.get('/users', (req, res)=> User.find().then(users => res.json(users)));

module.exports = router;
