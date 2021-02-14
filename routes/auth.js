const express = require('express');

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password is not correct.').trim()
      .isLength({ min: 3 })
      
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with at least 3 characters.'
    ).trim()
      .isLength({ min: 3 }),
    body('confirmPassword').trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords dp not match!');
      }
      return true;
    }),
    body('fname', 'Please enter a valid first name of at least 2 letters ').isString().isLength({ min: 2 }).trim(),
    body('lname', 'Please enter a valid last name of at least 2 letters ').isString().isLength({ min: 2 }).trim(),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.get('/email-sent', authController.getEmailSent);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
