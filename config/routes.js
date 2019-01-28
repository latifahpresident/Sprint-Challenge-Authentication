require('dotenv').config();
const axios = require('axios');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConfig.js");

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};


function getToken(user) {
  
  const payload = {
    username: user.username
  };
  // const secret = process.env.JWT_SECRET || 'Why can’t banks keep secrets? There are too many tellers!';
  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: '45m'
  };
  return jwt.sign(payload, secret, options)
}

// function generateToken(payload) {
//   return jwt.sign(
//     payload,
//     process.env.SECRET ||
//       "Why can’t banks keep secrets? There are too many tellers!",
//     {
//       expiresIn: "1hr"
//     }
//   );
// }

function register(req, res) {
 const creds = req.body;

       const hash = bcrypt.hashSync(creds.password, 14);
       creds.password = hash;

       db('users')
         .insert(creds)
         .then(ids => {
           res.status(201).json(ids)
         })
         .catch(err => res.status(500).json(err))
 };


// function register(req, res) {
//   // implement user registration
//   let { username, password } = req.body;

//   if (!username || !password)
//     return res.json({
//       error: true,
//       message: "You need BOTH a username and password."
//     });

//   password = bcrypt.hashSync(password, 3);

//   db("users")
//     .insert({ username, password })
//     .then(([id]) => {
//       let token = getToken({ id });
//       res.json({
//         error: false,
//         message: "User Created Successfully",
//         token
//       });
//     })
//     .catch(err => res.json(err));
// }


 function login(req, res) {
  const creds = req.body;
  db('users').where({ username: creds.username }).first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = getToken(user);
        res.status(200).json({ message: `Welcome ${user.username}`, token })
      } else {
        res.status(401).json({ message: 'You are not authorized to view this page' })
      }
    })
    .catch(err => {console.log(err), res.status(500).json(err)})
}

// function login(req, res) {
//   // implement user login
//   let { username, password } = req.body;

//   if (!username || !password)
//     return res.json({
//       error: true,
//       message: "You need BOTH a username and a password."
//     });

//   db("users")
//     .where({ username: username })
//     .first()
//     .then(user => {
//       if (user && bcrypt.compareSync(password, user.password)) {
//         let token = generateToken(user);
//         res.json({
//           error: false,
//           message: `Welcome ${username}`,
//           token
//         });
//       } else {
//         return register.json({
//           error: true,
//           message: "Login credentials not working."
//         });
//       }
//     })
//     .catch(err => res.json(err));
// }


function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
