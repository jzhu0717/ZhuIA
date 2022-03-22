//RUN ON http://localhost:8080/
//or port
//full file path: 
//node /Cod/NodeTesting2/server/coolApp.js

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

//imports
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');

const mysql = require('mysql');

const sqlUser = 'root';
const sqlHost = '127.0.0.1'; 
const sqlPswd = 'password';
const sqlDbName = 'poopdb';

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const db = mysql.createPool({
  connectionLimit: 100,
  user: sqlUser, 
  host: sqlHost,
  password: sqlPswd,
  database: sqlDbName
});

db.getConnection((err, connection) => {
  if(err){
      console.log('Unable to Connect to Database', err);
  } else{
      console.log('Connected to mySQL Database! ID:' + connection.threadId);
  }

});

//express server setup~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const express = require('express');
const router = express.Router();
const server = express();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const bcrypt = require('bcrypt');

const port = 8080;
const address = '192.168.1.1';

server.use(express.static(__dirname + 'static'));


server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(cors());
server.use('/', router);
server.use(express.urlencoded({ extended: true }));
server.use(express.json());


//JSON read/write data~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const users = [];

function jsonWrite(text){
  
  fs.writeFileSync('./users.json', JSON.stringify(text));
};

function jsonRead(path){
  const fileContent = fs.readFileSync(path);
  const array = JSON.parse(fileContent);
  

  return(array);
};

//server config~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

server.set('view-engine', 'ejs');
server.use(bodyParser.json());
server.use(flash());
server.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true, 
  saveUninitialized: true
}));
server.use(passport.initialize());
server.use(passport.session());

//get~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

server.get('/', (req, res) => {
  
  res.render(__dirname+'/login.ejs');

});

server.get('/signup', (req, res) => {
  
  res.render(__dirname+'/signup.ejs');

});

server.get('/adminAdd', (req, res) => {
  
  res.render(__dirname+'/adminAdd.ejs');

});

server.get('/edit/:userId', (req, res) => {
  const userId = req.params.userId;
  
  let query = db.query(`SELECT * FROM userinfo WHERE id = ${userId}`,(err, result) => {
    if(err){
        
      console.log(err);
      return;
    }
    res.render(__dirname+'/adminEdit.ejs', {
      user: result[0]
    }); 
  });
});

server.get('/editRestrict/:userId', (req, res) => {
  const userId = req.params.userId;
  
  let query = db.query(`SELECT * FROM userinfo WHERE id = ${userId}`,(err, result) => {
    if(err){
        
      console.log(err);
      return;
    }
    res.render(__dirname+'/edit.ejs', {
      user: result[0]
    }); 
  });
});

server.get('/delete/:userId', (req, res) => {
  const userId = req.params.userId;
  
  let query = db.query(`DELETE FROM userinfo WHERE id = ${userId}`,(err, result) => {
    if(err){
        
      console.log(err);
      return;
    }
    req.session.loggedin = true;
    res.redirect('/adminHome');
  });
});

server.get('/deleteRestrict/:userId', (req, res) => {
  const userId = req.params.userId;
  
  let query = db.query(`DELETE FROM userinfo WHERE id = ${userId}`,(err, result) => {
    if(err){
        
      console.log(err);
      return;
    }
    res.redirect('/');
  });
});

server.get('/testPage', (req, res) => {
  
  res.render(__dirname+'/testPage.ejs');

});

server.get('/redir', (req, res) => {
  
  res.render(__dirname+'/redir.ejs');

});
server.get('/home', (req, res) => {
  const id = req.body.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const rating = req.body.rating;

  let query = db.query(`SELECT * FROM userinfo WHERE email = ${emailIn}`, (err, rows) => {
    if(err){
        
      console.log(err);
      return;
    } 
    if(req.session.loggedin) {
      res.render(__dirname+'/home.ejs' , {
        id:id,
        firstName:firstName,
        lastName:lastName,
        email:email,
        position:'employee',
        rating:rating,
        users: rows
      });
  
    } else{
      res.render(__dirname+'/redir.ejs');
    }
  });
});

server.get('/adminHome', (req, res) => {
  const id = req.body.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const rating = req.body.rating;


  let query = db.query('SELECT * FROM userinfo', (err, rows) => {
    if(err){
        
      console.log(err);
      return;
    } 
    if(req.session.loggedin) {
      res.render(__dirname+'/adminHome.ejs' , {
        id:id,
        firstName:firstName,
        lastName:lastName,
        email:email,
        position:'employee',
        rating:rating,
        users: rows
      });
  
    } else{
      res.render(__dirname+'/redir.ejs');
    }
  });

});

