
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

//error-handling function to log all errors to the terminal
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send("Something's wrong!"");
});
