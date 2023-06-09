// Load required modules
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const ejs = require('ejs');

// Set up Express app
const app = express();

// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Set up passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set up the Google authentication strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/user.birthday.read', 'https://www.googleapis.com/auth/user.addresses.read']
    },
    (accessToken, refreshToken, profile, done) => {
        // This function is called when the user is authenticated
        // You can add your own logic here to save the user to the database or do other things
        return done(null, profile);
    }));

// Set up the Facebook authentication strategy
passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'email', 'photos']
    },
    (accessToken, refreshToken, profile, done) => {
        // This function is called when the user is authenticated
        // You can add your own logic here to save the user to the database or do other things
        return done(null, profile);
    }));

// Set up serialization/deserialization of user object for session management
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Set up a route for the login button
app.get('/auth/google', passport.authenticate('google'));

// Set up a route for the Google callback
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // This function is called after successful authentication
        res.redirect('/');
    });

// Set up a route for the Facebook login button
app.get('/auth/facebook', passport.authenticate('facebook'));

// Set up a route for the Facebook callback
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
        // This function is called after successful authentication
        res.redirect('/');
    });

// Set up a home route with a login button
// Set up a home route with login buttons for both Google and Facebook
// Set up a home route with login buttons for both Google and Facebook
app.get('/', (req, res) => {
    const user = req.user;
    const html = `
    <h1>Google and Facebook Login Demo</h1>
    ${user ? `
      ${user.provider === 'google' ? `
        <table>
          <tr>
            <td>Profile Picture:</td>
            <td><img src="${user.photos[0].value}" alt="Profile Picture"/></td>
          </tr>
          <tr>
            <td>Name:</td>
            <td>${user.displayName}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>${user.emails ? user.emails[0].value : ''}</td>
          </tr>
          ${user.birthday ? `
            <tr>
              <td>Birthday:</td>
              <td>${user.birthday}</td>
            </tr>
          ` : ''}
          ${user._json && user._json.addresses && user._json.addresses.length > 0 ? `
            <tr>
              <td>Address:</td>
              <td>${user._json.addresses[0].formattedValue}</td>
            </tr>
          ` : ''}
        </table>
      ` : ''}
      ${user.provider === 'facebook' ? `
        <table>
          ${user.photos && user.photos.length > 0 ? `
            <tr>
              <td>Profile Picture:</td>
              <td><img src="${user.photos[0].value}" alt="Profile Picture"/></td>
            </tr>
          ` : ''}
          <tr>
            <td>Name:</td>
            <td>${user.displayName}</td>
          </tr>
          ${user.emails && user.emails.length > 0 ? `
            <tr>
              <td>Email:</td>
              <td>${user.emails[0].value}</td>
            </tr>
          ` : ''}
          <tr>
            <td>ID:</td>
            <td>${user.id}</td>
          </tr>
        </table>
      ` : ''}
      <a href="/logout">Log Out</a>
    ` : `
      <a href="/auth/google"><img src="https://developers.google.com/identity/images/btn_google_signin_dark_normal_web.png" alt="Sign in with Google"/></a>
      <a href="/auth/facebook"><img src="https://developers.facebook.com/docs/marketing-apis/assets/images/fb-login.png" alt="Sign in with Facebook"/></a>
    `}
  `;
    res.send(html);
});


// Set up a route for logging out
app.get('/logout', (req, res) => {
    req.logout(() => {});
    res.redirect('/');
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