server.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
  console.log('>Logged Out!')
});

//POST~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

server.post('/signup', async (req, res) => {
  
  console.log(users);
  console.log(req.body.firstName);
  console.log(req.body.lastName)
  console.log(req.body.email);
  console.log(req.body.password);
  
});

server.post('/save', async (req, res) => {
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const position = req.body.position;

  
  res.render(__dirname+'/testPageAdmin.ejs');

  console.log(req.body);
  
  const arr = jsonRead('./users.json');

  jsonWrite(JSON.stringify(req.body));
  
    db.query(
      'INSERT INTO userinfo (firstName, lastName, email, password, position, rating) VALUES (?, ?, ?, ?, ?, 0)',
      [firstname, lastname, email, password, position],
      (err) => {
        if(err){
          console.log(err);
        }
        console.log("Values Inserted Into Database");
      });

  
});

server.post('/update', async (req, res) => {
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const position = req.body.position;
  const rating = req.body.rating;
  const userId = req.body.id;
  
  console.log(req.body);
  
  const arr = jsonRead('./users.json');

  jsonWrite(JSON.stringify(req.body));
  
  let query = db.query(
    "UPDATE userinfo SET firstName='"+firstname+"', lastName='"+lastname+"', email ='"+email+"', password ='"+password+"', position ='"+position+"', rating ='"+rating+"' WHERE id = "+userId, (err, results) => {
      if(err){
        console.log(err);
      }
      req.session.loggedin = true;
      res.redirect('/adminHome')
    });
});

server.post('/updateRes', async (req, res) => {
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const position = req.body.position;
  const userId = req.body.id;
  
  console.log(req.body);
  
  const arr = jsonRead('./users.json');

  jsonWrite(JSON.stringify(req.body));
  
  let query = db.query(
    "UPDATE userinfo SET firstName='"+firstname+"', lastName='"+lastname+"', email ='"+email+"', password ='"+password+"', position='"+position+"' WHERE id = "+userId, (err, results) => {
      if(err){
        console.log(err);
      }
      res.redirect('/home')
    });
});

server.post('/testPage', (req, res) => {
  res.render(__dirname+'/testPage.ejs');

  console.log(req.body);
  
  const arr = jsonRead('./users.json');


  jsonWrite(JSON.stringify(req.body));
  
  const firstname = req.body.firstName;
  const lastname = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

    db.query(
      'INSERT INTO userinfo (firstName, lastName, email, password, position, rating) VALUES (?, ?, ?, ?, "employee", 0)',
      [firstname, lastname, email, password],
      (err) => {
        if(err){
          console.log(err);
        }
        console.log("Values Inserted Into Database");
      });
});

server.post('/auth', (req, res) => {
  
  //variables
    const email = req.body.email;
    const password = req.body.password;

    const adminEmail = 'useradmin1@gmail.com';
    const adminPassword = 'admin_p12';
  

  if(email && password){

    //ADMIN LOGIN
    if(email === adminEmail && password === adminPassword){
      db.query(
        'SELECT * FROM userinfo WHERE position = "Administrator"',
        (err, result) => {
          if(err){
            
            console.log(err);
            return;
          } 
          if(result.length > 0) {
            req.session.loggedin = true;
            req.session.email = email;
  
            res.redirect('/adminHome');
            console.log(">Logged in as admin!");
  
          } else {
            res.redirect('/');
            console.log('>Login failed');
            alert('Incorrect Username or Password');
          }
          res.end();
        });

    } else { //EMPLOYEE LOGIN
      db.query(
        'SELECT * FROM userinfo WHERE email = ? AND password = ?',
        [email, password],
        (err, result) => {
          if(err) {
            
            console.log(err);
            return;
          } 
          if(result.length > 0) {
            //res.send(result);
            req.session.loggedin = true;
            req.session.email = email;
  
            res.redirect('/home');
            console.log(">Logged in as " + email);
            emailIn = ('\"'+email+'\"');
          } 
          //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          else {
            
            res.redirect('/');
            console.log('>Login failed');
            
          }
          res.end();
        });
    }
  } else {
    res.send('Please enter email and password');
    res.end();
  }
});

//Server listen
server.listen(port , () => {
    console.log(`Server listening on ${address}:${port}`);
  
  }); //listen closer
