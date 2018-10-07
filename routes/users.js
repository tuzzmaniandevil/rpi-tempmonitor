var express = require('express');
var router = express.Router();
var auths = require('../bin/authenticated');
var checkRequired = require('../bin/requiredFields');
var User = require('../schemas/user');
var createError = require('http-errors');

/* GET users listing. */
router.get('/', auths('ADMIN'), function (req, res, next) {
  console.log(req.user);

  User.find({}, function (err, users) {
    console.log(err, users);
    if (err) {
      next(err);
    } else {
      res.render('users', { title: 'Users', users: users });
    }
  });
});

router.post('/', auths('ADMIN'), function (req, res, next) {
  if (checkRequired(req, res, ['username', 'firstName', 'password', 'password_conf'])) {
    if (req.body.password === req.body.password_conf) {
      var newUsername = req.body.username.trim().toLowerCase();
      var role = req.body.role || 'VIEWER';
      role = role.toUpperCase();

      User.findOne({ username: newUsername }).exec(function (err, user) {
        if (err) {
          res.json({
            status: false,
            message: err.message
          });
        } else {
          if (user === null || typeof user === 'undefined') {
            // Cool, We can create the user!
            User.create({
              username: newUsername,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              password: req.body.password,
              roles: [role]
            }, function (err, user) {
              if (err) {
                res.json({
                  status: false,
                  message: err.message
                });
              } else {
                res.json({
                  status: true,
                  message: 'Successfully added user',
                  nextHref: '/users/' + user.id
                });
              }
            });
          } else {
            res.json({
              status: false,
              message: 'A user with the username "' + newUsername + '" already exists',
              fields: ['username']
            });
          }
        }
      });
    } else {
      res.json({
        status: false,
        message: 'Passwords do not match',
        fields: ['password', 'password_conf']
      });
    }
  }
});

/**
 * Display User details
 */
router.get('/:userId', auths('ADMIN'), function (req, res, next) {
  var userId = req.params.userId;

  User.findById(userId).exec(function (err, user) {
    if (err) {
      next(err);
    } else if (user === null || typeof user === 'undefined') {
      next(createError(404));
    } else {
      res.render('user', { title: 'User', user: user });
    }
  });
});

/**
 * Save User Details
 */
router.post('/:userId', auths('ADMIN'), function (req, res) {
  var userId = req.params.userId;

  User.findById(userId).exec(function (err, user) {
    if (err) {
      res.json({
        status: false,
        message: err.message
      });
    } else if (user === null || typeof user === 'undefined') {
      res.json({
        status: false,
        message: 'User not found!'
      });
    } else {
      if (req.body.updateDetails) {
        if (checkRequired(req, res, ['firstName'])) {
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;

          if (res.locals.currentUser.id != user.id && req.body.role) {
            var role = req.body.role || 'VIEWER';
            role = role.toUpperCase();
            user.roles = [role];
          }

          user.save(function (err, updatedUser) {
            if (err) {
              res.json({
                status: false,
                message: err.message
              });
            } else {
              res.json({
                status: true,
                message: 'Successfully updated user'
              });
            }
          });
        }
      } else if (req.body.updatePassword) {
        if (checkRequired(req, res, ['password', 'password_conf'])) {
          if (req.body.password === req.body.password_conf) {
            user.password = req.body.password;

            user.save(function (err, updatedUser) {
              if (err) {
                res.json({
                  status: false,
                  message: err.message
                });
              } else {
                res.json({
                  status: true,
                  message: 'Successfully updated user'
                });
              }
            });
          } else {
            res.json({
              status: false,
              message: 'Passwords do not match',
              fields: ['password', 'password_conf']
            });
          }
        }
      } else {
        res.json({
          status: false,
          message: 'Unknown Request'
        });
      }

    }
  });
});

/**
 * Delete User
 */
router.delete('/:userId', auths('ADMIN'), function (req, res) {
  var userId = req.params.userId;

  User.findByIdAndRemove(userId, function (err, user) {
    if (err) {
      res.json({
        status: false,
        message: err.message
      });
    } else {
      res.json({
        status: true,
        message: 'Successfully deleted user'
      });
    }
  });
});

module.exports = router;