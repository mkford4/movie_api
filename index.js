
//require express, morgan middleware
const express = require('express');
  morgan = require('morgan');
const app = express();

//GET route at '/movies' that returns a JSON object with data on top movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//GET route at '/' returning text response It's movie time!
app.get('/', (req, res) => {
  res.send("It's movie time!");
});

//express.static to serve documentation.html from public folder
app.use(express.static('public'));

//code routes for all endpoints in documentation.html table
app.get('/movies/:title', (req, res) => {
  res.send('Successful GET request returning data on specified movie');
});

app.get('/movies/genre/:genreName', (req, res) => {
  res.send('Successful GET request returning description of specified genre');
});

app.get('/movies/directors/:directorName', (req, res) => {
  res.send('Successful GET request returning information of specified director');
});

app.post('/users/:newUser', (req, res) => {
  //post request
  res.send('Welcome! You are now registered as ' + username +'.');
});

app.put('/users/:username/favorites', (req, res) => {
  res.send(movieTitle + 'has been added to your Favorites list.');
});

app.delete('/users/:username/favorites', (req, res) => {
  res.send(movieTitle + 'has been deleted from your favorites.');
});

app.delete('/users/:username', (req, res) => {
  res.send('Sad to see you go!');
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
