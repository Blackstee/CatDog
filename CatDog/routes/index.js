"use strict"

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var router = express.Router();
const mongodb = require('promised-mongo');
const url = 'mongodb://localhost:27017/test';
const db = mongodb(url);
/* GET home page. */
router.get('/', function(req, res, next) {
	const user = req.session.user;
	res.render('index', { user: user });
});

router.get('/register', (req, res) => res.render("users_index", { user: req.user }));

router.get('/login', (req, res) => res.render("users_login"));

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.get('/register-error', (req, res) => res.end("Register error"));

router.post('/login',
	passport.authenticate('local', { failureRedirect: '/' }),
	(req, res) => res.redirect('/'));

router.post('/upload_avatar',
	(req, res) => {
		let avaObj = req.files.avatar;
		let username = req.user.username;
		let base64String = avaObj.data.toString('base64');
		db.users.findOne({ username: username})
			.then(user => {
				if (user) {
					return db.users.findAndModify({
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

router.post('/register',
	(req, res) => {
		let username = req.body.username;
		let pass = req.body.pass;
		let pass2 = req.body.pass2;
		console.log(username);
		if (!username || !pass || pass !== pass2) {
			res.redirect('/register-error');
		}
		db.users.findOne({ username: username})
			.then(x => {
				if (x) {
					res.end("Such username exists " + JSON.stringify(x));
				} else {
					db.insert({
						username: username,
						passwordHash: hash(pass)
					})
						.then(() => res.redirect('/login'))
						.catch(err => res.status(500).end(err));
				}
			})
			.catch(err => res.status(500).end(err));
	});

router.get('/users', (req, res)=> db.users.find().then(users => res.json(users)));

module.exports = router;
