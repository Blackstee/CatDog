"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var router = express.Router();
var User = require ('./user');
var Post = require('./post');
var mongoose_delete = require('mongoose-delete');


//===================================HOME PAGE=====================================

router.get('/', function(req, res, next) {
	const user = req.session.user;
	res.render('index', { user: user });
});

//===================================REGISTER======================================

router.get('/register', (req, res) => res.render("register", { user: req.user }));

router.post('/register', function(req, res){
  var username = req.body.username;
  var password = req.body.pass;
  var password2 = req.body.pass2;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  console.log(username);
		if (!username || !password || password !== password2) {
			res.redirect('/register');
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
	newuser.status = "user";
  newuser.save(function(err, savedUser){
    if (err){
      console.log(err);
      return res.status(500).send();
    }
    return res.status(200).send();
  })
	res.redirect ('/login');
}
})
});

router.get('/register-error', (req, res) => res.end("Register error"));

//==================================LOG IN LOG OUT SESSIONS========================

router.get('/login', (req, res) => res.render("login", { user: req.user }));

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');

	return res.status(200).send();
});


router.post('/login', function (req, res){
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function (err, user){
    if (err){
      console.log(err);
			res.redirect ('/login');
      return res.status(500).send();
    }
    if (!user) {
			res.redirect ('/login');
      return res.status(404).send();
    }
    user.comparePassword(password, function(err, isMatch) {
        if (isMatch && isMatch ===  true){
          req.session.user = user;
					console.log ("logged in!!");
					res.redirect ('/');
          return res.status(200).send();
        } else {
					res.redirect ('/login');
					return res.status(401).send();
        }
    });
  })
});

router.get('/dashboard', function(req, res){
  if (!req.session.user){
    return res.status(401).send();
  }
  return res.status(200).send("Welcooome");
})

//===========================================NEW POST==============================

router.get('/dogs/breeds/newpost', (req, res) => res.render("newpostdogs", { user: req.session.user }));

router.post('/dogs/breeds/newpost',	(req, res) => {
	let avaObj = req.files.post;
	let base64String = avaObj.data.toString('base64');
	var newpost = new Post();
			newpost.title = req.body.title;
			newpost.description = req.body.description;
			newpost.image = base64String;
			newpost.save(function(err) {
					if (err)
							res.send(err);
			});
     res.redirect ('/dogs/breeds');
	});

router.get('/cats/breeds/newpost', (req, res) => res.render("newpostcats", { user: req.session.user }));

router.post('/cats/breeds/newpost',	(req, res) => {
	let avaObj = req.files.post;
	let base64String = avaObj.data.toString('base64');
	var newpost = new Post();
			newpost.title = req.body.title;
			newpost.description = req.body.description;
			newpost.image = base64String;
			newpost.save(function(err) {
					if (err)
							res.send(err);
			});
     res.redirect ('/cats/breeds');
	});


//====================================USERS========================================

