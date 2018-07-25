const express = require('express');
const app = express();
var mongoose = require("mongoose");
var cors = require("cors");
app.use(cors());
var bodyParser = require("body-parser");
mongoose.Promise = require("q").Promise;
mongoose.connect("mongodb://localhost:27017/users");
require("./models/users.js");
const User = mongoose.model("users");
const Message = mongoose.model("messages");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var db = mongoose.connection;
db.on("error", function() {
  console.log("error happened");
});
db.on("open", function() {
  console.log("connection established");
});


app.get('/messages/:username',function(req,res){
  Message.find({recipient:req.params.username}).then(msgs=>{
    res.send(msgs);
  }).catch(()=>{
    res.send("no messages");
  })

});
app.get('/users/:user',function(req,res){
  User.findOne({
      username:req.params.user
  }).then(user=>{
  res.send(user);

  }).catch(()=>{
      res.send("user not found");
  })
});

app.get('/msgs/:id',function(req,res){
  //console.log("PPP");
  //console.log(req.params.id)
  Message.findOne({_id:req.params.id}).then(msgs=>{
  //console.log(msgs)
    res.send(msgs);
  }).catch(()=>{
    res.send("no messages");
  })

});
app.post('/reply/:id',function(req,res){
   Message.findOne({_id:req.params.id}).then(msgs=>{
     msgs.replys.push(req.body.reply);
     msgs.save().then(msg => {
       console.log(msg);
      res.send(msg);
     })
   }).catch(()=>{
     res.send("no messages");
   })
 });

app.get('/delete/:id',function(req,res){
  Message.findOne({_id:req.params.id}).remove(msg=>{
    res.send(true);
  }).catch(()=>{
    res.send("no message deleted");
  })

});
app.get('/favorite/:id',function(req,res){
  Message.findOne({_id:req.params.id}).then(msgs=>{
  msgs.favorite = true;
  msgs.save().then(function(msg){
    res.send(msg);
   })
  }).catch(()=>{
    res.send("no messages");
  })

});
app.post('/update',function(req,res){
  User.findOne({
      username:req.body.username
  }).then(user=>{
      user.username= req.body.username,
      user.password= req.body.password,
      user.firstname= req.body.firstname,
      user.lastname= req.body.lastname,
      user.email= req.body.email,
      user.phone= req.body.phone,
      user.location= req.body.location
      user.save().then(
          user=>{
            res.send(user);               
          }
      );
  });
});

app.post("/login", function(req, res) {
  console.log(req.body.loginform.username);
  User.findOne({
    username: req.body.loginform.username
  }).then(user => {
    if (
      user.username == req.body.loginform.username &&
      user.password == req.body.loginform.password
    ) {
      res.send(user);
    } else {
      res.send(false);
    }
  });
});

app.post("/register", function(req, res) {
  var newUser = {
    username: req.body.registerform.username,
    password: req.body.registerform.password,
    firstname: req.body.registerform.firstname,
    lastname: req.body.registerform.lastname,
    email: req.body.registerform.email,
    phone: req.body.registerform.phone,
    location: req.body.registerform.location
  };
  new User(newUser).save().then(function(user) {
    res.send(true);
  });
});
app.listen(3000, function() {
  console.log("server running @ localhost:3000");
});
