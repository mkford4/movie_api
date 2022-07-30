const jwtSecret = 'your_jwt_secret'; //This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //Your local passport filePath

/**
 * creates JWT (that expires in 7 days & uses HS256 algorithm to encode)
 * @param {object} user 
 * @returns user object, jwt, and additional token info
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //This is the username you're encoding in the JWT
    expiresIn: '7d', //Specifies token expires in 7 days
    algorithm: 'HS256' //Algorithm used to "sign" or encode the values of the JWT
  });
}

/**
 * POST login: handles user login; generates a jwt upon successful login
 * @param {*} router 
 * @returns user object with jwt
 * @requires passport
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        //if user exist, generate JWT
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token }); //returns the generated token
      });
    })(req, res);
  });
}
