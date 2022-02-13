
const http = require('http'),
  url = require('url'),
  fs = require('fs');

//require Express, Morgan middleware
const express = require('express');
  morgan = require('morgan');
const app = express();

const bodyParser = require('body-parser');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//morgan
app.use(morgan("common"));

//Integrating Mongoose with REST API w/ require()
const mongoose = require('mongoose'),
  Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//allows Mongoose to connect to myFlixDB for CRUD operations on docs within REST API
mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
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

  fs.readFile(filePath, (err,data) => {
  if (err) {
    throw err;
    }
  response.writeHead(200, {'Content-Type' : 'text/html'});
  response.write(data);
  response.end();
  });
});


//GETs all Movies from Mongoose model
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET route at '/' returning text response It's movie time!
app.get('/', (req, res) => {
  res.send("It's movie time!");
});

//express.static to serve documentation.html from public folder
app.use(express.static('public'));

//code routes for all endpoints in documentation.html table
//Returns data for a single Movie with Mongoose
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Return data about a genre description by genre name
app.get('/movies/Genre/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Return all data about a director by director name
app.get('/movies/Directors/:Name', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Add a user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user) })
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

//Returns a list of ALL users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get a user by Username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username
})
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Update a user's info, by username
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
  {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, //This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
      res.send('Your information has been updated.');
    }
  });
});

//Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
    }, //push used to add a new movie ID into the end of the FavoriteMovies array
    { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Removes a movie from a FavoriteMovies list for users
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/* app.put('/users/:username/favorites', (req, res) => {
  res.send(movieTitle + 'has been added to your Favorites list.');
}); */

/*
app.delete('/users/:username/favorites', (req, res) => {
  res.send(movieTitle + 'has been deleted from your favorites.');
}); */

//Removes a user/ Allows user to deregister
app.delete('/users/:Username', (req, res) => {
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



//error-handling function to log all errors to the terminal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something's wrong!");
});

//listen
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