router.post('/upload_avatar', (req, res) => {
	let avaFile = req.files.avatar;
	let username = req.body.username;
	let base64String = avaFile.data.toString('base64');
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

router.get('/users', (req, res) => {
	User.find()
		.then(users => {
			res.render('users_users', {
				users: users,
				user: req.session.user
			});
		})
		.catch(err => res.status(500).end(err));
});

router.post('/deleteuser', function(req, res){
	var todelete = req.body.username;
	console.log (todelete );
	if (User.findOne({ username: todelete}))
	{

	         	User.findOneAndRemove({username: todelete}, function(err){
           if (!err) {
			        console.log ("yaaaaaa");
               }
              else {
			         console.log ("nooo");
            }
					});

					console.log("Deleted");
				} else {
					console.log ("wrong username");
				}
			res.redirect('/users');
});

//==================================CATS===========================================

router.get('/cats/breeds', function(req, res){
	Post.find()
		.then(posts => {
			res.render('breedscats', {
         posts: posts,
				 user: req.session.user,
			});
		})
		.catch(err => res.status(500).end(err));
});

router.get('/cats/deletepost/:id', function (req, res){
	Post.remove({
					_id: req.params.id
			}, function(err, post) {
					if (err)
							res.send(err);
					res.redirect('/cats/breeds');
			});
});

router.get('/cats/breeds/:id', function(req, res) {
	console.log(req.params.id);
	Post.findById(req.params.id, function(err, post) {
					if (err)
							res.send(err);
					res.render("breed", {post:post, user:req.session.user});
				});
});

router.get('/cats/news', (req, res) => res.render("newscats", { user: req.session.user }));

router.get('/cats/photos', (req, res) => res.render("photoscats", { user: req.session.user }));

router.get('/cats/videos', (req, res) => res.render("videoscats", { user: req.session.user }));

//==================================DOGS===========================================

router.get('/dogs/breeds', function(req, res){
	console.log(req.user);
	Post.find()
		.then(posts => {
			res.render('breedsdogs', {
         posts: posts,
				 user: req.session.user
			});
		})
		.catch(err => res.status(500).end(err));
});

router.get('/dogs/deletepost/:id', function (req, res){
	Post.remove({
					_id: req.params.id
			}, function(err, post) {
					if (err)
							res.send(err);
					res.redirect('/dogs/breeds');
			});
});



router.get('/dogs/breeds/:id', function(req, res) {
	console.log(req.params.id);
	Post.findById(req.params.id, function(err, post) {
					if (err)
							res.send(err);
					res.render("breed", {post:post, user:req.session.user});
				});
});

router.get('/dogs/news', (req, res) => res.render("newsdogs", { user: req.session.user }));

router.get('/dogs/photos', (req, res) => res.render("photosdogs", { user: req.session.user }));

router.get('/dogs/videos', (req, res) => res.render("videosdogs", { user: req.session.user }));

//==================================BLOG===========================================



//=====================================API=========================================



//-----------------------------------CATS------------------------------------------

router.get('/api/cats/breeds', function(req, res){

	 Post.find(function(err, posts) {
					if (err)
							res.send(err);
					res.json(posts);
			});
});

router.post('/api/cats/breeds', function(req, res) {

	var newpost = new Post();
	    newpost.title = req.body.title;
			newpost.description = req.body.description;
			newpost.author = req.user;
			newpost.save(function(err) {
					if (err)
							res.send(err);
			});
});

router.get('/api/cats/breeds/:id', function(req, res) {
	console.log(req.params.id);
	Post.findById(req.params.id, function(err, post) {
					if (err)
							res.send(err);
					res.json(post);
			});
});

router.put('/api/cats/breeds/:id', function (req, res){
	console.log(req.params.id);
	Post.findById(req.params.id, function(err, post) {
					if (err)
							res.send(err);
						post.title = req.body.title;
						post.description = req.body.description;
						post.author = req.body.author;
					post.save(function(err) {
							if (err)
									res.send(err);
							res.json({ message: 'post updated!' });
					});

			});
});

router.delete('/api/cats/breeds/:id', function (req, res){
	Post.remove({
					_id: req.params.id
			}, function(err, bear) {
					if (err)
							res.send(err);
					res.json({ message: 'Successfully deleted' });
			});
});

//-----------------------------------DOGS------------------------------------------
router.get('/api/dogs/breeds', function(req, res){

	 Post.find(function(err, posts) {
					if (err)
							res.send(err);
					res.json(posts);
			});
});

router.post('/api/dogs/breeds', function(req, res) {

	var newpost = new Post();
	    newpost.title = req.body.title;
			newpost.description = req.body.description;
			newpost.author = req.user;
			newpost.save(function(err) {
					if (err)
							res.send(err);
			});
});

router.get('/api/dogs/breeds/:id', function(req, res) {
	console.log(req.params.id);
	Post.findById(req.params.id, function(err, post) {
					if (err)
							res.send(err);
					res.json(post);
			});
});

router.put('/api/dogs/breeds/:id', function (req, res){
	console.log(req.params.id);
	Post.findById(req.params.id, function(err, post) {
					if (err)
							res.send(err);
						post.title = req.body.title;
						post.description = req.body.description;
						post.author = req.body.author;
					post.save(function(err) {
							if (err)
									res.send(err);
							res.json({ message: 'post updated!' });
					});

			});
});

router.delete('/api/dogs/breeds/:id', function (req, res){
	Post.remove({
					_id: req.params.id
			}, function(err, bear) {
					if (err)
							res.send(err);
					res.json({ message: 'Successfully deleted' });
			});
});


module.exports = router;
