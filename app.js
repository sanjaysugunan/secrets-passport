require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const alert = require("alert");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose= require("passport-local-mongoose");
//installed passport passport-local passport-local-mongoose express-session
//require express-session passport passport-local-mongoose

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
//for express-session
app.use(session({
   secret: "Our little secret.",
   resave: false,
   saveUninitialized: false
 }));
//for passport to initialize to deal with session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/secrets-passportDB");

//for Schema to have a plugin it has to be mongoose.Schema
const  userSchema = new mongoose.Schema({
   email: String,
   password: String
});
//for passport.local.mongoose 
userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User",userSchema);

//passport-local-mongoose configuration
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
   res.render("home");
});

app.get("/login", function(req,res){
   res.render("login");
});

app.get("/register", function(req,res){
   res.render("register");
});

app.get("/secrets", function(req,res){
   //if authenticated then a cookie is made use /secrets requests will be valided
   //cookie will delete after browser session
   if(req.isAuthenticated()){
      res.render("secrets");
   }else{
      res.redirect("/login");
   }
});

app.get("/logout", function(req,res){
   //to end session deletes cookie
   req.logout(function(err){
      if(err){return next(err);}
   });
   res.redirect("/");
})

app.post("/register", function(req,res){
 
 User.register({username: req.body.username}, req.body.password, function(err,user){
   if(err){
      console.log(err);
      res.redirect("/register");
   }else{
      passport.authenticate("local")(req,res, function(){
         res.redirect("/secrets");
      })
   }
 })  
});

app.post("/login", function(req,res){

   const user = new User({
      username: req.body.username,
      password: req.body.password
   });
   //comes from passport
   req.login(user, function(err){
      if(err){
         console.log(err);
      }else{
         passport.authenticate("local")(req,res, function(){
            res.redirect("/secrets");
         });
      }
   });


});


app.listen(3000, function(req,res){
   console.log("Server started on port 3000.");
});