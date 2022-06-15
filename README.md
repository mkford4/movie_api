# movie_api
This is a back-end application that provides users with access to information regarding different movies, including various details such as directors, year of release, and top-billed actors.     Similar to IMDb.


**Main Features (with URL endpoints):**
● Returns a list of ALL movies to the user
● Returns data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
● Returns data about a genre (description) by name/title (e.g., “Thriller”)
● Returns data about a director (bio, birth year, death year) by name
● Allows new users to register
● Allows users to update their user info (username, password, email, date of birth)
● Allows users to add a movie to their list of favorites
● Allows users to remove a movie from their list of favorites
● Allows existing users to deregister

**User Stories**
● As a user, I want to be able to receive information on movies, directors, and genres so that I
can learn more about movies I’ve watched or am interested in.
● As a user, I want to be able to create a profile so I can save data about my favorite movies.


**Technical Details:**
● The API is a Node.js and Express application.
● The API uses REST architecture, with URL endpoints corresponding to the data
features listed above
● The API uses multiple middleware modules, including the body-parser package for
reading data from requests and morgan for logging.
● The database is built using MongoDB.
● The business logic is modeled with Mongoose.
● The API provides movie information in JSON format.
● The API includes user authentication and authorization code.
● The API was deployed to Heroku.
