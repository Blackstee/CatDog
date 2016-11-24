var express = require('express');
var router = express.Router();
var User = require ('./user');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.send ('ok');
  //res.render('index', { title: 'Express' });
});

router.post('/login', function (req, res){
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username, password: password}, function (err, user){
    if (err){
      console.log(err);
      return res.status(500).send();
    }
    if (!user) {
      return res.status(404).send();
    }
    req.session.user = user;
    return res.status(200). send();
  })
});

router.get('/dashboard', function(req, res){
  if (!req.session.user){
    return res.status(401).send();
  }
  return res.status(200).send("Welcooome");
})

router.post('/register', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;

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
})

module.exports = router;
