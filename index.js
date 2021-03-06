const http = require('http'),
  url = require('url'),
  fs = require('fs');

//require Express, Morgan middleware
const express = require('express');
morgan = require('morgan');
const app = express();

//body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//morgan
app.use(morgan("common"));

//CORS
const cors = require('cors');
app.use(cors()); // allowing ALL domains to have access

//express validator for server-side validation
const { check, validationResult } = require('express-validator');

//importing auth.js file, passport module & passportjs
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//Integrating Mongoose with REST API w/ require()
const mongoose = require('mongoose'),
  Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

/* allows Mongoose to connect to myFlixDB for CRUD operations on docs within REST API
   mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});
*/
//connects myFlixDB on Atlas to Heroku API
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Hello Node!\n');

  let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';

  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documenation.html');
  } else {
    filePath = 'index.html';
  };

  fs.appendFile('log.txt', 'URL: ' + addr + '/nTimestamp: ' + newDate() + 'n/n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();
  });
});

//express.static to serve documentation.html from public folder
app.use(express.static('public'));

/**
 * ************ CRUD REST API COMMANDS / ENDPOINT DEFINITIONS **************
 */

/**
 * GET: returns a list of ALL movies to the user
 * @returns an array of movie objects
 * @requires passport
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: returns text response at '/' API endpoint
 * @returns message
 */
app.get('/', (req, res) => {
  res.send("It's movie time!");
});

/**
 * GET: returns data for a single movie by title (including description, genre, director, image path URL)
 * @param Title
 * @returns movie object
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: returns data about a genre by name (name, description)
 * @param Name (Genre.Name)
 * @returns genre object
 * @requires passport
 */
app.get('/movies/Genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: returns data about a director by name (name, bio, birth, death)
 * @param Name (Director.Name)
 * @returns director object
 * @requires passport
 */
app.get('/movies/Directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * POST: initial registration for a user; creates and add user details
 * required fields: Username, Password
 * @returns user object
 */
app.post('/users',
  //validation logic
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    //check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    //hashing password & create profile set up
    let hashedPassword = Users.hashPassword(req.body.Password); //hashing

    //create new user
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword, //store only hashed password, not actual password
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

/**
 * GET: returns a list of ALL users
 * @returns an array of user objects
 * @requires passport
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: returns data on a single user object by username
 * @param Username
 * @returns user object
 * @requires passport
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({
    Username: req.params.Username
  })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * PUT: update a user's information, by username
 * @param Username
 * @returns (updated) user object
 * @requires passport
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  //validation for request:
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //if password is given in request body, create hashedPassword
    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate({ Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }, //This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
          res.send('Your information has been updated.');
        }
      });
  });

/**
 * GET: returns a list of favorite movies from the user
 * @param Username
 * @returns an array of user's favorite movies
 * @requires passport
 */
app.get('/users/:Username/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (user) {
        res.status(200).json(user.FavoriteMovies);
      } else {
        res.status(400).send('Could not find favorite movies for this user');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * POST: add a movies to a user's list of favorites
 * @param Username
 * @param MovieID
 * @returns user object (containing updated favorite movies array)
 * @requires passport
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  }, //push user to add a new movie ID into the end of the FavoriteMovies array
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser); //return json object of updated user
      }
    });
});

/**
 * DELETE: removes a movie from user's favorite movies list
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, //return updated document
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser); //return json object of updated user
      }
    });
});

/**
 * DELETE: deletes/ deregisters existing user, by username
 * @param Username
 * @returns success message
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => { //checking if searched-for username even exists
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted. Sad to see you go!');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * ************* END OF REQUEST/ ENDPOINT DEFINITION ***********
 */

/**
 * error-handling function to log all errors to the terminal
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something's wrong!");
});

/**
 * defines port, listening to port 8080
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
